import { create } from 'zustand';

interface ChatState {
    globalUnreadCount: number;
    setGlobalUnreadCount: (count: number) => void;
    incrementGlobalUnreadCount: () => void;
    decrementGlobalUnreadCount: () => void;
    activeConversationId: number | null;
    setActiveConversationId: (id: number | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    globalUnreadCount: 0,
    setGlobalUnreadCount: (count) => set({ globalUnreadCount: count }),
    incrementGlobalUnreadCount: () => set((state) => ({ globalUnreadCount: state.globalUnreadCount + 1 })),
    decrementGlobalUnreadCount: () => set((state) => ({ globalUnreadCount: Math.max(0, state.globalUnreadCount - 1) })),
    activeConversationId: null,
    setActiveConversationId: (id) => set({ activeConversationId: id }),
}));
