'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ClientRouteGuard from '@/components/auth/ClientRouteGuard';
import { fetchApi, API_URL } from '@/lib/api';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    TextField,
    InputAdornment,
    Pagination
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import ConnectButton from '@/components/common/ConnectButton';

export default function ShortlistedPage() {
    const { user } = useAuthStore();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');

    const fetchShortlisted = async () => {
        setLoading(true);
        try {
            let query = `?page=${page - 1}&size=12`; // API is 0-indexed
            if (search) query += `&search=${search}`;

            const data = await fetchApi(`/shortlist${query}`);
            setProfiles(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Failed to fetch shortlisted profiles', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShortlisted();
    }, [page, search]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        setPage(1); // Reset to first page on search
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };


    return (
        <ClientRouteGuard requiredRole="USER">
            <DashboardLayout>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>Shortlisted Profiles</Typography>
                    <Typography variant="body2" color="text.secondary">View and manage your shortlisted profiles</Typography>
                </Box>

                {/* Search Bar */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <TextField
                        size="small"
                        placeholder="Search by name"
                        value={search}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: 300, bgcolor: 'background.paper', borderRadius: 1 }}
                    />
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : profiles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">No shortlisted profiles found.</Typography>
                        <Button variant="contained" sx={{ mt: 2 }} component={Link} href="/matches">Find Matches</Button>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {profiles.map((profile) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={profile.id}>
                                <Card sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                                }}>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            pt: '100%',
                                            bgcolor: 'grey.100',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {profile.profilePicture ? (
                                            <img
                                                src={`${API_URL.replace('/api', '')}/uploads/${profile.profilePicture}`}
                                                alt={profile.firstName}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.5s',
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                        ) : (
                                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200' }}>
                                                <Typography variant="h3" color="text.secondary">
                                                    {profile.firstName?.charAt(0)}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                    <Box sx={{ p: 2, flexGrow: 1 }}>
                                        <Typography
                                            variant="h6"
                                            fontWeight={700}
                                            noWrap
                                            color="text.primary"
                                        >
                                            {profile.firstName} {profile.lastName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>{profile.occupation || 'N/A'}</Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>{profile.city}, {profile.state}</Typography>
                                    </Box>
                                    <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, flexDirection: 'column' }}>
                                        <ConnectButton
                                            targetUserId={profile.userId}
                                            initialStatus={profile.connectionStatus}
                                            initialRequestId={profile.connectionId}
                                            fullWidth
                                        />
                                        <Button
                                            component={Link}
                                            href={`/profile/${profile.id}?from=shortlisted`}
                                            variant="outlined"
                                            fullWidth
                                        >
                                            View Profile
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Pagination */}
                {!loading && profiles.length > 0 && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                )}
            </DashboardLayout>
        </ClientRouteGuard>
    );
}
