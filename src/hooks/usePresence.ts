
import { useEffect, useRef } from 'react';
import { fetchApi } from '../lib/api';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const MAX_RETRIES = 3;

export const useUserPresence = (isAuthenticated: boolean) => {
    const retryCountRef = useRef(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        const sendHeartbeat = async () => {
            if (document.visibilityState === 'hidden') return;

            try {
                await fetchApi('/user/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                retryCountRef.current = 0; // Reset retry on success
            } catch (error) {
                console.error('Heartbeat failed', error);
                if (retryCountRef.current < MAX_RETRIES) {
                    retryCountRef.current++;
                    // Retry quickly with backoff
                    timeoutRef.current = setTimeout(sendHeartbeat, 1000 * retryCountRef.current);
                }
            }
        };

        // Initial call
        sendHeartbeat();

        // Periodic interval
        const intervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

        // Visibility change handler
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Send immediately when becoming visible
                sendHeartbeat();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isAuthenticated]);
};
