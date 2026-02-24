'use client';

import { useEffect, useState } from 'react';
import { fetchApi, API_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Box, Typography, Button, Grid, Paper, Chip, Avatar, Stack } from '@mui/material';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ClientRouteGuard from '@/components/auth/ClientRouteGuard';

interface UserSummary {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'USER' | 'ADMIN';
    status: 'VERIFIED' | 'UNDER_REVIEW' | 'REJECTED';
    profilePicture: string | null;
    verified: boolean;
    createdAt: string; // Assuming DTO or backend provides this, otherwise optional
}

export default function AdminPage() {
    const router = useRouter();
    const [recentUsers, setRecentUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Fetch Recent Users (Page 0, Size 10, Sorted by ID desc for "recency" approx)
                // Note: Standard API might not expose sort param clearly yet, but default page is fine.
                // Assuming the generic search endpoint works.
                const usersData = await fetchApi('/admin/users?page=0&size=10');
                if (usersData && usersData.content) {
                    setRecentUsers(usersData.content);
                } else {
                    setRecentUsers([]);
                }
            } catch (err: any) {
                console.error(err);
                if (err.message && err.message.includes('403')) {
                    setError('Access Denied. You are not an admin.');
                } else {
                    setError('Failed to load dashboard data.');
                }
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <Typography>Loading admin panel...</Typography>
        </Box>
    );

    if (error) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
            <Typography color="error">{error}</Typography>
            <Button variant="contained" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </Box>
    );

    return (
        <ClientRouteGuard requiredRole="ADMIN">
            <DashboardLayout>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold">Admin Dashboard</Typography>
                </Box>

                {/* Stats Grid Removed as per requirement */}

                <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
                    <Box sx={{ p: 2, bgcolor: '#fafafa', borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h6">Recent Users</Typography>
                    </Box>
                    <Box sx={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: '#f0f0f0' }}>
                                <tr>
                                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #ddd' }}>ID</th>
                                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #ddd' }}>Name</th>
                                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #ddd' }}>Email</th>
                                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #ddd' }}>Phone</th>
                                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #ddd' }}>Role</th>
                                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #ddd' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center' }}>No users found.</td>
                                    </tr>
                                ) : (
                                    recentUsers.map(user => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px 16px' }}>{user.id}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar src={user.profilePicture ? `${API_URL.replace('/api', '')}/uploads/${user.profilePicture}` : undefined} alt={user.name}>{user.name?.charAt(0)}</Avatar>
                                                    <Typography variant="body2" fontWeight={500}>{user.name}</Typography>
                                                </Stack>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>{user.email}</td>
                                            <td style={{ padding: '12px 16px' }}>{user.phone}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Chip
                                                    label={user.role}
                                                    size="small"
                                                    color={user.role === 'ADMIN' ? 'warning' : 'default'}
                                                    variant="outlined"
                                                />
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Chip
                                                    label={user.status}
                                                    size="small"
                                                    color={user.status === 'VERIFIED' ? 'success' : user.status === 'UNDER_REVIEW' ? 'warning' : 'error'}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </Box>
                </Paper>
            </DashboardLayout>
        </ClientRouteGuard>
    );
}
