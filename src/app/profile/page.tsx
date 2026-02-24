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
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    Container,
    Stack,
    Divider,
    Grid,
    IconButton,
    Avatar
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Close as CloseIcon, ArrowBack as ArrowBackIcon, CameraAlt, Visibility } from '@mui/icons-material';
import ImageUploadModal from '@/components/profile/ImageUploadModal';
import { State, City } from 'country-state-city';
import { API_URL } from '@/lib/api';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profileData, setProfileData] = useState<any>(null);

    // Form state for editing
    const [formData, setFormData] = useState<any>({});

    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await fetchApi('/profile/me');
            setProfileData(data);
            // Initialize form data
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
        // Also refresh user in auth store if needed, but for now just update local state
        loadProfile(); // Reload to get everything synced
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validate = () => {
        if (!formData.firstName || !formData.lastName || !formData.gender || !formData.dob) return 'Basic details are missing.';
        if (!formData.country || !formData.state || !formData.city) return 'Location details are missing.';
        if (!formData.religion || !formData.community) return 'Community details are missing.';
        if (!formData.height || !formData.maritalStatus || !formData.diet) return 'Personal details are missing.';
        if (!formData.highestQualification || !formData.incomeRange) return 'Education/Income details are missing.';
        if (!formData.workWith || !formData.workAs) return 'Work details are missing.';
        return null;
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            window.scrollTo(0, 0);
            return;
        }

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
            setProfileData(updatedProfile); // Update view with returned data
            setSuccess('Profile updated successfully!');
            setIsEditing(false); // Switch back to view mode
            window.scrollTo(0, 0);
        } catch (err: any) {
            setError(err.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    // Generate height options
    const heightOptions: { val: number; label: string }[] = [];
    for (let c = 134; c <= 213; c++) {
        const realFeet = c * 0.0328084;
        const feet = Math.floor(realFeet);
        const inches = Math.round((realFeet - feet) * 12);
        heightOptions.push({ val: c, label: `${feet}ft ${inches}in - ${c}cm` });
    }

    if (loading) return (
        <DashboardLayout>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        </DashboardLayout>
    );

    if (!profileData) return (
        <DashboardLayout>
            <Alert severity="error" sx={{ m: 4 }}>
                {error || 'Failed to load profile data.'}
            </Alert>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <ImageUploadModal open={showUploadModal} onClose={() => setShowUploadModal(false)} onUploadSuccess={handleUploadSuccess} />
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isEditing && (
                            <IconButton onClick={() => setIsEditing(false)} sx={{ mr: 1 }}>
                                <ArrowBackIcon />
                            </IconButton>
                        )}
                        <Typography variant="h4" fontWeight={700}>
                            {isEditing ? 'Edit Profile' : 'My Profile'}
                        </Typography>
                    </Box>
                    {!isEditing && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Visibility />}
                                component={Link}
                                href={`/profile/${profileData.id}`}
                            >
                                View as Public
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    )}
                </Stack>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                    {/* Profile Picture Section */}
                    {!isEditing && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={profileData.profilePicture ? `${API_URL.replace('/api', '')}/uploads/${profileData.profilePicture}` : undefined}
                                    sx={{ width: 150, height: 150, borderRadius: 4, bgcolor: 'primary.main', fontSize: '3rem' }}
                                    variant="rounded"
                                >
                                    {profileData.firstName?.charAt(0)}
                                </Avatar>
                                <IconButton
                                    sx={{ position: 'absolute', bottom: -10, right: -10, bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' } }}
                                    onClick={() => setShowUploadModal(true)}
                                >
                                    <CameraAlt color="primary" />
                                </IconButton>
                            </Box>
                        </Box>
                    )}
                    {isEditing ? (
                        // EDIT FORM
                        <Stack spacing={4}>
                            {/* Basic Info */}
                            <Box>
                                <Typography variant="h6" gutterBottom color="primary">Basic Information</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                    <TextField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} fullWidth required />
                                    <TextField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} fullWidth required />
                                    <TextField select label="Gender" name="gender" value={formData.gender} onChange={handleChange} fullWidth required>
                                        <MenuItem value="MALE">Male</MenuItem>
                                        <MenuItem value="FEMALE">Female</MenuItem>
                                        <MenuItem value="OTHER">Other</MenuItem>
                                    </TextField>
                                    <TextField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
                                </Box>
                            </Box>

                            <Divider />

                            {/* Location & Community */}
                            <Box>
                                <Typography variant="h6" gutterBottom color="primary">Location & Community</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                    <TextField label="Religion" name="religion" value={formData.religion} onChange={handleChange} fullWidth required />
                                    <TextField label="Community" name="community" value={formData.community} onChange={handleChange} fullWidth required />
                                    <TextField label="Sub Caste" name="subCaste" value={formData.subCaste} onChange={handleChange} fullWidth />
                                    <TextField label="Gotra" name="gotra" value={formData.gotra} onChange={handleChange} fullWidth />
                                    <TextField label="Native Place" name="nativePlace" value={formData.nativePlace} onChange={handleChange} fullWidth />

                                    <TextField select label="Country" name="country" value={formData.country} onChange={handleChange} fullWidth required>
                                        <MenuItem value="India">India</MenuItem>
                                    </TextField>
                                    <TextField
                                        select
                                        label="State"
                                        name="state"
                                        value={formData.state}
                                        onChange={(e) => {
                                            handleChange(e as any);
                                            setFormData((prev: any) => ({ ...prev, city: '' }));
                                        }}
                                        fullWidth
                                        required
                                    >
                                        {State.getStatesOfCountry('IN').map((state) => (
                                            <MenuItem key={state.isoCode} value={state.name}>
                                                {state.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        select
                                        label="City"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        disabled={!formData.state}
                                    >
                                        {(() => {
                                            const states = State.getStatesOfCountry('IN');
                                            const selectedState = states.find(s => s.name === formData.state);
                                            const cities = selectedState ? City.getCitiesOfState('IN', selectedState.isoCode) : [];

                                            if (cities.length > 0) {
                                                return cities.map((city) => (
                                                    <MenuItem key={city.name} value={city.name}>
                                                        {city.name}
                                                    </MenuItem>
                                                ));
                                            }
                                            return <MenuItem value="" disabled>Select a State first</MenuItem>;
                                        })()}
                                    </TextField>
                                </Box>
                            </Box>

                            <Divider />

                            {/* Personal & Lifestyle */}
                            <Box>
                                <Typography variant="h6" gutterBottom color="primary">Personal & Lifestyle</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                    <TextField
                                        select
                                        label="Height"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                    >
                                        {heightOptions.map(h => (
                                            <MenuItem key={h.val} value={h.val}>{h.label}</MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField select label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} fullWidth required>
                                        <MenuItem value="NEVER_MARRIED">Never Married</MenuItem>
                                        <MenuItem value="DIVORCED">Divorced</MenuItem>
                                        <MenuItem value="WIDOWED">Widowed</MenuItem>
                                        <MenuItem value="AWAITING_DIVORCE">Awaiting Divorce</MenuItem>
                                        <MenuItem value="ANNULLED">Annulled</MenuItem>
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
                                </Box>
                                <TextField
                                    label="Bio"
                                    name="bio"
                                    multiline
                                    rows={4}
                                    value={formData.bio}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    placeholder="Tell us about yourself..."
                                />
                            </Box>

                            <Divider />

                            {/* Education & Profession */}
                            <Box>
                                <Typography variant="h6" gutterBottom color="primary">Education & Profession</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                    <TextField label="Highest Qualification" name="highestQualification" value={formData.highestQualification} onChange={handleChange} fullWidth required />
                                    <TextField label="College Name" name="collegeName" value={formData.collegeName} onChange={handleChange} fullWidth />

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField select label="Type" name="incomeType" value={formData.incomeType} onChange={handleChange} sx={{ minWidth: 100 }}>
                                            <MenuItem value="MONTHLY">Monthly</MenuItem>
                                            <MenuItem value="YEARLY">Yearly</MenuItem>
                                        </TextField>
                                        <TextField select label="Range" name="incomeRange" value={formData.incomeRange} onChange={handleChange} fullWidth required>
                                            <MenuItem value="0-3 LPA">0-3 LPA / &lt; 25k PM</MenuItem>
                                            <MenuItem value="3-5 LPA">3-5 LPA / 25k-40k PM</MenuItem>
                                            <MenuItem value="5-8 LPA">5-8 LPA / 40k-65k PM</MenuItem>
                                            <MenuItem value="8-12 LPA">8-12 LPA / 65k-1L PM</MenuItem>
                                            <MenuItem value="12-20 LPA">12-20 LPA / 1L-1.6L PM</MenuItem>
                                            <MenuItem value="20+ LPA">20+ LPA / 1.6L+ PM</MenuItem>
                                        </TextField>
                                    </Box>
                                </Box>
                            </Box>

                            <Divider />

                            {/* Work Details */}
                            <Box>
                                <Typography variant="h6" gutterBottom color="primary">Work Details</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
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
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                                <Button variant="outlined" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button variant="contained" onClick={handleSubmit} disabled={saving} size="large" startIcon={<SaveIcon />}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        </Stack>
                    ) : (
                        // VIEW MODE
                        <Stack spacing={4}>
                            {/* Basic Info */}
                            <SectionView title="Basic Information">
                                <InfoItem label="Full Name" value={`${profileData.firstName} ${profileData.lastName}`} />
                                <InfoItem label="Email" value={profileData.email} />
                                <InfoItem label="Phone" value={profileData.phone} />
                                <InfoItem label="Gender" value={profileData.gender} />
                                <InfoItem label="Date of Birth" value={profileData.dob} />
                                <InfoItem label="Marital Status" value={profileData.maritalStatus?.replace('_', ' ')} />
                            </SectionView>

                            <Divider />

                            <SectionView title="Location & Community">
                                <InfoItem label="Location" value={`${profileData.city}, ${profileData.state}, ${profileData.country}`} />
                                <InfoItem label="Religion" value={profileData.religion} />
                                <InfoItem label="Community" value={profileData.community} />
                                <InfoItem label="Sub Caste" value={profileData.subCaste} />
                                <InfoItem label="Gotra" value={profileData.gotra} />
                                <InfoItem label="Native Place" value={profileData.nativePlace} />
                            </SectionView>

                            <Divider />

                            <SectionView title="Education & Profession">
                                <InfoItem label="Highest Qualification" value={profileData.highestQualification} />
                                <InfoItem label="College" value={profileData.collegeName} />
                                <InfoItem label="Occupation" value={profileData.occupation || profileData.workAs} />
                                <InfoItem label="Employed In" value={profileData.workWith?.replace('_', ' ')} />
                                <InfoItem label="Works At" value={profileData.workAt} />
                                <InfoItem label="Income" value={`${profileData.incomeRange} (${profileData.incomeType})`} />
                            </SectionView>

                            <Divider />

                            <SectionView title="Lifestyle">
                                <InfoItem label="Diet" value={profileData.diet} />
                                <InfoItem label="Height" value={`${profileData.height} cm`} />
                                <InfoItem label="Living with Family" value={profileData.liveWithFamily ? 'Yes' : 'No'} />
                            </SectionView>

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
                    )}
                </Paper>
            </Box>
        </DashboardLayout>
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
