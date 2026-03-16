'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Stack,
    Divider,
    IconButton,
    Avatar,
    Tabs,
    Tab,
    Chip
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    CameraAlt,
    Visibility,
    LocationOn,
    Person,
    Man,
    Woman,
    Add as AddIcon,
    School,
    Work
} from '@mui/icons-material';
import ImageUploadModal from '@/components/profile/ImageUploadModal';
import ImageGallery from '@/components/profile/ImageGallery';
import { State, City } from 'country-state-city';
import { API_URL } from '@/lib/api';

// ─── About Tab Section Definitions ───
const ABOUT_SECTIONS = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'location', label: 'Location & Community' },
    { key: 'personal', label: 'Personal & Lifestyle' },
    { key: 'education', label: 'Education & Income' },
    { key: 'work', label: 'Work Details' },
] as const;

type AboutSectionKey = typeof ABOUT_SECTIONS[number]['key'];

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profileData, setProfileData] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    // Tabs
    const [activeTab, setActiveTab] = useState(0); // 0=All, 1=About, 2=Photos

    // About tab state
    const [aboutSection, setAboutSection] = useState<AboutSectionKey>('basic');
    const [editingSection, setEditingSection] = useState<AboutSectionKey | null>(null);

    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            const data = await fetchApi('/profile/me');
            setProfileData(data);
            setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                gender: data.gender || 'MALE',
                dob: data.dob || '',
                country: data.country || '',
                state: data.state || '',
                city: data.city || '',
                religion: data.religion || '',
                community: data.community || '',
                subCaste: data.subCaste || '',
                nativePlace: data.nativePlace || '',
                gotra: data.gotra || '',
                height: data.height || '',
                maritalStatus: data.maritalStatus || 'NEVER_MARRIED',
                diet: data.diet || 'VEG',
                liveWithFamily: data.liveWithFamily || false,
                bio: data.bio || '',
                highestQualification: data.highestQualification || '',
                collegeName: data.collegeName || '',
                incomeType: data.incomeType || 'MONTHLY',
                incomeRange: data.incomeRange || '',
                education: data.education || '',
                occupation: data.occupation || '',
                workWith: data.workWith || '',
                workAs: data.workAs || '',
                workAt: data.workAt || '',
                email: data.email || '',
                phone: data.phone || ''
            });
        } catch (err: any) {
            console.error(err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = (fileName: string) => {
        setProfileData((prev: any) => ({ ...prev, profilePicture: fileName }));
        loadProfile();
    };

    const handleGalleryChange = () => loadProfile();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSaveSection = async () => {
        setError('');
        setSuccess('');
        setSaving(true);

        const payload = {
            ...formData,
            height: formData.height ? parseFloat(String(formData.height)) : null,
            liveWithFamily: formData.liveWithFamily
        };

        try {
            const updatedProfile = await fetchApi('/profile', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            setProfileData(updatedProfile);
            setSuccess('Section updated successfully!');
            setEditingSection(null);
        } catch (err: any) {
            setError(err.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    // Height options
    const heightOptions: { val: number; label: string }[] = [];
    for (let c = 134; c <= 213; c++) {
        const realFeet = c * 0.0328084;
        const feet = Math.floor(realFeet);
        const inches = Math.round((realFeet - feet) * 12);
        heightOptions.push({ val: c, label: `${feet}ft ${inches}in - ${c}cm` });
    }

    const getImageUrl = (url: string) => {
        if (!url) return undefined;
        if (url.startsWith('http')) return url;
        return `${API_URL.replace('/api', '')}/uploads/${url}`;
    };

    if (loading) return (
        <DashboardLayout>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        </DashboardLayout>
    );

    if (!profileData) return (
        <DashboardLayout>
            <Alert severity="error" sx={{ m: 4 }}>{error || 'Failed to load profile data.'}</Alert>
        </DashboardLayout>
    );

    // ─── RENDER ───
    return (
        <DashboardLayout>
            <ImageUploadModal open={showUploadModal} onClose={() => setShowUploadModal(false)} onUploadSuccess={handleUploadSuccess} />
            <Box sx={{ pb: 4 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

                {/* ═══ HERO SECTION ═══ */}
                <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 0 }}>
                    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                            {/* Avatar */}
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={getImageUrl(profileData.profilePicture)}
                                    sx={{
                                        width: { xs: 120, md: 150 },
                                        height: { xs: 120, md: 150 },
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: 'grey.200',
                                        color: 'grey.400',
                                        fontSize: '3rem',
                                    }}
                                >
                                    {profileData.profilePicture ? null : (
                                        profileData.gender === 'MALE' ? <Man sx={{ fontSize: 80 }} /> :
                                            profileData.gender === 'FEMALE' ? <Woman sx={{ fontSize: 80 }} /> :
                                                <Person sx={{ fontSize: 80 }} />
                                    )}
                                </Avatar>
                                <IconButton
                                    onClick={() => setShowUploadModal(true)}
                                    sx={{
                                        position: 'absolute',
                                        bottom: 4, right: 4,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        width: 36, height: 36,
                                        boxShadow: 2,
                                        '&:hover': { bgcolor: 'primary.dark' }
                                    }}
                                >
                                    <CameraAlt sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Box>

                            {/* Name + Location */}
                            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' }, mb: { xs: 1, md: 0 } }}>
                                <Typography variant="h4" fontWeight={700}>
                                    {profileData.firstName} {profileData.lastName}
                                </Typography>
                                <Stack direction="column" spacing={1} alignItems={{ xs: 'center', md: 'flex-start' }} sx={{ mt: 1 }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <LocationOn fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                            {[profileData.city, profileData.state, profileData.country].filter(Boolean).join(', ') || 'Location not set'}
                                        </Typography>
                                    </Stack>
                                    {(profileData.collegeName || profileData.education || profileData.highestQualification) && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <School fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {profileData.collegeName || profileData.education || profileData.highestQualification}
                                            </Typography>
                                        </Stack>
                                    )}
                                    {profileData.occupation && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Work fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {profileData.occupation || profileData.workAs}
                                            </Typography>
                                        </Stack>
                                    )}
                                </Stack>
                            </Box>

                            {/* Action Buttons */}
                            <Stack direction="row" spacing={1.5} sx={{ mb: { xs: 0, md: 1 } }}>
                                <Button
                                    variant="contained"
                                    startIcon={<EditIcon />}
                                    onClick={() => {
                                        setActiveTab(1); // Switch to About tab
                                        setEditingSection('basic'); // Open editing form directly
                                    }}
                                    sx={{ borderRadius: 2, textTransform: 'none' }}
                                >
                                    Edit Profile
                                </Button>
                                <Button
                                    variant="contained"
                                    color="inherit"
                                    startIcon={<Visibility />}
                                    component={Link}
                                    href={`/profile/${profileData.id}`}
                                    sx={{ borderRadius: 2, textTransform: 'none', bgcolor: 'grey.200', color: 'grey.800', '&:hover': { bgcolor: 'grey.300' } }}
                                >
                                    View As
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>

                    {/* ═══ TABS BAR ═══ */}
                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                        <Tabs
                            value={activeTab}
                            onChange={(_, v) => setActiveTab(v)}
                            sx={{ px: { xs: 2, md: 4 }, minHeight: 48 }}
                        >
                            <Tab label="All" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 48 }} />
                            <Tab label="About" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 48 }} />
                            <Tab label="Photos" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 48 }} />
                        </Tabs>
                    </Box>
                </Paper>

                {/* ═══ TAB CONTENT ═══ */}
                <Box sx={{ mt: 2 }}>
                    {/* ─── ALL TAB ─── */}
                    {activeTab === 0 && (
                        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                            <Stack spacing={4}>
                                <ReadOnlySection title="Basic Information">
                                    <InfoItem label="Full Name" value={`${profileData.firstName} ${profileData.lastName}`} />
                                    <InfoItem label="Email" value={profileData.email} />
                                    <InfoItem label="Phone" value={profileData.phone} />
                                    <InfoItem label="Gender" value={profileData.gender} />
                                    <InfoItem label="Date of Birth" value={profileData.dob} />
                                    <InfoItem label="Marital Status" value={profileData.maritalStatus?.replace(/_/g, ' ')} />
                                </ReadOnlySection>

                                <Divider />

                                <ReadOnlySection title="Location & Community">
                                    <InfoItem label="Location" value={[profileData.city, profileData.state, profileData.country].filter(Boolean).join(', ')} />
                                    <InfoItem label="Religion" value={profileData.religion} />
                                    <InfoItem label="Community" value={profileData.community} />
                                    <InfoItem label="Sub Caste" value={profileData.subCaste} />
                                    <InfoItem label="Gotra" value={profileData.gotra} />
                                    <InfoItem label="Native Place" value={profileData.nativePlace} />
                                </ReadOnlySection>

                                <Divider />

                                <ReadOnlySection title="Education & Profession">
                                    <InfoItem label="Highest Qualification" value={profileData.highestQualification} />
                                    <InfoItem label="College" value={profileData.collegeName} />
                                    <InfoItem label="Occupation" value={profileData.occupation || profileData.workAs} />
                                    <InfoItem label="Employed In" value={profileData.workWith?.replace(/_/g, ' ')} />
                                    <InfoItem label="Works At" value={profileData.workAt} />
                                    <InfoItem label="Income" value={profileData.incomeRange ? `${profileData.incomeRange} (${profileData.incomeType})` : null} />
                                </ReadOnlySection>

                                <Divider />

                                <ReadOnlySection title="Lifestyle">
                                    <InfoItem label="Diet" value={profileData.diet?.replace(/_/g, ' ')} />
                                    <InfoItem label="Height" value={profileData.height ? `${profileData.height} cm` : null} />
                                    <InfoItem label="Living with Family" value={profileData.liveWithFamily !== null ? (profileData.liveWithFamily ? 'Yes' : 'No') : null} />
                                </ReadOnlySection>

                                {profileData.bio && (
                                    <>
                                        <Divider />
                                        <Box>
                                            <Typography variant="h6" gutterBottom color="primary">About Me</Typography>
                                            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{profileData.bio}</Typography>
                                        </Box>
                                    </>
                                )}
                            </Stack>
                        </Paper>
                    )}

                    {/* ─── ABOUT TAB ─── */}
                    {activeTab === 1 && (
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            {/* Left sidebar nav */}
                            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', minWidth: { md: 220 }, p: 1 }}>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ px: 2, py: 1.5, color: 'text.secondary' }}>About</Typography>
                                {ABOUT_SECTIONS.map(s => (
                                    <Box
                                        key={s.key}
                                        onClick={() => { setAboutSection(s.key); setEditingSection(null); }}
                                        sx={{
                                            px: 2, py: 1, borderRadius: 2, cursor: 'pointer',
                                            bgcolor: aboutSection === s.key ? 'action.selected' : 'transparent',
                                            color: aboutSection === s.key ? 'primary.main' : 'text.primary',
                                            fontWeight: aboutSection === s.key ? 600 : 400,
                                            '&:hover': { bgcolor: 'action.hover' },
                                            fontSize: '0.9rem',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {s.label}
                                    </Box>
                                ))}
                            </Paper>

                            {/* Right content */}
                            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', p: { xs: 2, md: 4 }, flexGrow: 1 }}>
                                {aboutSection === 'basic' && (
                                    editingSection === 'basic' ? (
                                        <EditSection title="Basic Information" onSave={handleSaveSection} onCancel={() => setEditingSection(null)} saving={saving}>
                                            <TextField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} fullWidth required />
                                            <TextField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} fullWidth required />
                                            <TextField select label="Gender" name="gender" value={formData.gender} onChange={handleChange} fullWidth required>
                                                <MenuItem value="MALE">Male</MenuItem>
                                                <MenuItem value="FEMALE">Female</MenuItem>
                                                <MenuItem value="OTHER">Other</MenuItem>
                                            </TextField>
                                            <TextField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
                                            <TextField select label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} fullWidth required>
                                                <MenuItem value="NEVER_MARRIED">Never Married</MenuItem>
                                                <MenuItem value="DIVORCED">Divorced</MenuItem>
                                                <MenuItem value="WIDOWED">Widowed</MenuItem>
                                                <MenuItem value="AWAITING_DIVORCE">Awaiting Divorce</MenuItem>
                                                <MenuItem value="ANNULLED">Annulled</MenuItem>
                                            </TextField>
                                        </EditSection>
                                    ) : (
                                        <ViewSection title="Basic Information" onEdit={() => setEditingSection('basic')}>
                                            <InfoItem label="Full Name" value={`${profileData.firstName} ${profileData.lastName}`} />
                                            <InfoItem label="Email" value={profileData.email} />
                                            <InfoItem label="Phone" value={profileData.phone} />
                                            <InfoItem label="Gender" value={profileData.gender} />
                                            <InfoItem label="Date of Birth" value={profileData.dob} />
                                            <InfoItem label="Marital Status" value={profileData.maritalStatus?.replace(/_/g, ' ')} />
                                        </ViewSection>
                                    )
                                )}

                                {aboutSection === 'location' && (
                                    editingSection === 'location' ? (
                                        <EditSection title="Location & Community" onSave={handleSaveSection} onCancel={() => setEditingSection(null)} saving={saving}>
                                            <TextField label="Religion" name="religion" value={formData.religion} onChange={handleChange} fullWidth required />
                                            <TextField label="Community" name="community" value={formData.community} onChange={handleChange} fullWidth required />
                                            <TextField label="Sub Caste" name="subCaste" value={formData.subCaste} onChange={handleChange} fullWidth />
                                            <TextField label="Gotra" name="gotra" value={formData.gotra} onChange={handleChange} fullWidth />
                                            <TextField label="Native Place" name="nativePlace" value={formData.nativePlace} onChange={handleChange} fullWidth />
                                            <TextField select label="Country" name="country" value={formData.country} onChange={handleChange} fullWidth required>
                                                <MenuItem value="India">India</MenuItem>
                                            </TextField>
                                            <TextField
                                                select label="State" name="state" value={formData.state}
                                                onChange={(e) => {
                                                    handleChange(e as any);
                                                    setFormData((prev: any) => ({ ...prev, city: '' }));
                                                }}
                                                fullWidth required
                                            >
                                                {State.getStatesOfCountry('IN').map((state) => (
                                                    <MenuItem key={state.isoCode} value={state.name}>{state.name}</MenuItem>
                                                ))}
                                            </TextField>
                                            <TextField
                                                select label="City" name="city" value={formData.city}
                                                onChange={handleChange} fullWidth required disabled={!formData.state}
                                            >
                                                {(() => {
                                                    const states = State.getStatesOfCountry('IN');
                                                    const selectedState = states.find(s => s.name === formData.state);
                                                    const cities = selectedState ? City.getCitiesOfState('IN', selectedState.isoCode) : [];
                                                    if (cities.length > 0) return cities.map(city => <MenuItem key={city.name} value={city.name}>{city.name}</MenuItem>);
                                                    return <MenuItem value="" disabled>Select a State first</MenuItem>;
                                                })()}
                                            </TextField>
                                        </EditSection>
                                    ) : (
                                        <ViewSection title="Location & Community" onEdit={() => setEditingSection('location')}>
                                            <InfoItem label="Location" value={[profileData.city, profileData.state, profileData.country].filter(Boolean).join(', ')} />
                                            <InfoItem label="Religion" value={profileData.religion} />
                                            <InfoItem label="Community" value={profileData.community} />
                                            <InfoItem label="Sub Caste" value={profileData.subCaste} />
                                            <InfoItem label="Gotra" value={profileData.gotra} />
                                            <InfoItem label="Native Place" value={profileData.nativePlace} />
                                        </ViewSection>
                                    )
                                )}

                                {aboutSection === 'personal' && (
                                    editingSection === 'personal' ? (
                                        <EditSection title="Personal & Lifestyle" onSave={handleSaveSection} onCancel={() => setEditingSection(null)} saving={saving}>
                                            <TextField select label="Height" name="height" value={formData.height} onChange={handleChange} fullWidth required>
                                                {heightOptions.map(h => <MenuItem key={h.val} value={h.val}>{h.label}</MenuItem>)}
                                            </TextField>
                                            <TextField select label="Diet" name="diet" value={formData.diet} onChange={handleChange} fullWidth required>
                                                <MenuItem value="VEG">Veg</MenuItem>
                                                <MenuItem value="NON_VEG">Non-Veg</MenuItem>
                                                <MenuItem value="OCCASIONALLY_NON_VEG">Occasionally Non-Veg</MenuItem>
                                                <MenuItem value="EGGETARIAN">Eggetarian</MenuItem>
                                                <MenuItem value="JAIN">Jain</MenuItem>
                                                <MenuItem value="VEGAN">Vegan</MenuItem>
                                            </TextField>
                                            <FormControlLabel
                                                control={<Checkbox checked={formData.liveWithFamily} onChange={handleChange} name="liveWithFamily" />}
                                                label="Live with Family"
                                            />
                                            <TextField label="Bio" name="bio" multiline rows={4} value={formData.bio} onChange={handleChange} fullWidth placeholder="Tell us about yourself..." sx={{ gridColumn: '1 / -1' }} />
                                        </EditSection>
                                    ) : (
                                        <ViewSection title="Personal & Lifestyle" onEdit={() => setEditingSection('personal')}>
                                            <InfoItem label="Diet" value={profileData.diet?.replace(/_/g, ' ')} />
                                            <InfoItem label="Height" value={profileData.height ? `${profileData.height} cm` : null} />
                                            <InfoItem label="Living with Family" value={profileData.liveWithFamily !== null ? (profileData.liveWithFamily ? 'Yes' : 'No') : null} />
                                            {profileData.bio && (
                                                <Box sx={{ gridColumn: '1 / -1' }}>
                                                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Bio</Typography>
                                                    <Typography variant="body1" fontWeight={500} sx={{ whiteSpace: 'pre-wrap' }}>{profileData.bio}</Typography>
                                                </Box>
                                            )}
                                        </ViewSection>
                                    )
                                )}

                                {aboutSection === 'education' && (
                                    editingSection === 'education' ? (
                                        <EditSection title="Education & Income" onSave={handleSaveSection} onCancel={() => setEditingSection(null)} saving={saving}>
                                            <TextField label="Highest Qualification" name="highestQualification" value={formData.highestQualification} onChange={handleChange} fullWidth required />
                                            <TextField label="College Name" name="collegeName" value={formData.collegeName} onChange={handleChange} fullWidth />
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <TextField select label="Type" name="incomeType" value={formData.incomeType} onChange={handleChange} sx={{ minWidth: 100 }}>
                                                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                                                    <MenuItem value="YEARLY">Yearly</MenuItem>
                                                </TextField>
                                                <TextField select label="Income Range" name="incomeRange" value={formData.incomeRange} onChange={handleChange} fullWidth required>
                                                    <MenuItem value="0-3 LPA">0-3 LPA / &lt; 25k PM</MenuItem>
                                                    <MenuItem value="3-5 LPA">3-5 LPA / 25k-40k PM</MenuItem>
                                                    <MenuItem value="5-8 LPA">5-8 LPA / 40k-65k PM</MenuItem>
                                                    <MenuItem value="8-12 LPA">8-12 LPA / 65k-1L PM</MenuItem>
                                                    <MenuItem value="12-20 LPA">12-20 LPA / 1L-1.6L PM</MenuItem>
                                                    <MenuItem value="20+ LPA">20+ LPA / 1.6L+ PM</MenuItem>
                                                </TextField>
                                            </Box>
                                        </EditSection>
                                    ) : (
                                        <ViewSection title="Education & Income" onEdit={() => setEditingSection('education')}>
                                            <InfoItem label="Highest Qualification" value={profileData.highestQualification} />
                                            <InfoItem label="College" value={profileData.collegeName} />
                                            <InfoItem label="Income" value={profileData.incomeRange ? `${profileData.incomeRange} (${profileData.incomeType})` : null} />
                                        </ViewSection>
                                    )
                                )}

                                {aboutSection === 'work' && (
                                    editingSection === 'work' ? (
                                        <EditSection title="Work Details" onSave={handleSaveSection} onCancel={() => setEditingSection(null)} saving={saving}>
                                            <TextField select label="Work With" name="workWith" value={formData.workWith} onChange={handleChange} fullWidth required>
                                                <MenuItem value="PRIVATE_COMPANY">Private Company</MenuItem>
                                                <MenuItem value="GOVERNMENT_JOB">Government Job</MenuItem>
                                                <MenuItem value="BUSINESS">Business</MenuItem>
                                                <MenuItem value="SELF_EMPLOYED">Self Employed</MenuItem>
                                                <MenuItem value="STUDENT">Student</MenuItem>
                                                <MenuItem value="NOT_WORKING">Not Working</MenuItem>
                                            </TextField>
                                            <TextField label="Work As (Designation)" name="workAs" value={formData.workAs} onChange={handleChange} fullWidth required />
                                            <TextField label="Work At (Company/Dept)" name="workAt" value={formData.workAt} onChange={handleChange} fullWidth placeholder="Optional" />
                                        </EditSection>
                                    ) : (
                                        <ViewSection title="Work Details" onEdit={() => setEditingSection('work')}>
                                            <InfoItem label="Occupation" value={profileData.occupation || profileData.workAs} />
                                            <InfoItem label="Employed In" value={profileData.workWith?.replace(/_/g, ' ')} />
                                            <InfoItem label="Works At" value={profileData.workAt} />
                                        </ViewSection>
                                    )
                                )}
                            </Paper>
                        </Stack>
                    )}

                    {/* ─── PHOTOS TAB ─── */}
                    {activeTab === 2 && (
                        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                            <ImageGallery
                                photos={profileData.photos || []}
                                onPhotosChange={handleGalleryChange}
                                editable={true}
                            />
                        </Paper>
                    )}
                </Box>
            </Box>
        </DashboardLayout>
    );
}

// ─── Reusable Sub-Components ───

function ReadOnlySection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Box>
            <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>{title}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {children}
            </Box>
        </Box>
    );
}

function ViewSection({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit: () => void }) {
    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" color="primary">{title}</Typography>
                <IconButton onClick={onEdit} size="small" color="primary" title="Edit">
                    <EditIcon fontSize="small" />
                </IconButton>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {children}
            </Box>
        </Box>
    );
}

function EditSection({ title, children, onSave, onCancel, saving }: {
    title: string; children: React.ReactNode; onSave: () => void; onCancel: () => void; saving: boolean;
}) {
    return (
        <Box>
            <Typography variant="h6" color="primary" gutterBottom>{title}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {children}
            </Box>
            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={onCancel} startIcon={<CloseIcon />} size="small">Cancel</Button>
                <Button variant="contained" onClick={onSave} disabled={saving} startIcon={<SaveIcon />} size="small">
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </Stack>
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
