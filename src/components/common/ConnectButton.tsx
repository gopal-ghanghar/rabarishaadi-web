import { useState, useEffect } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { PersonAdd, PersonRemove, Check, Pending, Cancel } from '@mui/icons-material';
import { connectionService } from '@/lib/services/connection';
import { useSnackbar } from 'notistack';

interface ConnectButtonProps {
    targetUserId: number;
    initialStatus?: string; // PENDING, ACCEPTED, REJECTED, CANCELLED, NONE
    initialRequestId?: string;
    initialDirection?: string; // SENT, RECEIVED
    className?: string;
    fullWidth?: boolean;
    onStatusChange?: (newStatus: string) => void;
}

export default function ConnectButton({
    targetUserId,
    initialStatus = 'NONE',
    initialRequestId,
    initialDirection,
    className,
    fullWidth = false,
    onStatusChange
}: ConnectButtonProps) {
    const [status, setStatus] = useState(initialStatus);
    const [requestId, setRequestId] = useState(initialRequestId);
    const [direction, setDirection] = useState(initialDirection);
    const [loading, setLoading] = useState(false);

    // If no initial status provided, maybe fetch it? 
    // For now assume parent passes it or it defaults to NONE.
    // Ideally parent fetches status to avoid N+1 requests if used in list.

    useEffect(() => {
        if (initialStatus) setStatus(initialStatus);
        if (initialRequestId) setRequestId(initialRequestId);
        if (initialDirection) setDirection(initialDirection);
    }, [initialStatus, initialRequestId, initialDirection]);

    const handleConnect = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        try {
            await connectionService.sendRequest(targetUserId);
            // After sending, we might want to re-fetch status to get the new Request ID,
            // but for UI update 'PENDING' is enough.
            // Actually request ID is needed for Cancel.
            // Let's refetch status or return ID from API.
            // For now, refetch status quickly.
            const statusData = await connectionService.getConnectionStatus(targetUserId);
            setStatus(statusData.status);
            setRequestId(statusData.requestId);
            setDirection(statusData.direction);
            if (onStatusChange) onStatusChange(statusData.status);
        } catch (error) {
            console.error('Failed to send request', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!requestId) return;
        setLoading(true);
        try {
            await connectionService.cancelRequest(Number(requestId));
            setStatus('NONE');
            setRequestId(undefined);
            setDirection(undefined);
            if (onStatusChange) onStatusChange('NONE');
        } catch (error) {
            console.error('Failed to cancel request', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!requestId) return;
        setLoading(true);
        try {
            await connectionService.acceptRequest(Number(requestId));
            setStatus('ACCEPTED');
            if (onStatusChange) onStatusChange('ACCEPTED');
        } catch (error) {
            console.error('Failed to accept request', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!requestId) return;
        setLoading(true);
        try {
            await connectionService.rejectRequest(Number(requestId));
            setStatus('NONE'); // Or REJECTED
            if (onStatusChange) onStatusChange('NONE');
        } catch (error) {
            console.error('Failed to reject request', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Button disabled variant="outlined" fullWidth={fullWidth} startIcon={<CircularProgress size={20} />}>Loading...</Button>;
    }

    if (status === 'ACCEPTED') {
        return (
            <Button
                variant="contained"
                color="success"
                fullWidth={fullWidth}
                startIcon={<Check />}
                disabled // Messaging not implemented yet
            >
                Connected
            </Button>
        );
    }

    if (status === 'PENDING') {
        if (direction === 'SENT') {
            return (
                <Button
                    variant="outlined"
                    color="warning"
                    fullWidth={fullWidth}
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                >
                    Cancel Request
                </Button>
            );
        } else {
            // Incoming Request
            return (
                <div style={{ display: 'flex', gap: '8px', width: fullWidth ? '100%' : 'auto' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth={fullWidth}
                        onClick={handleAccept}
                    >
                        Accept
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        fullWidth={fullWidth}
                        onClick={handleReject}
                    >
                        Reject
                    </Button>
                </div>
            );
        }
    }

    // Default: NONE and REJECTED (allows re-request)
    return (
        <Button
            variant="contained"
            color="primary"
            fullWidth={fullWidth}
            startIcon={<PersonAdd />}
            onClick={handleConnect}
        >
            Connect
        </Button>
    );
}
