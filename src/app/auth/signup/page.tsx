'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    MenuItem,
    Stepper,
    Step,
    StepLabel,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    InputAdornment,
    Checkbox
} from '@mui/material';
import { State, City } from 'country-state-city';

const steps = ['Basic Details', 'Location & Community', 'Personal Details', 'Education & Career', 'Account'];

export default function SignupPage() {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        // Basic
        firstName: '',
        lastName: '',
        gender: 'Male',
        dob: '',

        // Location & Community
        country: 'India',
        state: 'Gujarat',
        city: '',
        religion: 'Hindu',
        community: 'Gujarati',
        subCommunity: '',

        // Personal
        height: '', // will parse to float
        maritalStatus: 'NEVER_MARRIED',
        diet: 'VEG',
        liveWithFamily: true,

        // Education & Income
        highestQualification: '',
        collegeName: '',
        incomeType: 'MONTHLY',
        incomeRange: '',

        // Work
        workWith: '',
        workAs: '',
        workAt: '',

        // Account
        email: '',
        phone: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const isStepValid = (step: number) => {
        switch (step) {
            case 0: // Basic
                return formData.firstName && formData.lastName && formData.gender && formData.dob;
            case 1: // Location
                return formData.religion && formData.community && formData.country && formData.state && formData.city;
            case 2: // Personal
                return formData.height && formData.maritalStatus && formData.diet;
            case 3: // Edu & Career
                // College optional, workAt optional, workAs required, workWith required
                return formData.highestQualification && formData.incomeType && formData.incomeRange && formData.workWith && formData.workAs;
            case 4: // Account
                return formData.email && formData.phone && formData.password;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (isStepValid(activeStep)) {
            setActiveStep((prev) => prev + 1);
        } else {
            setError('Please fill all mandatory fields');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        if (!isStepValid(activeStep)) {
            setError('Please fill all mandatory fields');
            return;
        }

        setError('');
        setIsLoading(true);

        // Convert types
        const payload = {
            ...formData,
            height: formData.height ? parseFloat(String(formData.height)) : null,
            liveWithFamily: formData.liveWithFamily
        };

        try {
            await fetchApi('/auth/signup', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
                <Paper elevation={0} sx={{ p: 5, maxWidth: 600, width: '100%', borderRadius: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Registration Successful</Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Your profile is under review. Once we verify your details, you will receive a confirmation email and SMS.
                    </Typography>
                    <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
                        Please allow 24-48 hours for verification.
                    </Alert>
                    <Link href="/auth/login" passHref>
                        <Button variant="outlined">Return to Login</Button>
                    </Link>
                </Paper>
            </Box>
        );
    }

    // Generate height options
    const heightOptions: { val: number; label: string }[] = [];
    for (let c = 134; c <= 213; c++) {
        // Approximate feet/inches
        const realFeet = c * 0.0328084;
        const feet = Math.floor(realFeet);
        const inches = Math.round((realFeet - feet) * 12);
        heightOptions.push({ val: c, label: `${feet}ft ${inches}in - ${c}cm` });
    }

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Typography variant="h6">Basic Details</Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <TextField label="First Name" name="firstName" fullWidth value={formData.firstName} onChange={handleChange} required />
                            <TextField label="Last Name" name="lastName" fullWidth value={formData.lastName} onChange={handleChange} required />
                        </Box>
                        <TextField select label="Gender" name="gender" fullWidth value={formData.gender} onChange={handleChange}>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                        <TextField label="Date of Birth" name="dob" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.dob} onChange={handleChange} required />
                    </Box>
                );
            case 1:
                const states = State.getStatesOfCountry('IN');
                const selectedState = states.find(s => s.name === formData.state);
                const cities = selectedState ? City.getCitiesOfState('IN', selectedState.isoCode) : [];

                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Typography variant="h6">Location & Community</Typography>
                        <TextField label="Religion" name="religion" fullWidth value={formData.religion} onChange={handleChange} required />
                        <TextField label="Community" name="community" fullWidth value={formData.community} onChange={handleChange} required />
                        <TextField label="Sub Community (Caste)" name="subCommunity" fullWidth value={formData.subCommunity} onChange={handleChange} />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField select label="Country" name="country" fullWidth value={formData.country} onChange={handleChange} required>
                                <MenuItem value="India">India</MenuItem>
                            </TextField>
                            <TextField
                                select
                                label="State"
                                name="state"
                                fullWidth
                                value={formData.state}
                                onChange={(e) => {
                                    handleChange(e as any);
                                    // Reset city when state changes
                                    setFormData(prev => ({ ...prev, city: '' }));
                                }}
                                required
                            >
                                {states.map((state) => (
                                    <MenuItem key={state.isoCode} value={state.name}>
                                        {state.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <TextField
                            select
                            label="City"
                            name="city"
                            fullWidth
                            value={formData.city}
                            onChange={handleChange}
                            required
                            disabled={!formData.state}
                        >
                            {cities.length > 0 ? (
                                cities.map((city) => (
                                    <MenuItem key={city.name} value={city.name}>
                                        {city.name}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem value="" disabled>Select a State first</MenuItem>
                            )}
                        </TextField>
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Typography variant="h6">Personal Details</Typography>
                        <TextField
                            select
                            label="Height"
                            name="height"
                            fullWidth
                            value={formData.height}
                            onChange={handleChange}
                            required
                        >
                            {heightOptions.map(h => (
                                <MenuItem key={h.val} value={h.val}>{h.label}</MenuItem>
                            ))}
                        </TextField>
                        <TextField select label="Marital Status" name="maritalStatus" fullWidth value={formData.maritalStatus} onChange={handleChange} required>
                            <MenuItem value="NEVER_MARRIED">Never Married</MenuItem>
                            <MenuItem value="DIVORCED">Divorced</MenuItem>
                            <MenuItem value="WIDOWED">Widowed</MenuItem>
                            <MenuItem value="AWAITING_DIVORCE">Awaiting Divorce</MenuItem>
                            <MenuItem value="ANNULLED">Annulled</MenuItem>
                        </TextField>
                        <TextField select label="Diet" name="diet" fullWidth value={formData.diet} onChange={handleChange} required>
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
                );
            case 3:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Typography variant="h6">Education & Career</Typography>
                        <TextField label="Highest Qualification" name="highestQualification" fullWidth value={formData.highestQualification} onChange={handleChange} required />
                        <TextField label="College Name" name="collegeName" fullWidth value={formData.collegeName} onChange={handleChange} placeholder="Optional" />

                        <Typography variant="subtitle2" sx={{ mt: 1 }}>Income Details</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField select label="Type" name="incomeType" value={formData.incomeType} onChange={handleChange} sx={{ minWidth: 120 }}>
                                <MenuItem value="MONTHLY">Monthly</MenuItem>
                                <MenuItem value="YEARLY">Yearly</MenuItem>
                            </TextField>
                            <TextField select label="Range" name="incomeRange" fullWidth value={formData.incomeRange} onChange={handleChange} required>
                                <MenuItem value="0-3 LPA">0-3 LPA / &lt; 25k PM</MenuItem>
                                <MenuItem value="3-5 LPA">3-5 LPA / 25k-40k PM</MenuItem>
                                <MenuItem value="5-8 LPA">5-8 LPA / 40k-65k PM</MenuItem>
                                <MenuItem value="8-12 LPA">8-12 LPA / 65k-1L PM</MenuItem>
                                <MenuItem value="12-20 LPA">12-20 LPA / 1L-1.6L PM</MenuItem>
                                <MenuItem value="20+ LPA">20+ LPA / 1.6L+ PM</MenuItem>
                            </TextField>
                        </Box>

                        <Typography variant="subtitle2" sx={{ mt: 1 }}>Work Details</Typography>
                        <TextField select label="Work With" name="workWith" fullWidth value={formData.workWith} onChange={handleChange} required>
                            <MenuItem value="PRIVATE_COMPANY">Private Company</MenuItem>
                            <MenuItem value="GOVERNMENT_JOB">Government Job</MenuItem>
                            <MenuItem value="BUSINESS">Business</MenuItem>
                            <MenuItem value="SELF_EMPLOYED">Self Employed</MenuItem>
                            <MenuItem value="PUBLIC_SECTOR">Public Sector</MenuItem>
                            <MenuItem value="STUDENT">Student</MenuItem>
                            <MenuItem value="NOT_WORKING">Not Working</MenuItem>
                        </TextField>
                        <TextField label="Work As (Designation)" name="workAs" fullWidth value={formData.workAs} onChange={handleChange} required />
                        <TextField label="Work At (Company/Dept)" name="workAt" fullWidth value={formData.workAt} onChange={handleChange} placeholder="Optional" />
                    </Box>
                );
            case 4:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Typography variant="h6">Account Details</Typography>
                        <TextField label="Email Address" name="email" type="email" fullWidth value={formData.email} onChange={handleChange} required />
                        <TextField label="Mobile Number" name="phone" fullWidth value={formData.phone} onChange={handleChange} required />
                        <TextField label="Password" name="password" type="password" fullWidth value={formData.password} onChange={handleChange} required />
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', py: 8, px: 2 }}>
            <Paper elevation={0} sx={{ p: 4, maxWidth: 800, width: '100%', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'block', '&:hover': { color: 'primary.main' } }}>
                        ← Back to Home
                    </Typography>
                </Link>

                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'var(--font-heading)', textAlign: 'center' }}>
                    Create Account
                </Typography>

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Box>
                    {renderStepContent(activeStep)}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                        >
                            Back
                        </Button>
                        {activeStep === steps.length - 1 ? (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                            </Button>
                        ) : (
                            <Button variant="contained" onClick={handleNext}>
                                Next
                            </Button>
                        )}
                    </Box>
                </Box>

                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Already have an account? <Link href="/auth/login" style={{ textDecoration: 'none', fontWeight: 600 }}>Login</Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
