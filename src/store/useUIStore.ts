import { create } from 'zustand';

interface UIState {
    isMessagesOpen: boolean;
    toggleMessages: () => void;
    openMessages: () => void;
    closeMessages: () => void;
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isMessagesOpen: false,
    toggleMessages: () => set((state) => ({ isMessagesOpen: !state.isMessagesOpen })),
    openMessages: () => set({ isMessagesOpen: true }),
    closeMessages: () => set({ isMessagesOpen: false }),

    isSidebarCollapsed: true,
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    setSidebarCollapsed: (collapsed: boolean) => set({ isSidebarCollapsed: collapsed }),
}));
