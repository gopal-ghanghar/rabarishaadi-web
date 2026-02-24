'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    MenuItem,
    CircularProgress,
    Chip,
    Stack,
    Paper,
    InputAdornment,
    AppBar,
    Toolbar
} from '@mui/material';
import { Search as SearchIcon, LocationOn, Work, School, Man, Woman, Person, Bookmark, BookmarkBorder, Favorite, FavoriteBorder, Height } from '@mui/icons-material';
import { fetchApi, API_URL } from '@/lib/api';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ClientRouteGuard from '@/components/auth/ClientRouteGuard';
import ConnectButton from '@/components/common/ConnectButton';

import { useUIStore } from '@/store/useUIStore';

export default function MatchesPage() {
    const router = useRouter();
    const { isMessagesOpen } = useUIStore();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        minAge: '',
        maxAge: '',
        gender: '',
        subCaste: '',
        location: ''
    });

    const searchProfiles = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
            router.push('/auth/login');
            return;
        }

        // Clean empty filters
        const activeFilters: any = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value) activeFilters[key] = value;
        });

        try {
            const results = await fetchApi('/profile/search', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(activeFilters)
            });
            setProfiles(results);
        } catch (error) {
            console.error('Search failed:', error);
            if ((error as any).message?.includes('403')) {
                router.push('/auth/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        searchProfiles();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleShortlist = async (profileId: number) => {
        try {
            const res = await fetchApi(`/shortlist/toggle/${profileId}`, { method: 'POST' });
            setProfiles(profiles.map(p =>
                p.id === profileId ? { ...p, shortlisted: res.shortlisted } : p
            ));
        } catch (error) {
            console.error('Failed to toggle shortlist', error);
        }
    };

    const handleConnect = async (profileId: number) => {
        alert("Connect request sent! (Feature coming soon)");
        // Optimistic update for demo
        setProfiles(profiles.map(p =>
            p.id === profileId ? { ...p, connected: !p.connected } : p
        ));
    };


    return (
        <ClientRouteGuard requiredRole="USER">
            <DashboardLayout>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={700}>Find Matches</Typography>
                    <Typography variant="body2" color="text.secondary">Discover profiles that match your preferences</Typography>
                </Box>

                <Box>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            lg: '300px 1fr'
                        },
                        gap: 3
                    }}>
                        {/* Filters Sidebar */}
                        <Box>
                            <Paper sx={{ p: 3, borderRadius: 3 }}>
                                <Typography variant="h6" gutterBottom fontWeight={700}>Filters</Typography>
                                <Stack spacing={2}>
                                    <TextField
                                        select
                                        label="Gender"
                                        name="gender"
                                        value={filters.gender}
                                        onChange={handleFilterChange}
                                        fullWidth
                                        size="small"
                                    >
                                        <MenuItem value="">Any</MenuItem>
                                        <MenuItem value="MALE">Groom</MenuItem>
                                        <MenuItem value="FEMALE">Bride</MenuItem>
                                    </TextField>

                                    <Stack direction="row" spacing={1}>
                                        <TextField
                                            label="Min Age"
                                            name="minAge"
                                            type="number"
                                            value={filters.minAge}
                                            onChange={handleFilterChange}
                                            fullWidth
                                            size="small"
                                        />
                                        <TextField
                                            label="Max Age"
                                            name="maxAge"
                                            type="number"
                                            value={filters.maxAge}
                                            onChange={handleFilterChange}
                                            fullWidth
                                            size="small"
                                        />
                                    </Stack>

                                    <TextField
                                        label="Sub-Caste"
                                        name="subCaste"
                                        value={filters.subCaste}
                                        onChange={handleFilterChange}
                                        fullWidth
                                        size="small"
                                    />

                                    <TextField
                                        label="Location"
                                        name="location"
                                        value={filters.location}
                                        onChange={handleFilterChange}
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <LocationOn fontSize="small" color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={searchProfiles}
                                        startIcon={<SearchIcon />}
                                    >
                                        Apply Filters
                                    </Button>
                                </Stack>
                            </Paper>
                        </Box>

                        {/* Results Grid */}
                        <Box>
                            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                                Matches ({profiles.length})
                            </Typography>

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                    <CircularProgress />
                                </Box>
                            ) : profiles.length > 0 ? (
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: '1fr 1fr',
                                        lg: '1fr 1fr 1fr',
                                        xl: '1fr 1fr 1fr 1fr'
                                    },
                                    gap: 3
                                }}>
                                    {profiles.map((profile) => (
                                        <Box key={profile.id}>
                                            <Card sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: 'transform 0.2s',
                                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                                                position: 'relative' // For absolute positioning if needed
                                            }}>
                                                <Box sx={{ position: 'relative', pt: '100%', bgcolor: 'grey.100', overflow: 'hidden' }}>
                                                    {/* Action Icons Overlay */}
                                                    <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                                                        <Box
                                                            sx={{
                                                                bgcolor: 'rgba(255,255,255,0.8)',
                                                                backdropFilter: 'blur(4px)',
                                                                borderRadius: '50%',
                                                                p: 0.5,
                                                                display: 'flex',
                                                                cursor: 'pointer',
                                                                transition: 'transform 0.2s',
                                                                '&:hover': { transform: 'scale(1.1)', bgcolor: 'white' }
                                                            }}
                                                            onClick={(e) => {
                                                                e.preventDefault(); // Prevent link navigation
                                                                handleShortlist(profile.id);
                                                            }}
                                                        >
                                                            {profile.shortlisted ? <Bookmark color="primary" /> : <BookmarkBorder color="action" />}
                                                        </Box>
                                                    </Stack>

                                                    {profile.profilePicture ? (
                                                        <Box
                                                            component="img"
                                                            src={`${API_URL.replace('/api', '')}/uploads/${profile.profilePicture}`}
                                                            alt={profile.firstName}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                transition: 'transform 0.5s',
                                                                '&:hover': { transform: 'scale(1.05)' }
                                                            }}
                                                        />
                                                    ) : (
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                bgcolor: 'grey.200',
                                                                color: 'grey.400'
                                                            }}
                                                        >
                                                            {profile.gender === 'MALE' ? (
                                                                <Man sx={{ fontSize: 120 }} />
                                                            ) : profile.gender === 'FEMALE' ? (
                                                                <Woman sx={{ fontSize: 120 }} />
                                                            ) : (
                                                                <Person sx={{ fontSize: 120 }} />
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                                <CardContent sx={{ flexGrow: 1 }}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                        <Typography variant="h6" fontWeight={700}>
                                                            {profile.firstName} {profile.lastName}
                                                        </Typography>
                                                        <Chip label={`${calculateAge(profile.dob)} yrs`} size="small" color="primary" variant="outlined" />
                                                    </Stack>

                                                    <Stack spacing={1} sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Work fontSize="small" />
                                                            <Typography variant="body2">{profile.occupation || 'N/A'}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Height fontSize="small" />
                                                            <Typography variant="body2">{profile.height} cm</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <LocationOn fontSize="small" />
                                                            <Typography variant="body2">{profile.nativePlace || 'N/A'}</Typography>
                                                        </Box>
                                                        {profile.subCaste && (
                                                            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
                                                                {profile.subCaste}
                                                            </Typography>
                                                        )}
                                                    </Stack>

                                                    <Box sx={{ mt: 2 }}>
                                                        <ConnectButton
                                                            targetUserId={profile.userId}
                                                            initialStatus={profile.connectionStatus || (profile.connected ? 'ACCEPTED' : 'NONE')}
                                                            initialRequestId={profile.connectionId?.toString()} // Ensure string if needed
                                                            initialDirection="SENT" // On Matches page, if status exists it's usually likely SENT by us unless we matched mutually or fetched status specifically. Actually backend should send direction but DTO doesn't have it explicitly mapped yet unless getConnectionStatus is called.
                                                            // However, if status is PENDING and we see it here, likely we sent it?
                                                            // If someone sent US a request, it would also be PENDING status.
                                                            // Backend ProfileDTO doesn't distinguish direction easily.
                                                            // For now assume SENT if PENDING in this view, OR simple solution:
                                                            // If status is PENDING, show "Requested" or "Respond" - ConnectButton handles direction.
                                                            // ConnectButton needs 'direction' prop to distinguish.
                                                            // If direction invalid, it defaults.
                                                            // Let's assume if it is PENDING in "Find Matches", we probably initiated it or we haven't filtered incoming.
                                                            // Best effort: Pass 'SENT' for now or update backend to send direction in search results.
                                                            // Actually `ProfileServiceImpl` sets `connectionStatus` but implies simple state.
                                                            fullWidth
                                                        />
                                                    </Box>
                                                </CardContent>
                                                <Box sx={{ p: 2, pt: 0 }}>
                                                    <Button
                                                        component={Link}
                                                        href={`/profile/${profile.id}`}
                                                        fullWidth
                                                        variant="outlined"
                                                    >
                                                        View Profile
                                                    </Button>
                                                </Box>
                                            </Card>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Paper sx={{ p: 5, textAlign: 'center', bgcolor: 'grey.50' }}>
                                    <Typography color="text.secondary">
                                        No matches found. Try adjusting your filters.
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </Box>
                </Box>
            </DashboardLayout>
        </ClientRouteGuard >
    );
}

function calculateAge(dob: string) {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
