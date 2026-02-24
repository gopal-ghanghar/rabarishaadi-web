import { fetchApi } from '@/lib/api';
import { Profile } from '@/lib/types/profile';
import { Page } from '@/lib/types/common';

export const connectionService = {
    sendRequest: async (recipientId: number) => {
        return fetchApi(`/connections/send/${recipientId}`, { method: 'POST' });
    },

    acceptRequest: async (requestId: number) => {
        return fetchApi(`/connections/accept/${requestId}`, { method: 'POST' });
    },

    rejectRequest: async (requestId: number) => {
        return fetchApi(`/connections/reject/${requestId}`, { method: 'POST' });
    },

    cancelRequest: async (requestId: number) => {
        return fetchApi(`/connections/cancel/${requestId}`, { method: 'POST' });
    },

    getIncomingRequests: async (page = 0, size = 10, search = ''): Promise<Page<Profile>> => {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
        if (search) params.append('search', search);
        return fetchApi(`/connections/incoming?${params.toString()}`);
    },

    getConnectionStatus: async (targetUserId: number): Promise<{ status: string; requestId?: string; direction?: string }> => {
        return fetchApi(`/connections/status/${targetUserId}`);
    },

    getAcceptedConnections: async (page = 0, size = 10, search = ''): Promise<Page<Profile>> => {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
        if (search) params.append('search', search);
        return fetchApi(`/connections/accepted?${params.toString()}`);
    },

    getSentPendingRequests: async (page = 0, size = 10, search = ''): Promise<Page<Profile>> => {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
        if (search) params.append('search', search);
        return fetchApi(`/connections/sent?${params.toString()}`);
    }
};
