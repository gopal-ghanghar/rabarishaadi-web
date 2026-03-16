'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi, API_URL } from '@/lib/api';
import {
    Box,
    Container,
    Typography,
    Paper,
    Avatar,
    Stack,
    CircularProgress,
    Divider,
} from '@mui/material';
import {
    Person,
    Man,
    Woman,
    LocationOn,
    School,
    Work,
} from '@mui/icons-material';
import GalleryLightbox from '@/components/profile/GalleryLightbox';
// Assuming there is a simpler layout or just generic wrapping for public pages
// If not, we'll import a basic Header or just display it cleanly.

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const token = params?.token;

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    useEffect(() => {
        if (!token) return;

        const loadProfile = async () => {
            try {
                // Determine base API_URL since fetchApi might add auth headers, but backend allows unauth here.
                // We'll use traditional fetch so we don't send auth/interceptors if fetchApi forces it,
                // but fetchApi might be fine. We'll use fetchApi as it handles base paths.
                // Wait, if fetchApi throws on 401 when token is missing, public path should be fine.
                const res = await fetch(`${API_URL.replace('/api', '')}/api/public/profile/share/${token}`, {
                    headers: { 'Accept': 'application/json' }
                });
                
                if (!res.ok) {
                    throw new Error('Profile not found or link expired');
                }
                
                const data = await res.json();
                setProfile(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to load profile. It may not exist or the link expired.');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [token]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'grey.50' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !profile) {
        return (
            <Box sx={{ display: 'flex', flexDir: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'grey.50' }}>
                <Typography color="error" variant="h6">{error || 'Profile not found'}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ pb: 8, pt: 4, minHeight: '100vh', bgcolor: 'grey.50' }}>
            <Container maxWidth="md">
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h5" color="primary" fontWeight="bold">Rabari Shaadi</Typography>
                    <Typography variant="subtitle2" color="text.secondary">Public Profile View</Typography>
                </Box>
                <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 3 }}>
                    {/* Header Section */}
                    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, bgcolor: 'white' }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                            <Avatar
                                src={profile.profilePicture ? `${API_URL.replace('/api', '')}/uploads/${profile.profilePicture}` : undefined}
                                sx={{
                                    width: { xs: 150, md: 180 },
                                    height: { xs: 150, md: 180 },
                                    border: '4px solid',
                                    borderColor: 'primary.light',
                                    fontSize: '4rem',
                                    bgcolor: profile.profilePicture ? 'transparent' : 'grey.200',
                                    color: 'grey.400'
                                }}
                                variant="circular"
                            >
                                {profile.profilePicture ? null : (
                                    profile.gender === 'MALE' ? <Man sx={{ fontSize: 100 }} /> :
                                        profile.gender === 'FEMALE' ? <Woman sx={{ fontSize: 100 }} /> :
                                            <Person sx={{ fontSize: 100 }} />
                                )}
                            </Avatar>
                            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
                                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                                    {profile.firstName} {profile.lastName}
                                </Typography>

                                <Stack direction="column" spacing={1.5} alignItems={{ xs: 'center', md: 'flex-start' }} sx={{ mt: 2 }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <LocationOn fontSize="small" color="primary" />
                                        <Typography variant="body1" color="text.secondary">
                                            {[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Location not set'}
                                        </Typography>
                                    </Stack>
                                    {(profile.collegeName || profile.education || profile.highestQualification) && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <School fontSize="small" color="primary" />
                                            <Typography variant="body1" color="text.secondary">
                                                {profile.collegeName || profile.education || profile.highestQualification}
                                            </Typography>
                                        </Stack>
                                    )}
                                    {(profile.occupation || profile.workAs) && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Work fontSize="small" color="primary" />
                                            <Typography variant="body1" color="text.secondary">
                                                {profile.occupation || profile.workAs}
                                            </Typography>
                                        </Stack>
                                    )}
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>

                    <Divider />

                    {/* Details Grid */}
                    <Box sx={{ p: 4, bgcolor: 'grey.50' }}>
                        <Stack spacing={4}>
                            {/* Basic Info */}
                            <SectionView title="Basic Information">
                                <InfoItem label="Full Name" value={[profile.firstName, profile.lastName].filter(Boolean).join(' ')} />
                                <InfoItem label="Gender" value={profile.gender} />
                                {/* Hide specific DOB but show Age? The prompt says "UI should only show user details not actionable items."
                                    We'll show all details as the normal profile does. */}
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
                    <Paper sx={{ borderRadius: 4, overflow: 'hidden', mt: 3, p: 4, boxShadow: 3 }}>
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
            </Container>
        </Box>
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
