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
    Toolbar
} from '@mui/material';
import { ArrowBack, LocationOn, Favorite, BookmarkBorder, Bookmark, Man, Woman, Person } from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ClientRouteGuard from '@/components/auth/ClientRouteGuard';

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
                            <Box sx={{ bgcolor: 'primary.main', height: 150, position: 'relative' }}>
                            </Box>
                            <Box sx={{ px: 4, pb: 4, mt: -6 }}>
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'center', md: 'flex-end' }}>
                                    <Avatar
                                        src={profile.profilePicture ? `${API_URL.replace('/api', '')}/uploads/${profile.profilePicture}` : undefined}
                                        sx={{
                                            width: 150,
                                            height: 150,
                                            border: '4px solid white',
                                            fontSize: '3rem',
                                            bgcolor: profile.profilePicture ? 'transparent' : 'grey.200',
                                            color: 'grey.400'
                                        }}
                                        variant={profile.profilePicture ? 'circular' : 'circular'}
                                    >
                                        {profile.profilePicture ? null : (
                                            profile.gender === 'MALE' ? <Man sx={{ fontSize: 100 }} /> :
                                                profile.gender === 'FEMALE' ? <Woman sx={{ fontSize: 100 }} /> :
                                                    <Person sx={{ fontSize: 100 }} />
                                        )}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' }, mb: { xs: 2, md: 0 } }}>
                                        <Typography variant="h4" fontWeight={700}>
                                            {profile.firstName} {profile.lastName}
                                        </Typography>
                                        <Typography color="text.secondary" variant="subtitle1" gutterBottom>
                                            {profile.education} • {profile.occupation}
                                        </Typography>
                                        <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
                                            <LocationOn fontSize="small" color="action" />
                                            <Typography variant="body2">{profile.nativePlace || 'Location Not Specified'}</Typography>
                                        </Stack>
                                    </Box>
                                    {!isOwnProfile && from !== 'admin-users' && (
                                        <Stack direction="row" spacing={2}>
                                            <Button
                                                variant={isShortlisted ? "contained" : "outlined"}
                                                startIcon={isShortlisted ? <Bookmark /> : <BookmarkBorder />}
                                                onClick={handleShortlistToggle}
                                                color={isShortlisted ? "secondary" : "primary"}
                                            >
                                                {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                                            </Button>
                                            <ConnectButton
                                                targetUserId={profile.userId}
                                                initialStatus={connectionStatus.status}
                                                initialRequestId={connectionStatus.requestId}
                                                initialDirection={connectionStatus.direction}
                                                onStatusChange={(status) => {
                                                    // Optional: refresh page or updates state if needed
                                                    setConnectionStatus(prev => ({ ...prev, status }));
                                                }}
                                            />
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
