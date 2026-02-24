'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchApi } from '@/lib/api';
import {
    Box,
    Typography,
    Container,
    Paper,
    Button,
    AppBar,
    Toolbar,
    Avatar,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Stack
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ClientRouteGuard from '@/components/auth/ClientRouteGuard';

const DRAWER_WIDTH = 240;

export default function DashboardPage() {
    const router = useRouter();
    const { user, logout, token } = useAuthStore();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState<{ shortlistedBy: number; percentageChange: number; trend: string }>({ shortlistedBy: 0, percentageChange: 0, trend: 'neutral' });
    const [viewStats, setViewStats] = useState<{ totalViews: number; percentageChange: number; trend: string }>({ totalViews: 0, percentageChange: 0, trend: 'neutral' });
    const [connectionStats, setConnectionStats] = useState<{ totalReceived: number; percentageChange: number; trend: string }>({ totalReceived: 0, percentageChange: 0, trend: 'neutral' });

    useEffect(() => {
        // Hydrate from localStorage
        useAuthStore.getState().setFromLocalStorage();
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            router.push('/auth/login');
            return;
        }

        fetchProfile(storedToken);
        fetchStats(storedToken);
        fetchViewStats(storedToken);
        fetchConnectionStats(storedToken);
    }, []);

    const fetchStats = async (authToken: string) => {
        try {
            const data = await fetchApi('/shortlist/received-stats', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setStats({ shortlistedBy: data.totalCount, percentageChange: data.percentageChange, trend: data.trend });
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const fetchViewStats = async (authToken: string) => {
        try {
            const data = await fetchApi('/profile/views/stats', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setViewStats({ totalViews: data.totalViews, percentageChange: data.percentageChange, trend: data.trend });
        } catch (error) {
            console.error('Failed to fetch view stats', error);
        }
    };

    const fetchConnectionStats = async (authToken: string) => {
        try {
            const data = await fetchApi('/connections/stats', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setConnectionStats({ totalReceived: data.totalReceived, percentageChange: data.percentageChange, trend: data.trend });
        } catch (error) {
            console.error('Failed to fetch connection stats', error);
        }
    };

    const fetchProfile = async (authToken: string) => {
        try {
            const data = await fetchApi('/profile/me', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setProfile(data);
            setEditForm(data);
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const updated = await fetchApi('/profile', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });
            setProfile(updated);
            setIsEditing(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save profile changes.');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setEditForm((prev: any) => ({ ...prev, [field]: value }));
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;

    return (
        <ClientRouteGuard requiredRole="USER">
            <DashboardLayout>
                {/* Main Dashboard Content */}
                <Box>
                    {/* Stats Grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
                        <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Total Profile Views</Typography>
                                <Typography sx={{ bgcolor: 'background.default', px: 1, borderRadius: 1 }}>👁️</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>{viewStats.totalViews.toLocaleString()}</Typography>
                            <Typography
                                variant="caption"
                                fontWeight={600}
                                color={viewStats.trend === 'up' ? 'success.main' : viewStats.trend === 'down' ? 'error.main' : 'text.secondary'}
                            >
                                {viewStats.trend === 'up' ? '↗' : viewStats.trend === 'down' ? '↘' : '→'}{' '}
                                {viewStats.percentageChange > 0 ? '+' : ''}{viewStats.percentageChange}%
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Interest Received</Typography>
                                <Typography sx={{ bgcolor: 'background.default', px: 1, borderRadius: 1 }}>❤️</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>{connectionStats.totalReceived.toLocaleString()}</Typography>
                            <Typography
                                variant="caption"
                                fontWeight={600}
                                color={connectionStats.trend === 'up' ? 'success.main' : connectionStats.trend === 'down' ? 'error.main' : 'text.secondary'}
                            >
                                {connectionStats.trend === 'up' ? '↗' : connectionStats.trend === 'down' ? '↘' : '→'}{' '}
                                {connectionStats.percentageChange > 0 ? '+' : ''}{connectionStats.percentageChange}%
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Shortlisted By</Typography>
                                <Typography sx={{ bgcolor: 'background.default', px: 1, borderRadius: 1 }}>⭐</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>{stats.shortlistedBy.toLocaleString()}</Typography>
                            <Typography
                                variant="caption"
                                fontWeight={600}
                                color={stats.trend === 'up' ? 'success.main' : stats.trend === 'down' ? 'error.main' : 'text.secondary'}
                            >
                                {stats.trend === 'up' ? '↗' : stats.trend === 'down' ? '↘' : '→'}{' '}
                                {stats.percentageChange > 0 ? '+' : ''}{stats.percentageChange}%
                            </Typography>
                        </Paper>
                        <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Profile Status</Typography>
                                <Typography sx={{ bgcolor: 'background.default', px: 1, borderRadius: 1 }}>✅</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>Active</Typography>
                            <Typography variant="caption" color="success.main" fontWeight={600}>Verified</Typography>
                        </Paper>
                    </Box>

                </Box>
            </DashboardLayout >
        </ClientRouteGuard>
    );
}

function InfoField({ label, value, isEditing = false, onChange, type = 'text', multiline = false }: any) {
    if (isEditing && onChange) {
        return (
            <Box>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        marginTop: '4px'
                    }}
                />
            </Box>
        );
    }
    return (
        <Box>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="body1" fontWeight={500}>{value || '-'}</Typography>
        </Box>
    );
}
