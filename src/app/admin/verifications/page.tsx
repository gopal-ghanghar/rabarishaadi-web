'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import {
    Box,
    Typography,
    Paper,
    Button,
    Card,
    CardContent,
    CardActions,
    Chip,
    Divider,
    Alert,
    CircularProgress,
    Stack,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tabs,
    Tab
} from '@mui/material';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Profile {
    id: number;
    user: {
        id: number;
        email: string;
        phone: string;
        verificationStatus: string;
    };
    firstName: string;
    lastName: string;
    gender: string;
    dob: string;
    height: number;
    maritalStatus: string;
    diet: string;
    liveWithFamily: boolean;
    highestQualification: string;
    collegeName: string;
    incomeType: string;
    incomeRange: string;
    country: string;
    city: string;
    communityDetails: {
        religion: string;
        community: string;
        subCaste: string;
    } | null;
}

export default function VerificationsPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [status, setStatus] = useState<'UNDER_REVIEW' | 'REJECTED'>('UNDER_REVIEW');

    // Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: 'VERIFIED' | 'REJECTED' | null;
        userId: number | null;
    }>({
        open: false,
        type: null,
        userId: null
    });

    const loadPending = async (currentPage: number, currentStatus: string) => {
        setLoading(true);
        try {
            // Spring Boot pages are 0-indexed
            const data = await fetchApi(`/admin/verifications?page=${currentPage - 1}&size=10&status=${currentStatus}`);
            setProfiles(data.content);
            setTotalPages(data.totalPages);
        } catch (err: any) {
            setError(err.message || 'Failed to load verifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPending(page, status);
    }, [page, status]);

    const handleVerifyClick = (userId: number, action: 'VERIFIED' | 'REJECTED') => {
        setConfirmDialog({
            open: true,
            type: action,
            userId: userId
        });
    };

    const handleConfirmAction = async () => {
        const { userId, type } = confirmDialog;
        if (!userId || !type) return;

        setConfirmDialog({ ...confirmDialog, open: false }); // Close dialog immediately
        setActionLoading(userId);

        try {
            await fetchApi(`/admin/verify/${userId}?status=${type}`, {
                method: 'POST'
            });
            // Reload current page to refresh list
            loadPending(page, status);
        } catch (err: any) {
            console.error('Action failed:', err);
            setError(err.message || 'Action failed');
            setTimeout(() => setError(''), 5000); // Clear error after 5s
        } finally {
            setActionLoading(null);
            // Reset dialog state completely
            setConfirmDialog({ open: false, type: null, userId: null });
        }
    };

    const handleCloseDialog = () => {
        setConfirmDialog({ open: false, type: null, userId: null });
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: 'UNDER_REVIEW' | 'REJECTED') => {
        setStatus(newValue);
        setPage(1); // Reset to first page
    };

    if (loading && profiles.length === 0) return (
        <DashboardLayout>
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">
                    {status === 'UNDER_REVIEW' ? 'Pending Approvals' : 'Rejected Profiles'}
                </Typography>
                <Link href="/admin" passHref>
                    <Button variant="outlined">Back to Dashboard</Button>
                </Link>
            </Stack>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={status} onChange={handleTabChange} aria-label="verification status tabs">
                    <Tab label="Pending Requests" value="UNDER_REVIEW" />
                    <Tab label="Rejected Profiles" value="REJECTED" />
                </Tabs>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {!loading && profiles.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        {status === 'UNDER_REVIEW' ? 'No pending verifications found.' : 'No rejected profiles found.'}
                    </Typography>
                </Paper>
            ) : (
                <>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
                        {profiles.map(profile => (
                            <Card key={profile.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box>
                                            <Typography variant="h6" gutterBottom>{profile.firstName} {profile.lastName}</Typography>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                {profile.user.email} | {profile.user.phone}
                                            </Typography>
                                        </Box>
                                        <Chip label={profile.gender} size="small" color={profile.gender === 'MALE' ? 'primary' : 'secondary'} />
                                    </Stack>

                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                        <Typography variant="body2"><strong>DOB:</strong> {profile.dob}</Typography>
                                        <Typography variant="body2"><strong>Marital:</strong> {profile.maritalStatus}</Typography>
                                        <Typography variant="body2"><strong>Diet:</strong> {profile.diet}</Typography>
                                        <Typography variant="body2"><strong>Height:</strong> {profile.height} cm</Typography>
                                        <Typography variant="body2"><strong>Location:</strong> {profile.city}, {profile.country}</Typography>
                                        <Typography variant="body2"><strong>Live w/ Family:</strong> {profile.liveWithFamily ? 'Yes' : 'No'}</Typography>
                                    </Box>

                                    {profile.communityDetails && (
                                        <Box sx={{ mt: 2, bgcolor: '#f9f9f9', p: 1, borderRadius: 1 }}>
                                            <Typography variant="subtitle2" gutterBottom>Community</Typography>
                                            <Typography variant="body2">
                                                {profile.communityDetails.religion} - {profile.communityDetails.community} ({profile.communityDetails.subCaste})
                                            </Typography>
                                        </Box>
                                    )}

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Education & Profession</Typography>
                                        <Typography variant="body2">{profile.highestQualification} from {profile.collegeName}</Typography>
                                        <Typography variant="body2">Income: {profile.incomeRange} ({profile.incomeType})</Typography>
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    {status === 'UNDER_REVIEW' && (
                                        <>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                fullWidth
                                                onClick={() => handleVerifyClick(profile.user.id, 'VERIFIED')}
                                                disabled={actionLoading === profile.user.id}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                fullWidth
                                                onClick={() => handleVerifyClick(profile.user.id, 'REJECTED')}
                                                disabled={actionLoading === profile.user.id}
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                    {status === 'REJECTED' && (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            fullWidth
                                            onClick={() => handleVerifyClick(profile.user.id, 'VERIFIED')}
                                            disabled={actionLoading === profile.user.id}
                                        >
                                            Approve (Reconsider)
                                        </Button>
                                    )}
                                </CardActions>
                            </Card>
                        ))}
                    </Box>

                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 4 }}>
                            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
                        </Box>
                    )}
                </>
            )}

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {confirmDialog.type === 'VERIFIED' ? 'Approve User?' : 'Reject User?'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to {confirmDialog.type === 'VERIFIED' ? 'approve' : 'reject'} this user?
                        {confirmDialog.type === 'VERIFIED'
                            ? ' The user will be able to log in and use the application.'
                            : ' The user will be notified of the rejection.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleConfirmAction}
                        color={confirmDialog.type === 'VERIFIED' ? 'success' : 'error'}
                        variant="contained"
                        autoFocus
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}
