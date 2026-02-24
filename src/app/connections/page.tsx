'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ClientRouteGuard from '@/components/auth/ClientRouteGuard';
import { connectionService } from '@/lib/services/connection';
import ConnectButton from '@/components/common/ConnectButton';
import { API_URL } from '@/lib/api';
import { Box, Typography, Grid, CircularProgress, Paper, Card, Tabs, Tab, Button, TextField, InputAdornment, Pagination } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Search as SearchIcon } from '@mui/icons-material';
import { Profile } from '@/lib/types/profile';
import Loader from '@/components/common/Loader';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function ConnectionsPage() {
    const [value, setValue] = useState(0);
    const [connections, setConnections] = useState<Profile[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<Profile[]>([]);
    const [sentRequests, setSentRequests] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    // Pagination and Search State
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 12; // Grid 3x4 or 4x3

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page, value]); // Reload when search, page or tab changes

    const fetchData = async () => {
        try {
            setLoading(true);
            let response;
            // API expects 0-indexed page
            const apiPage = page - 1;

            if (value === 0) {
                response = await connectionService.getAcceptedConnections(apiPage, pageSize, search);
            } else if (value === 1) {
                response = await connectionService.getIncomingRequests(apiPage, pageSize, search);
            } else {
                response = await connectionService.getSentPendingRequests(apiPage, pageSize, search);
            }

            // Handle both Page (new API) and List (old API/fallback) response formats
            let profiles: Profile[] = [];
            let total = 0;

            // Check if response is an Array (legacy API) or Page object (new API)
            // Need to cast to any because TypeScript expects one type but runtime might be different
            const data = response as any;

            if (Array.isArray(data)) {
                profiles = data;
                total = Math.ceil(data.length / pageSize) || 1; // Basic client-side total calculation if needed
            } else if (data?.content) {
                profiles = data.content;
                total = data.totalPages;
            }

            if (value === 0) setConnections(profiles);
            else if (value === 1) setIncomingRequests(profiles);
            else setSentRequests(profiles);

            setTotalPages(total);
        } catch (err) {
            console.error('Error fetching connections:', err);
            setError('Failed to load connections');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setLoading(true); // Show loader immediately
        setValue(newValue);
        setPage(1); // Reset page on tab switch
        setSearch(''); // Optional: Reset search on tab switch
        // Clear data to avoid flickering
        setConnections([]);
        setIncomingRequests([]);
        setSentRequests([]);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setLoading(true); // Show loader immediately
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true); // Show loader immediately
        setSearch(event.target.value);
        setPage(1); // Reset to first page on new search
    };

    const handleStatusChange = () => {
        fetchData();
    };

    const renderProfileList = (profiles: Profile[] = [], type: 'ACCEPTED' | 'INCOMING' | 'SENT') => {
        if (!profiles || profiles.length === 0) {
            return (
                <Paper sx={{ p: 5, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography color="text.secondary">
                        {type === 'ACCEPTED' && "You don't have any connections yet."}
                        {type === 'INCOMING' && "No pending requests at the moment."}
                        {type === 'SENT' && "You haven't sent any requests yet."}
                    </Typography>
                </Paper>
            );
        }

        return (
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
                                        src={`${API_URL}/uploads/${profile.profilePicture}`}
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
                                    initialStatus={type === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING'}
                                    initialRequestId={profile.connectionId}
                                    initialDirection={type === 'SENT' ? 'SENT' : (type === 'INCOMING' ? 'RECEIVED' : undefined)}
                                    fullWidth
                                    onStatusChange={handleStatusChange}
                                />
                                {type === 'ACCEPTED' && (
                                    <Button
                                        component={Link}
                                        href={`/messages?userId=${profile.userId}`}
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                    >
                                        Message
                                    </Button>
                                )}
                                <Button
                                    component={Link}
                                    href={`/profile/${profile.id}?from=connections`}
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
        );
    };

    return (
        <ClientRouteGuard requiredRole="USER">
            <DashboardLayout>
                <Box>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight="bold">Connections</Typography>
                        <Typography variant="body2" color="text.secondary">Manage your network and requests</Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            aria-label="connection tabs"
                            sx={{
                                '& .MuiTabs-indicator': {
                                    display: 'none',
                                },
                            }}
                        >
                            <Tab
                                label="Connections"
                                {...a11yProps(0)}
                                sx={{
                                    mr: 1,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    borderRadius: 2,
                                    px: 3,
                                    minHeight: '40px',
                                    '&.Mui-selected': {
                                        color: 'primary.main',
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                    },
                                    '&:hover': {
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                                    }
                                }}
                            />
                            <Tab
                                label="Requests"
                                {...a11yProps(1)}
                                sx={{
                                    mr: 1,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    borderRadius: 2,
                                    px: 3,
                                    minHeight: '40px',
                                    '&.Mui-selected': {
                                        color: 'primary.main',
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                    },
                                    '&:hover': {
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                                    }
                                }}
                            />
                            <Tab
                                label="Sent"
                                {...a11yProps(2)}
                                sx={{
                                    mr: 1,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    borderRadius: 2,
                                    px: 3,
                                    minHeight: '40px',
                                    '&.Mui-selected': {
                                        color: 'primary.main',
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                    },
                                    '&:hover': {
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                                    }
                                }}
                            />
                        </Tabs>
                    </Box>

                    {/* Search Bar */}
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
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
                            sx={{ width: { xs: '100%', sm: 300 }, bgcolor: 'background.paper' }}
                        />
                    </Box>

                    {loading ? (
                        <Loader message="Loading connections..." />
                    ) : (
                        <>
                            <CustomTabPanel value={value} index={0}>
                                {renderProfileList(connections, 'ACCEPTED')}
                            </CustomTabPanel>
                            <CustomTabPanel value={value} index={1}>
                                {renderProfileList(incomingRequests, 'INCOMING')}
                            </CustomTabPanel>
                            <CustomTabPanel value={value} index={2}>
                                {renderProfileList(sentRequests, 'SENT')}
                            </CustomTabPanel>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                                    <Pagination
                                        count={totalPages}
                                        page={page}
                                        onChange={handlePageChange}
                                        color="primary"
                                        shape="rounded"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </DashboardLayout>
        </ClientRouteGuard>
    );
}
