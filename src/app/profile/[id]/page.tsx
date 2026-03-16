'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchApi, API_URL } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Avatar,
    Stack,
    CircularProgress,
    Divider,
    AppBar,
    Toolbar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    IconButton
} from '@mui/material';
import {
    ArrowBack,
    Person,
    Man,
    Woman,
    LocationOn,
    School,
    Work,
    BookmarkBorder,
    Bookmark,
    MoreHoriz,
    Flag,
    Block,
    Share
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ClientRouteGuard from '@/components/auth/ClientRouteGuard';
import GalleryLightbox from '@/components/profile/GalleryLightbox';
import ShareProfileDialog from '@/components/profile/ShareProfileDialog';

import ConnectButton from '@/components/common/ConnectButton';
import { connectionService } from '@/lib/services/connection';

export default function ProfileDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const { user } = useAuthStore();
    const searchParams = useSearchParams();
    const from = searchParams.get('from');

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isShortlisted, setIsShortlisted] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<{ status: string; requestId?: string; direction?: string }>({ status: 'NONE' });
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setMoreMenuAnchor(event.currentTarget);
    const handleMenuClose = () => setMoreMenuAnchor(null);

    const handleShareProfile = async () => {
        handleMenuClose();
        if (!profile) return;
        try {
            const res = await fetchApi('/profile/share', {
                method: 'POST',
                body: JSON.stringify({ profileId: profile.id })
            });
            if (res.shareUrl) {
                // If the backend returns a URL (e.g., https://rabarishaadi.com/p/xxx), you can modify logic to use dynamic host instead
                // e.g. const fullUrl = `${window.location.protocol}//${window.location.host}/p/${res.shareUrl.split('/').pop()}`;
                // We'll use the dynamic host instead to ensure it works in all environments
                const token = res.shareUrl.split('/').pop();
                const fullUrl = `${window.location.protocol}//${window.location.host}/p/${token}`;
                setShareUrl(fullUrl);
                setIsShareDialogOpen(true);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to generate share link');
        }
    };

    useEffect(() => {
        if (!id) return;

        const loadProfile = async () => {
            try {
                const data = await fetchApi(`/profile/${id}`);
                setProfile(data);

                // Check shortlist status if not own profile
                if (user?.id !== data.userId) {
                    try {
                        const status = await fetchApi(`/shortlist/check/${id}`);
                        setIsShortlisted(status.shortlisted);
                    } catch (e) {
                        console.error("Failed to check shortlist status", e);
                    }

                    try {
                        const statusData = await connectionService.getConnectionStatus(data.userId); // userId from profile, not id param (which is profileId)
                        // Wait, param id is probably profileId? backend route is /profile/{id}.
                        // ProfileDTO usually has userId.
                        // But connectionService expects userId.
                        setConnectionStatus(statusData);
                    } catch (e) {
                        console.error("Failed to check connection status", e);
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load profile. It may not exist.');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [id, user?.id]);

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    if (error || !profile) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <Typography color="error" variant="h6">{error || 'Profile not found'}</Typography>
                </Box>
            </DashboardLayout>
        );
    }

    const isOwnProfile = user?.id === profile.userId;

    // Moved to top level

    const handleShortlistToggle = async () => {
        if (!profile) return;
        try {
            const res = await fetchApi(`/shortlist/toggle/${profile.id}`, { method: 'POST' });
            setIsShortlisted(res.shortlisted);
        } catch (error) {
            alert('Failed to update shortlist status');
        }
    };

    const getBackLink = () => {
        if (from === 'admin-users') return '/admin/users';
        if (from === 'shortlisted') return '/shortlisted';
        if (from === 'connections') return '/connections';
        if (isOwnProfile) return '/profile';
        return '/matches';
    };

    const getBackText = () => {
        if (from === 'admin-users') return 'Back to Users';
        if (from === 'shortlisted') return 'Back to Shortlisted';
        if (from === 'connections') return 'Back to Connections';
        if (isOwnProfile) return 'Back to My Profile';
        return 'Back to Matches';
    };


    return (
        <ClientRouteGuard>
            <DashboardLayout>
                <Box sx={{ pb: 8 }}>
                    <Container maxWidth="md" sx={{ mt: 0 }}>
                        <Button
                            startIcon={<ArrowBack />}
                            component={Link}
                            href={getBackLink()}
                            sx={{ mb: 3 }}
                        >
                            {getBackText()}
                        </Button>

                        <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                            {/* Header Section */}
                            <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                                    <Avatar
                                        src={profile.profilePicture ? `${API_URL.replace('/api', '')}/uploads/${profile.profilePicture}` : undefined}
                                        sx={{
                                            width: { xs: 120, md: 150 },
                                            height: { xs: 120, md: 150 },
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            fontSize: '3rem',
                                            bgcolor: profile.profilePicture ? 'transparent' : 'grey.200',
                                            color: 'grey.400'
                                        }}
                                        variant="circular"
                                    >
                                        {profile.profilePicture ? null : (
                                            profile.gender === 'MALE' ? <Man sx={{ fontSize: 80 }} /> :
                                                profile.gender === 'FEMALE' ? <Woman sx={{ fontSize: 80 }} /> :
                                                    <Person sx={{ fontSize: 80 }} />
                                        )}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' }, mb: { xs: 2, md: 0 } }}>
                                        <Typography variant="h4" fontWeight={700}>
                                            {profile.firstName} {profile.lastName}
                                        </Typography>

                                        <Stack direction="column" spacing={1} alignItems={{ xs: 'center', md: 'flex-start' }} sx={{ mt: 1 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <LocationOn fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                    {[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Location not set'}
                                                </Typography>
                                            </Stack>
                                            {(profile.collegeName || profile.education || profile.highestQualification) && (
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <School fontSize="small" color="action" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {profile.collegeName || profile.education || profile.highestQualification}
                                                    </Typography>
                                                </Stack>
                                            )}
                                            {(profile.occupation || profile.workAs) && (
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Work fontSize="small" color="action" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {profile.occupation || profile.workAs}
                                                    </Typography>
                                                </Stack>
                                            )}
                                        </Stack>
                                    </Box>

                                    {!isOwnProfile && from !== 'admin-users' && (
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Button
                                                variant={isShortlisted ? "contained" : "outlined"}
                                                startIcon={isShortlisted ? <Bookmark /> : <BookmarkBorder />}
                                                onClick={handleShortlistToggle}
                                                color={isShortlisted ? "secondary" : "primary"}
                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                            >
                                                {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                                            </Button>
                                            <ConnectButton
                                                targetUserId={profile.userId}
                                                initialStatus={connectionStatus.status}
                                                initialRequestId={connectionStatus.requestId}
                                                initialDirection={connectionStatus.direction}
                                                onStatusChange={(status) => {
                                                    setConnectionStatus(prev => ({ ...prev, status }));
                                                }}
                                            />
                                            <IconButton
                                                onClick={handleMenuOpen}
                                                sx={{
                                                    bgcolor: 'grey.200',
                                                    borderRadius: 2,
                                                    height: 36,
                                                    width: 48,
                                                    '&:hover': { bgcolor: 'grey.300' }
                                                }}
                                            >
                                                <MoreHoriz />
                                            </IconButton>
                                            <Menu
                                                anchorEl={moreMenuAnchor}
                                                open={Boolean(moreMenuAnchor)}
                                                onClose={handleMenuClose}
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                                slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 200, mt: 1, boxShadow: 4 } } }}
                                            >
                                                <MenuItem onClick={handleShareProfile}>
                                                    <ListItemIcon><Share fontSize="small" /></ListItemIcon>
                                                    <ListItemText>Share Profile</ListItemText>
                                                </MenuItem>
                                                <MenuItem onClick={() => { handleMenuClose(); alert('Report feature coming soon'); }}>
                                                    <ListItemIcon><Flag fontSize="small" /></ListItemIcon>
                                                    <ListItemText>Report Profile</ListItemText>
                                                </MenuItem>
                                                <MenuItem onClick={() => { handleMenuClose(); alert('Block feature coming soon'); }} sx={{ color: 'error.main' }}>
                                                    <ListItemIcon><Block fontSize="small" color="error" /></ListItemIcon>
                                                    <ListItemText>Block</ListItemText>
                                                </MenuItem>
                                            </Menu>
                                        </Stack>
                                    )}
                                </Stack>
                            </Box>

                            <Divider />

                            {/* Details Grid */}
                            <Box sx={{ p: 4 }}>
                                <Stack spacing={4}>
                                    {/* Basic Info */}
                                    <SectionView title="Basic Information">
                                        <InfoItem label="Full Name" value={[profile.firstName, profile.lastName].filter(Boolean).join(' ')} />
                                        <InfoItem label="Gender" value={profile.gender} />
                                        <InfoItem label="Date of Birth" value={profile.dob} />
                                        <InfoItem label="Age" value={profile.dob ? `${new Date().getFullYear() - new Date(profile.dob).getFullYear()} Years` : null} />
                                        <InfoItem label="Marital Status" value={profile.maritalStatus?.replace('_', ' ')} />
                                    </SectionView>

                                    <Divider />

                                    <SectionView title="Location & Community">
                                        <InfoItem label="Location" value={[profile.city, profile.state, profile.country].filter(Boolean).join(', ')} />
                                        <InfoItem label="Religion" value={profile.religion} />
                                        <InfoItem label="Community" value={profile.community} />
                                        <InfoItem label="Sub Caste" value={profile.subCaste} />
                                        <InfoItem label="Gotra" value={profile.gotra} />
                                        <InfoItem label="Native Place" value={profile.nativePlace} />
                                    </SectionView>

                                    <Divider />

                                    <SectionView title="Education & Profession">
                                        <InfoItem label="Highest Qualification" value={profile.highestQualification} />
                                        <InfoItem label="College" value={profile.collegeName} />
                                        <InfoItem label="Occupation" value={profile.occupation || profile.workAs} />
                                        <InfoItem label="Employed In" value={profile.workWith?.replace('_', ' ')} />
                                        <InfoItem label="Works At" value={profile.workAt} />
                                        <InfoItem label="Income" value={profile.incomeRange ? `${profile.incomeRange} ${profile.incomeType ? `(${profile.incomeType})` : ''}` : null} />
                                    </SectionView>

                                    <Divider />

                                    <SectionView title="Lifestyle">
                                        <InfoItem label="Diet" value={profile.diet} />
                                        <InfoItem label="Height" value={profile.height ? `${profile.height} cm` : null} />
                                        <InfoItem label="Living with Family" value={profile.liveWithFamily !== null ? (profile.liveWithFamily ? 'Yes' : 'No') : null} />
                                    </SectionView>

                                    <Divider />

                                    <SectionView title="Family Details">
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {profile.familyDetails || 'No family details provided.'}
                                            </Typography>
                                        </Box>
                                    </SectionView>

                                    {profile.bio && (
                                        <>
                                            <Divider />
                                            <Box>
                                                <Typography variant="h6" gutterBottom color="primary">About Me</Typography>
                                                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{profile.bio}</Typography>
                                            </Box>
                                        </>
                                    )}
                                </Stack>
                            </Box>
                        </Paper>

                        {/* Photo Gallery - Public View */}
                        {profile.photos && profile.photos.length > 0 && (
                            <Paper sx={{ borderRadius: 4, overflow: 'hidden', mt: 3, p: 4 }}>
                                <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>Photos</Typography>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                                    gap: 2,
                                }}>
                                    {profile.photos.map((photo: any, index: number) => (
                                        <Box
                                            key={photo.id}
                                            sx={{
                                                aspectRatio: '1',
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                transition: 'transform 0.2s',
                                                '&:hover': { transform: 'scale(1.02)' }
                                            }}
                                            onClick={() => {
                                                setLightboxIndex(index);
                                                setLightboxOpen(true);
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={photo.url?.startsWith('http') ? photo.url : `${API_URL.replace('/api', '')}/uploads/${photo.url}`}
                                                alt={`Photo ${index + 1}`}
                                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                                <GalleryLightbox
                                    open={lightboxOpen}
                                    onClose={() => setLightboxOpen(false)}
                                    images={profile.photos.map((p: any) => ({ id: p.id, url: p.url }))}
                                    initialIndex={lightboxIndex}
                                />
                            </Paper>
                        )}
                        
                        <ShareProfileDialog 
                            open={isShareDialogOpen}
                            onClose={() => setIsShareDialogOpen(false)}
                            shareUrl={shareUrl}
                        />
                    </Container>
                </Box>
            </DashboardLayout>
        </ClientRouteGuard>
    );
}

function SectionView({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Box>
            <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>{title}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {children}
            </Box>
        </Box>
    );
}

function InfoItem({ label, value }: { label: string; value: any }) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>{label}</Typography>
            <Typography variant="body1" fontWeight={500}>{value || '-'}</Typography>
        </Box>
    );
}
