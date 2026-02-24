import { create } from 'zustand';

interface User {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    setFromLocalStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    login: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },
    setFromLocalStorage: () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            if (token && userStr) {
                set({ token, user: JSON.parse(userStr), isAuthenticated: true });
            }
        }
    },
}));
