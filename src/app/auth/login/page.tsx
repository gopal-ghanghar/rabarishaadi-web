'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered');
    const { login } = useAuthStore();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await fetchApi('/auth/login', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            window.dispatchEvent(new Event('auth-change'));

            if (data.user.role === 'ADMIN') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            const msg = err.message || 'Login failed';
            if (msg.includes('profile is under review')) {
                setError('Your profile is under review. Once we verify your details, you will receive a confirmation email and SMS. Please allow 24-48 hours for verification.');
            } else {
                setError(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 5,
                maxWidth: 450,
                width: '100%',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center'
            }}
        >
            <Link href="/" style={{ textDecoration: 'none' }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, display: 'block', '&:hover': { color: 'primary.main' } }}
                >
                    ← Back to Home
                </Typography>
            </Link>

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'var(--font-heading)' }}>
                Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Login to your RabariShaadi account
            </Typography>

            {registered && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Account created successfully! Please login.
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="you@example.com"
                />
                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="••••••••"
                />

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isLoading}
                    sx={{
                        mt: 1,
                        py: 1.5,
                        borderRadius: 2
                    }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                </Button>
            </Box>

            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/signup" style={{ textDecoration: 'none', fontWeight: 600 }}>
                        Create Account
                    </Link>
                </Typography>
            </Box>
        </Paper>
    );
}

export default function LoginPage() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                py: 12,
                px: 2
            }}
        >
            <Suspense fallback={<CircularProgress />}>
                <LoginForm />
            </Suspense>
        </Box>
    );
}
