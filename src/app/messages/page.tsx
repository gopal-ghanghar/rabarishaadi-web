'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ClientRouteGuard from '@/components/auth/ClientRouteGuard';
import { chatService } from '@/lib/services/chat';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { fetchApi } from '@/lib/api';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    TextField,
    IconButton,
    Paper,
    Badge,
    InputAdornment,
    useTheme,
    useMediaQuery,
    Tab,
    Tabs,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemButton,
    Dialog,
    DialogTitle,
    Divider,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import {
    Send as SendIcon,
    Search as SearchIcon,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    AttachFile as AttachFileIcon,
    SentimentSatisfied as EmojiIcon,
    MoreHoriz as MoreIcon,
    Description as FileIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import MessageStatusIcon from '@/components/messages/MessageStatusIcon';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import Popover from '@mui/material/Popover';
import PhotoGrid from '@/components/messages/PhotoGrid';
import PhotoLightbox from '@/components/messages/PhotoLightbox';

interface Attachment {
    id: number;
    fileName: string;
    originalName: string;
    fileSize: number;
    contentType: string;
    url: string;
}

interface ChatMessage {
    id: number;
    senderId: number;
    recipientId: number;
    content: string;
    timestamp: string;
    status: 'SENT' | 'DELIVERED' | 'SEEN' | 'DELETED';
    deliveryStatus?: 'SENT' | 'DELIVERED' | 'SEEN';
    attachments?: Attachment[];
}

interface Conversation {
    userId: number;
    name: string;
    profilePicture?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    online?: boolean;
}

export default function ChatPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const { setActiveConversationId } = useChatStore();
    const searchParams = useSearchParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isExtraLarge = useMediaQuery(theme.breakpoints.up('xl'));

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxAttachments, setLightboxAttachments] = useState<Attachment[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const openMenu = Boolean(anchorEl);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [mobileShowChat, setMobileShowChat] = useState(false);
    const [hoverMessageId, setHoverMessageId] = useState<number | null>(null);

    // New Chat State
    const [openNewChat, setOpenNewChat] = useState(false);
    const [connections, setConnections] = useState<any[]>([]);
    const [searchContact, setSearchContact] = useState('');
    const [filteredConnections, setFilteredConnections] = useState<any[]>([]);

    // Delete Confirmation State
    // Delete Confirmation State
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
    const [openConversationDeleteConfirm, setOpenConversationDeleteConfirm] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState<number | null>(null);

    // Pagination State
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchConversations = async (pageNum = 0, isReset = false) => {
        try {
            setLoading(true);
            const data = await chatService.getConversations(pageNum, 15, debouncedSearch, tabValue === 1);
            const newConvs = data.content || [];

            setConversations(prev => {
                let merged = [];
                if (isReset || pageNum === 0) {
                    merged = newConvs;
                } else {
                    const existingIds = new Set(prev.map(c => c.userId));
                    const filtered = newConvs.filter((c: Conversation) => !existingIds.has(c.userId));
                    merged = [...prev, ...filtered];
                }

                // Crucial fix: Check if we have an active conversation that is NOT in the new list
                // This happens when we start a new chat with someone we haven't messaged yet
                // Preserve active conversation only on "All" tab (not unread filter)
                if (activeConversationRef.current && tabValue === 0) {
                    const activeId = activeConversationRef.current.userId;
                    const exists = merged.find((c: Conversation) => c.userId === activeId);
                    if (!exists) {
                        // If active conversation isn't in the fetched list, keep it!
                        console.log("Preserving active temporary conversation:", activeConversationRef.current);
                        merged = [activeConversationRef.current, ...merged];
                    }
                }
                return merged;
            });
            setHasMore(!data.last);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    // Pagination effect
    useEffect(() => {
        if (page > 0) {
            fetchConversations(page);
        }
    }, [page]);

    // Tab and Search change effect
    useEffect(() => {
        setPage(0);
        setHasMore(true);
        fetchConversations(0, true);
    }, [tabValue, debouncedSearch]);

    // Refs for stale closure fix
    const activeConversationRef = useRef<Conversation | null>(null);
    const userRef = useRef<any>(null);

    // Link active conversation to store for global Unread handling
    useEffect(() => {
        activeConversationRef.current = activeConversation;
        if (activeConversation) {
            setActiveConversationId(activeConversation.userId);
            // Also mark as read immediately when switching
            chatService.markAsRead(activeConversation.userId).then(() => {
                chatService.updateGlobalUnreadCount();
            });
        } else {
            setActiveConversationId(null);
        }
    }, [activeConversation, setActiveConversationId]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Initial load - Fetch conversations and setup socket
    useEffect(() => {
        fetchConversations(0, true);




        const handleMessage = (message: any) => {
            handleIncomingMessage(message);
        };

        const handleStatusUpdate = (statusUpdate: any) => {
            if (statusUpdate.type === 'STATUS_UPDATE' && statusUpdate.messageIds) {
                setMessages(prev => prev.map(msg => {
                    if (statusUpdate.messageIds.includes(msg.id)) {
                        return { ...msg, deliveryStatus: statusUpdate.status };
                    }
                    return msg;
                }));
            }
        };

        chatService.addMessageListener(handleMessage);
        chatService.addStatusListener(handleStatusUpdate);
        chatService.connect();

        return () => {
            chatService.removeMessageListener(handleMessage);
            chatService.removeStatusListener(handleStatusUpdate);
            chatService.disconnect();
            setActiveConversationId(null);
        };
    }, []);

    // URL-Driven State Management
    useEffect(() => {
        if (loading) return;

        const targetUserId = searchParams.get('userId');

        // Case 1: URL has no userId -> Clear active conversation
        if (!targetUserId) {
            if (activeConversation) {
                setActiveConversation(null);
                setMobileShowChat(false);
            }
            return;
        }

        const userId = parseInt(targetUserId);

        // Case 2: URL matches current active conversation -> Do nothing
        if (activeConversation?.userId === userId) return;

        // Case 3: Switch conversation based on URL
        const existing = conversations.find(c => c.userId === userId);
        if (existing) {
            console.log("Switching to existing conversation:", userId);
            selectConversation(existing);
        } else {
            console.log("Fetching profile for new conversation:", userId);
            // Case 4: Deep link to user not in list -> Fetch profile
            fetchApi(`/profile/user/${userId}`).then((profile: any) => {
                console.log("Fetched profile:", profile);
                const newConv: Conversation = {
                    userId: profile.userId || userId, // Fallback to URL userId if missing in profile
                    name: `${profile.firstName} ${profile.lastName}`.trim(),
                    profilePicture: profile.profilePicture,
                    lastMessage: '',
                    lastMessageTime: '',
                    unreadCount: 0,
                    online: profile.online || false
                };
                // Add to conversations list so it persists
                setConversations(prev => {
                    if (prev.find(c => c.userId === newConv.userId)) return prev;
                    return [newConv, ...prev];
                });
                selectConversation(newConv);
            }).catch((err: any) => console.error("Failed to load profile for chat", err));
        }
    }, [searchParams, loading, conversations, activeConversation]);



    const handleIncomingMessage = (message: ChatMessage) => {
        const currentActive = activeConversationRef.current;
        const currentUser = userRef.current;

        if (message.status === 'DELETED') {
            setMessages(prev => prev.filter(m => m.id !== message.id));
            setConversations(prev => {
                return prev.map(c => {
                    if (c.lastMessage === message.content) {
                        return { ...c, lastMessage: 'Message deleted' };
                    }
                    return c;
                });
            });
            return;
        }

        if (currentActive && (message.senderId === currentActive.userId || message.senderId === Number(currentUser?.id))) {
            setMessages(prev => {
                // Prevent duplicates — skip if message with same ID already exists
                if (message.id && prev.some(m => m.id === message.id)) {
                    return prev;
                }
                return [...prev, message];
            });
            scrollToBottom();
        }

        setConversations(prev => {
            const index = prev.findIndex(c => c.userId === (message.senderId === Number(currentUser?.id) ? message.recipientId : message.senderId));

            if (index !== -1) {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    lastMessage: message.content,
                    lastMessageTime: message.timestamp,
                    unreadCount: (message.senderId !== Number(currentUser?.id) && (!currentActive || currentActive.userId !== message.senderId))
                        ? updated[index].unreadCount + 1
                        : updated[index].unreadCount
                };
                const [moved] = updated.splice(index, 1);
                updated.unshift(moved);
                return updated;
            }
            return prev;
        });
    };

    const selectConversation = async (conversation: Conversation) => {
        setActiveConversation(conversation);
        setMobileShowChat(true);

        try {
            // getChatHistory backend already marks messages as SEEN
            // and sends WebSocket status notification to the sender
            const history = await chatService.getChatHistory(conversation.userId);
            setMessages(history);
            scrollToBottom();

            setConversations(prev => prev.map(c =>
                c.userId === conversation.userId ? { ...c, unreadCount: 0 } : c
            ));
        } catch (error) {
            console.error("Failed to load chat history", error);
        }
    };

    const sendMessage = async () => {
        if ((!newMessage.trim() && selectedFiles.length === 0) || !activeConversation) return;

        if (selectedFiles.length > 0) {
            // Upload photos with optional text
            setUploading(true);
            try {
                await chatService.sendMessageWithPhotos(
                    activeConversation.userId,
                    newMessage.trim(),
                    selectedFiles
                );
                setNewMessage('');
                setSelectedFiles([]);
            } catch (error: any) {
                alert(error.message || 'Failed to upload photos');
            } finally {
                setUploading(false);
            }
        } else {
            // Text-only message via WebSocket
            chatService.sendMessage(activeConversation.userId, newMessage);
            setNewMessage('');
        }
    };

    const handleDeleteMessageClick = (id: number) => {
        setMessageToDelete(id);
        setOpenDeleteConfirm(true);
    };

    const confirmDeleteMessage = async () => {
        if (messageToDelete) {
            // Optimistic update for immediate feedback
            setMessages(prev => prev.filter(m => m.id !== messageToDelete));

            await chatService.deleteMessage(messageToDelete);
            // Backend will also send DELETED event, handleIncomingMessage should handle duplicate/check if missing
        }
        setOpenDeleteConfirm(false);
        setMessageToDelete(null);
    };

    const handleDeleteMessage = async (id: number) => {
        // Deprecated, replaced by confirmDeleteMessage flow
        // kept for reference or if we want direct delete
        // if (!confirm('Are you sure you want to delete this message?')) return;
        // try {
        //     await chatService.deleteMessage(id);
        //     setMessages(prev => prev.filter(m => m.id !== id));
        // } catch (error) {
        //     console.error('Failed to delete message', error);
        // }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const formatTime = (isoString: string) => {
        try {
            return format(new Date(isoString), 'h:mm a');
        } catch (e) {
            return '';
        }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, userId: number) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedConversationId(userId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedConversationId(null);
    };

    const handleDeleteConversationClick = () => {
        if (selectedConversationId) {
            setConversationToDelete(selectedConversationId);
            setOpenConversationDeleteConfirm(true);
        }
        handleMenuClose();
    };

    const confirmDeleteConversation = async () => {
        if (!conversationToDelete) return;

        try {
            await chatService.deleteConversation(conversationToDelete);

            // Optimistic update
            setConversations(prev => prev.filter(c => c.userId !== conversationToDelete));
            if (activeConversation?.userId === conversationToDelete) {
                setActiveConversation(null);
                setMobileShowChat(false);
            }
        } catch (error) {
            console.error("Failed to delete conversation", error);
        } finally {
            setOpenConversationDeleteConfirm(false);
            setConversationToDelete(null);
        }
    };

    // Placeholder data for profile panel
    const profileImages = [
        "file-image-documentation.jpg",
        "file-image-documentation.jpg",
        "file-image-documentation.jpg",
        "file-image-documentation.jpg"
    ];

    const handleOpenNewChat = async () => {
        setOpenNewChat(true);
        try {
            const data = await chatService.getConnections();
            console.log("Loaded connections:", data);
            // content is the array in Page<ProfileDTO>
            setConnections(data.content || []);
            setFilteredConnections(data.content || []);
        } catch (error) {
            console.error("Failed to load connections", error);
        }
    };

    const handleSelectContact = (contact: any) => {
        setOpenNewChat(false);
        setSearchContact('');

        // Push to URL, let effect handle selection/fetching
        router.push(`/messages?userId=${contact.userId}`);
    };

    useEffect(() => {
        if (searchContact.trim() === '') {
            setFilteredConnections(connections);
        } else {
            const lower = searchContact.toLowerCase();
            setFilteredConnections(connections.filter(c =>
                (c.firstName + ' ' + c.lastName).toLowerCase().includes(lower)
            ));
        }
    }, [searchContact, connections]);

    return (
        <ClientRouteGuard requiredRole="USER">
            <DashboardLayout>
                <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>

                    <Paper
                        elevation={0}
                        sx={{
                            flex: 1,
                            display: 'flex',
                            overflow: 'hidden',
                            borderRadius: 4,
                            bgcolor: '#F3F4F6', // Light gray background
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}
                    >
                        {/* LEFT SIDEBAR - CONVERSATIONS */}
                        <Box sx={{
                            width: { xs: '100%', md: 300, lg: 320 },
                            bgcolor: 'white',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            display: { xs: mobileShowChat ? 'none' : 'flex', md: 'flex' },
                            flexDirection: 'column',
                            height: '100%'
                        }}>
                            {/* Header */}
                            <Box sx={{ p: 3, pb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" fontWeight="bold">Chats</Typography>
                                    <IconButton size="small" color="primary" sx={{ bgcolor: 'action.hover' }} onClick={handleOpenNewChat}>
                                        <AddIcon />
                                    </IconButton>
                                </Box>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search Messenger"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>,
                                        sx: { borderRadius: 2, bgcolor: '#F9FAFB', '& fieldset': { border: 'none' } } // Cleaner input
                                    }}
                                />
                            </Box>

                            {/* Tabs */}
                            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                                <Tabs
                                    value={tabValue}
                                    onChange={(e, v) => setTabValue(v)}
                                    variant="fullWidth"
                                    sx={{
                                        minHeight: 40,
                                        '& .MuiTabs-indicator': { display: 'none' },
                                        px: 2
                                    }}
                                >
                                    <Tab
                                        label="All"
                                        disableRipple
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            mr: 1,
                                            borderRadius: 2,
                                            minHeight: 36,
                                            '&.Mui-selected': {
                                                color: 'primary.main',
                                                bgcolor: (theme) => theme.palette.primary.main + '1A'
                                            },
                                            '&:hover': {
                                                bgcolor: (theme) => theme.palette.primary.main + '0D'
                                            }
                                        }}
                                    />
                                    <Tab
                                        label="Unread"
                                        disableRipple
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            minHeight: 36,
                                            '&.Mui-selected': {
                                                color: 'primary.main',
                                                bgcolor: (theme) => theme.palette.primary.main + '1A'
                                            },
                                            '&:hover': {
                                                bgcolor: (theme) => theme.palette.primary.main + '0D'
                                            }
                                        }}
                                    />
                                </Tabs>
                            </Box>

                            {/* List */}
                            <List sx={{ flex: 1, overflowY: 'auto', pt: 0 }}>
                                {!loading && conversations.length === 0 && (
                                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                        <Typography variant="body2">
                                            {tabValue === 1 ? 'No unread conversations.' : 'No conversations yet.'}
                                        </Typography>
                                    </Box>
                                )}
                                {conversations.map((conv, index) => (
                                    <div key={conv.userId} ref={index === conversations.length - 1 ? lastElementRef : null}>
                                        <ListItem
                                            disablePadding
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    aria-label="options"
                                                    size="small"
                                                    onClick={(e) => handleMenuClick(e, conv.userId)}
                                                    sx={{ visibility: { xs: 'visible', md: 'hidden' }, '.MuiListItem-root:hover &': { visibility: 'visible' } }}
                                                >
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>
                                            }
                                            sx={{
                                                bgcolor: activeConversation?.userId === conv.userId ? '#F0F7FF' : 'transparent',
                                                '&:hover': { bgcolor: '#F9FAFB' }
                                            }}
                                        >
                                            <ListItemButton
                                                onClick={() => router.push(`/messages?userId=${conv.userId}`)}
                                                selected={activeConversation?.userId === conv.userId}
                                                sx={{ py: 1, px: 2 }}
                                            >
                                                <ListItemAvatar>
                                                    <Badge
                                                        color="success"
                                                        variant="dot"
                                                        overlap="circular"
                                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                        sx={{
                                                            '& .MuiBadge-badge': {
                                                                width: 10,
                                                                height: 10,
                                                                borderRadius: '50%',
                                                                border: '2px solid white',
                                                                bgcolor: conv.online ? 'success.main' : '#9CA3AF'
                                                            }
                                                        }}
                                                    >
                                                        <Avatar src={conv.profilePicture} alt={conv.name} sx={{ width: 40, height: 40 }} />
                                                    </Badge>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 2 }}>
                                                            <Typography variant="subtitle2" fontWeight={conv.unreadCount > 0 ? 700 : 600}>{conv.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{conv.lastMessageTime ? formatTime(conv.lastMessageTime) : ''}</Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Typography variant="body2" color={conv.unreadCount > 0 ? "text.primary" : "text.secondary"} noWrap sx={{ mt: 0, fontSize: '0.85rem', fontWeight: conv.unreadCount > 0 ? 600 : 400 }}>
                                                            {conv.lastMessage || 'Start a conversation'}
                                                        </Typography>
                                                    }
                                                />
                                                {conv.unreadCount > 0 && (
                                                    <Box sx={{ ml: 1, mr: 2 }}>
                                                        <Badge badgeContent={conv.unreadCount} color="error" />
                                                    </Box>
                                                )}
                                            </ListItemButton>
                                        </ListItem>
                                        <Divider component="li" />
                                    </div>
                                ))}
                            </List>

                            {/* Conversation Menu */}
                            <Menu
                                anchorEl={anchorEl}
                                open={openMenu}
                                onClose={handleMenuClose}
                                onClick={handleMenuClose}
                            >
                                <MenuItem onClick={handleDeleteConversationClick} sx={{ color: 'error.main' }}>
                                    <ListItemIcon>
                                        <DeleteIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    Delete Chat
                                </MenuItem>
                            </Menu>
                        </Box>

                        {/* MIDDLE - CHAT AREA */}
                        <Box sx={{
                            flex: 1,
                            display: { xs: mobileShowChat ? 'flex' : 'none', md: 'flex' },
                            flexDirection: 'column',
                            bgcolor: '#F3F4F6',
                            position: 'relative'
                        }}>
                            {activeConversation ? (
                                <>
                                    {/* Chat Header */}
                                    {activeConversation && (
                                        <Box sx={{
                                            p: 2,
                                            bgcolor: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                        }}>
                                            {isMobile && (
                                                <IconButton onClick={() => router.push('/messages')} sx={{ mr: 1 }}>
                                                    <ArrowBackIcon />
                                                </IconButton>
                                            )}
                                            <Avatar
                                                src={activeConversation.profilePicture}
                                                alt={activeConversation.name}
                                                sx={{ width: 40, height: 40, mr: 2 }}
                                            />
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                                    {activeConversation.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Box component="span" sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        bgcolor: activeConversation.online ? 'success.main' : 'text.disabled',
                                                        display: 'inline-block'
                                                    }} />
                                                    {activeConversation.online ? 'Online' : 'Offline'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }} />
                                            <IconButton>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </Box>
                                    )}

                                    {/* Messages */}
                                    <Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ textAlign: 'center', my: 2 }}>
                                            <Typography variant="caption" sx={{ bgcolor: 'rgba(0,0,0,0.05)', px: 2, py: 0.5, borderRadius: 10, color: 'text.secondary' }}>
                                                Today, {format(new Date(), 'd MMMM yyyy')}
                                            </Typography>
                                        </Box>

                                        {messages.map((msg, index) => {
                                            const isMe = msg.senderId === Number(user?.id);
                                            if (msg.status === 'DELETED') return null;

                                            return (
                                                <Box
                                                    key={msg.id || index}
                                                    sx={{
                                                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                                                        maxWidth: '70%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: isMe ? 'flex-end' : 'flex-start'
                                                    }}
                                                    onMouseEnter={() => setHoverMessageId(msg.id)}
                                                    onMouseLeave={() => setHoverMessageId(null)}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                                                        {!isMe && (
                                                            <Avatar src={activeConversation.profilePicture} sx={{ width: 32, height: 32, mb: 0.5 }} />
                                                        )}
                                                        <Paper
                                                            elevation={0}
                                                            sx={{
                                                                p: 2,
                                                                px: 2.5,
                                                                bgcolor: isMe ? 'primary.main' : 'white',
                                                                color: isMe ? 'primary.contrastText' : 'text.primary',
                                                                borderRadius: 3,
                                                                borderTopRightRadius: isMe ? 0 : 3,
                                                                borderTopLeftRadius: !isMe ? 0 : 3,
                                                                boxShadow: isMe ? '0 4px 12px rgba(214, 0, 42, 0.2)' : '0 2px 4px rgba(0,0,0,0.02)'
                                                            }}
                                                        >
                                                            {msg.attachments && msg.attachments.length > 0 && (
                                                                <Box sx={{ mb: msg.content && msg.content !== '📷 Photo' ? 1 : 0 }}>
                                                                    <PhotoGrid
                                                                        attachments={msg.attachments}
                                                                        onPhotoClick={(idx) => {
                                                                            setLightboxAttachments(msg.attachments!);
                                                                            setLightboxIndex(idx);
                                                                            setLightboxOpen(true);
                                                                        }}
                                                                    />
                                                                </Box>
                                                            )}
                                                            {msg.content && msg.content !== '📷 Photo' && (
                                                                <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</Typography>
                                                            )}
                                                        </Paper>
                                                        {isMe && hoverMessageId === msg.id && (
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteMessageClick(msg.id);
                                                                }}
                                                                sx={{ opacity: 0.7 }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.5, mx: 1 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatTime(msg.timestamp)}
                                                        </Typography>
                                                        {isMe && msg.deliveryStatus && (
                                                            <MessageStatusIcon status={msg.deliveryStatus} />
                                                        )}
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </Box>

                                    {/* Photo Preview Strip */}
                                    {selectedFiles.length > 0 && (
                                        <Box sx={{ px: 3, pt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {selectedFiles.map((file, idx) => (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        position: 'relative',
                                                        width: 64,
                                                        height: 64,
                                                        borderRadius: 2,
                                                        overflow: 'hidden',
                                                        border: '2px solid',
                                                        borderColor: 'divider'
                                                    }}
                                                >
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={file.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: -4,
                                                            right: -4,
                                                            bgcolor: 'error.main',
                                                            color: 'white',
                                                            width: 20,
                                                            height: 20,
                                                            '&:hover': { bgcolor: 'error.dark' },
                                                            '& svg': { fontSize: 14 }
                                                        }}
                                                    >
                                                        ×
                                                    </IconButton>
                                                </Box>
                                            ))}
                                            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                                                {selectedFiles.length}/10 photos
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Input Area */}
                                    <Box sx={{ p: 2, bgcolor: 'white', m: 3, mt: selectedFiles.length > 0 ? 1 : 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            hidden
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []);
                                                if (files.length + selectedFiles.length > 10) {
                                                    alert('Maximum 10 photos allowed per message');
                                                    return;
                                                }
                                                const validFiles = files.filter(f => {
                                                    if (f.size > 5 * 1024 * 1024) {
                                                        alert(`${f.name} exceeds 5MB limit`);
                                                        return false;
                                                    }
                                                    return true;
                                                });
                                                setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 10));
                                                e.target.value = '';
                                            }}
                                        />
                                        <IconButton size="small" color="primary" onClick={() => fileInputRef.current?.click()}><AddIcon /></IconButton>
                                        <TextField
                                            fullWidth
                                            multiline
                                            maxRows={4}
                                            placeholder="Type your message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onFocus={() => setEmojiAnchorEl(null)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                            variant="standard"
                                            InputProps={{ disableUnderline: true }}
                                        />
                                        <IconButton
                                            size="small"
                                            sx={{ color: 'text.secondary' }}
                                            onClick={(e) => setEmojiAnchorEl(e.currentTarget)}
                                        >
                                            <EmojiIcon />
                                        </IconButton>
                                        <Popover
                                            open={Boolean(emojiAnchorEl)}
                                            anchorEl={emojiAnchorEl}
                                            onClose={() => setEmojiAnchorEl(null)}
                                            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                                            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                            slotProps={{ paper: { sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } } }}
                                        >
                                            <EmojiPicker
                                                onEmojiClick={(emojiData: EmojiClickData) => {
                                                    setNewMessage(prev => prev + emojiData.emoji);
                                                }}
                                                width={350}
                                                height={400}
                                            />
                                        </Popover>
                                        <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => fileInputRef.current?.click()}><AttachFileIcon /></IconButton>
                                        <IconButton
                                            color="primary"
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim() && selectedFiles.length === 0}
                                            sx={{
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'primary.dark' },
                                                width: 40, height: 40,
                                                ml: 1
                                            }}
                                        >
                                            <SendIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.5 }}>
                                    <Typography variant="h5" color="text.secondary" gutterBottom>Welcome to Chat</Typography>
                                    <Typography>Select a conversation to start messaging</Typography>
                                </Box>
                            )}
                        </Box>

                        {/* RIGHT SIDEBAR - PROFILE (Desktop Only, XL screens) */}
                        {activeConversation && isExtraLarge && (
                            <Box sx={{
                                width: 320,
                                bgcolor: 'white',
                                borderLeft: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                flexDirection: 'column',
                                p: 3
                            }}>
                                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                    <Avatar
                                        src={activeConversation.profilePicture}
                                        sx={{ width: 80, height: 80, mx: 'auto', mb: 1.5, border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Typography variant="h6" fontWeight="bold">{activeConversation.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">@{activeConversation.name.toLowerCase().replace(/\s/g, '')}</Typography>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Phone Number</Typography>
                                    <Typography variant="body1" fontWeight="medium">+91 98765 43210</Typography>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Email</Typography>
                                    <Typography variant="body1" fontWeight="medium">{activeConversation.name.toLowerCase().replace(/\s/g, '')}@example.com</Typography>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Media Files</Typography>

                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 2, py: 0.5, borderRadius: 5, fontSize: '0.75rem', fontWeight: 'bold' }}>Files</Box>
                                        <Box sx={{ bgcolor: '#F3F4F6', color: 'text.secondary', px: 2, py: 0.5, borderRadius: 5, fontSize: '0.75rem', fontWeight: 'bold' }}>Media</Box>
                                        <Box sx={{ bgcolor: '#F3F4F6', color: 'text.secondary', px: 2, py: 0.5, borderRadius: 5, fontSize: '0.75rem', fontWeight: 'bold' }}>Links</Box>
                                    </Box>

                                    <List disablePadding>
                                        {profileImages.map((img, i) => (
                                            <ListItem key={i} sx={{ px: 0 }}>
                                                <Box sx={{ width: 40, height: 40, bgcolor: '#EEF2FF', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, color: 'primary.main' }}>
                                                    <FileIcon />
                                                </Box>
                                                <ListItemText
                                                    primary={<Typography variant="body2" fontWeight="medium" noWrap>subscription-invoice.pdf</Typography>}
                                                    secondary={<Typography variant="caption" color="text.secondary">2.4 MB • 14 Feb 2026</Typography>}
                                                />
                                                <IconButton size="small">
                                                    <MoreIcon fontSize="small" />
                                                </IconButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </Box>
                        )}

                    </Paper>
                </Box>
                {/* New Chat Dialog */}
                <Dialog open={openNewChat} onClose={() => setOpenNewChat(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>New Message</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mb: 2, mt: 1 }}>
                            <TextField
                                fullWidth
                                placeholder="Search people..."
                                value={searchContact}
                                onChange={(e) => setSearchContact(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                                }}
                                size="small"
                            />
                        </Box>
                        <List sx={{ pt: 0, maxHeight: 400, overflow: 'auto' }}>
                            {filteredConnections.length > 0 ? (
                                filteredConnections.map((contact) => (
                                    <ListItemButton key={contact.userId} onClick={() => handleSelectContact(contact)}>
                                        <ListItemAvatar>
                                            <Avatar src={contact.profilePicture} alt={contact.firstName} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={`${contact.firstName} ${contact.lastName}`}
                                            secondary={contact.headline || contact.occupation || 'Connected'}
                                        />
                                    </ListItemButton>
                                ))
                            ) : (
                                <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                                    <Typography>No connections found</Typography>
                                </Box>
                            )}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenNewChat(false)}>Cancel</Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
                    <DialogTitle>Delete Message?</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this message? This action cannot be undone.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDeleteConfirm(false)}>Cancel</Button>
                        <Button onClick={confirmDeleteMessage} color="error" variant="contained">Delete</Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Conversation Confirmation Dialog */}
                <Dialog open={openConversationDeleteConfirm} onClose={() => setOpenConversationDeleteConfirm(false)}>
                    <DialogTitle>Delete Conversation?</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this entire conversation? All messages will be permanently removed.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenConversationDeleteConfirm(false)}>Cancel</Button>
                        <Button onClick={confirmDeleteConversation} color="error" variant="contained">Delete</Button>
                    </DialogActions>
                </Dialog>

                {/* Photo Lightbox */}
                <PhotoLightbox
                    open={lightboxOpen}
                    attachments={lightboxAttachments}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                />

            </DashboardLayout>
        </ClientRouteGuard>
    );
}
