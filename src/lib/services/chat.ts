import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { API_URL, fetchApi } from '../api';

class ChatService {
    private client: Client | null = null;
    private connected = false;
    private messageListeners: ((message: any) => void)[] = [];
    private statusListeners: ((statusUpdate: any) => void)[] = [];
    private pendingDeliveries: Set<number> = new Set(); // Track in-flight deliver calls
    private pendingSeen: Set<number> = new Set(); // Track in-flight seen calls

    connect() {
        const token = useAuthStore.getState().token;
        if (!token || this.connected) return;

        // Use SockJS as fallback
        const socketFactory = () => new SockJS(`${API_URL.replace('/api', '')}/ws`);

        this.client = new Client({
            webSocketFactory: socketFactory,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: function (str) {
                // Only log important STOMP messages
                if (str.includes('CONNECTED') || str.includes('ERROR')) {
                    console.log(str);
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
            console.log('Chat WebSocket connected');
            this.connected = true;

            // Fetch initial unread count
            this.updateGlobalUnreadCount();

            // Subscribe to user-specific queue
            this.client?.subscribe('/user/queue/messages', (message: IMessage) => {
                const body = JSON.parse(message.body);
                const currentUser = useAuthStore.getState().user;
                const activeConversationId = useChatStore.getState().activeConversationId;

                // If this is a new message TO us (not from us), handle delivery acknowledgment
                if (currentUser && body.senderId !== Number(currentUser.id) && body.status !== 'DELETED') {
                    if (activeConversationId && body.senderId === activeConversationId) {
                        // User is actively viewing this chat → mark as SEEN directly
                        this.markAsSeen(body.senderId);
                        this.markAsRead(body.senderId);
                    } else {
                        // User is NOT viewing this chat → mark as DELIVERED only
                        this.markAsDelivered([body.senderId]);
                        this.updateGlobalUnreadCount();
                    }
                }

                // Notify all message listeners (for UI updates)
                this.messageListeners.forEach(listener => listener(body));
            });

            // Subscribe to delivery status updates (for sender to see tick changes)
            this.client?.subscribe('/user/queue/status', (message: IMessage) => {
                const body = JSON.parse(message.body);
                console.log('Status update received:', body);
                // Notify all status listeners
                this.statusListeners.forEach(listener => listener(body));
            });
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.activate();
    }

    addMessageListener(listener: (message: any) => void) {
        this.messageListeners.push(listener);
    }

    removeMessageListener(listener: (message: any) => void) {
        this.messageListeners = this.messageListeners.filter(l => l !== listener);
    }

    addStatusListener(listener: (statusUpdate: any) => void) {
        this.statusListeners.push(listener);
    }

    removeStatusListener(listener: (statusUpdate: any) => void) {
        this.statusListeners = this.statusListeners.filter(l => l !== listener);
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.connected = false;
        }
    }

    sendMessage(recipientId: number, content: string) {
        if (this.client && this.client.connected) {
            const chatMessage = {
                senderId: useAuthStore.getState().user?.id,
                recipientId: recipientId,
                content: content
            };
            this.client.publish({
                destination: "/app/chat",
                body: JSON.stringify(chatMessage)
            });
        } else {
            console.error("Chat is not connected");
        }
    }

    async getConversations(page = 0, size = 10, search = '', unreadOnly = false) {
        const query = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        });
        if (search) {
            query.append('search', search);
        }
        if (unreadOnly) {
            query.append('unreadOnly', 'true');
        }
        return await fetchApi(`/chat/conversations?${query.toString()}`);
    }

    async getChatHistory(userId: number) {
        const response = await fetchApi(`/chat/history/${userId}`);
        this.updateGlobalUnreadCount();
        return response;
    }

    async getUnreadCount() {
        return await fetchApi('/chat/unread-count');
    }

    async updateGlobalUnreadCount() {
        try {
            const data = await this.getUnreadCount();
            useChatStore.getState().setGlobalUnreadCount(data.count);
        } catch (error) {
            console.error("Failed to update unread count", error);
        }
    }

    async deleteMessage(id: number) {
        return await fetchApi(`/chat/message/${id}`, { method: 'DELETE' });
    }

    async getConnections(search?: string) {
        return await fetchApi(`/connections/accepted?size=100&search=${search || ''}`);
    }

    async deleteConversation(userId: number) {
        return await fetchApi(`/chat/conversation/${userId}`, { method: 'DELETE' });
    }

    async markAsRead(senderId: number) {
        return await fetchApi(`/chat/read/${senderId}`, { method: 'PUT' });
    }

    // Guard against duplicate concurrent calls
    async markAsDelivered(senderIds: number[]) {
        // Filter out senders that already have a pending deliver call
        const newSenderIds = senderIds.filter(id => !this.pendingDeliveries.has(id));
        if (newSenderIds.length === 0) return;

        // Mark as pending
        newSenderIds.forEach(id => this.pendingDeliveries.add(id));

        try {
            await fetchApi('/chat/messages/deliver', {
                method: 'PUT',
                body: JSON.stringify({ senderIds: newSenderIds }),
            });
        } catch (error) {
            console.error("Failed to mark messages as delivered", error);
        } finally {
            // Clear pending flag
            newSenderIds.forEach(id => this.pendingDeliveries.delete(id));
        }
    }

    // Guard against duplicate concurrent calls
    async markAsSeen(senderId: number) {
        if (this.pendingSeen.has(senderId)) return;
        this.pendingSeen.add(senderId);

        try {
            await fetchApi(`/chat/messages/seen/${senderId}`, { method: 'PUT' });
        } catch (error) {
            console.error("Failed to mark messages as seen", error);
        } finally {
            this.pendingSeen.delete(senderId);
        }
    }

    async sendMessageWithPhotos(recipientId: number, content: string, files: File[]) {
        const token = useAuthStore.getState().token;
        const formData = new FormData();
        formData.append('recipientId', recipientId.toString());
        formData.append('content', content);
        files.forEach(file => formData.append('files', file));

        const response = await fetch(`${API_URL}/chat/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to upload photos');
        }

        return response.json();
    }
}

export const chatService = new ChatService();
