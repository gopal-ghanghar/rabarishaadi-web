'use client';

import { useEffect, useState } from 'react';
import { fetchApi, API_URL } from '@/lib/api';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Avatar,
    TablePagination,
    Stack,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    Group as GroupIcon,
    VerifiedUser as ActiveIcon,
    PersonOff as InactiveIcon,
    HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserSummary {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'USER' | 'ADMIN';
    status: 'VERIFIED' | 'UNDER_REVIEW' | 'REJECTED';
    profilePicture: string | null;
    verified: boolean;
}

interface UserStats {
    total: number;
    active: number;
    inactive: number;
    pending: number;
}

export default function UsersPage() {
    const router = useRouter();
    const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, inactive: 0, pending: 0 });
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Pagination & Filter State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [search, setSearch] = useState('');
    const [tabValue, setTabValue] = useState('ALL'); // ALL, ADMIN, PENDING, REJECTED

    // Dialog State
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: number | null }>({ open: false, userId: null });

    // Menu & Verification Action State
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
    const [verificationDialog, setVerificationDialog] = useState<{
        open: boolean;
        type: 'VERIFIED' | 'REJECTED' | null;
        userId: number | null;
    }>({
        open: false,
        type: null,
        userId: null
    });

    // ... existing fetch functions ...

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: UserSummary) => {
        setMenuAnchor(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedUser(null);
    };

    const handleVerificationClick = (type: 'VERIFIED' | 'REJECTED') => {
        if (!selectedUser) return;
        setVerificationDialog({
            open: true,
            type,
            userId: selectedUser.id
        });
        setMenuAnchor(null); // Close menu
    };

    const handleConfirmVerification = async () => {
        const { userId, type } = verificationDialog;
        if (!userId || !type) return;

        try {
            await fetchApi(`/admin/verify/${userId}?status=${type}`, { method: 'POST' });
            setVerificationDialog({ open: false, type: null, userId: null });
            fetchUsers();
            fetchStats();
        } catch (err: any) {
            alert('Action failed: ' + err.message);
        }
    };

    const handleDeleteClickFromMenu = () => {
        if (!selectedUser) return;
        setDeleteDialog({ open: true, userId: selectedUser.id });
        handleMenuClose();
    };

    const fetchStats = async () => {
        try {
            const data = await fetchApi('/admin/stats/users');
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats', err);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let queryParams = `page=${page}&size=${rowsPerPage}`;
            if (search) queryParams += `&search=${search}`;

            if (tabValue === 'ADMIN') queryParams += `&role=ADMIN`;
            else if (tabValue === 'PENDING') queryParams += `&status=UNDER_REVIEW`;
            else if (tabValue === 'REJECTED') queryParams += `&status=REJECTED`;

            const data = await fetchApi(`/admin/users?${queryParams}`);
            setUsers(data.content);
            setTotalElements(data.totalElements);
        } catch (err: any) {
            setError(err.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [page, rowsPerPage, tabValue, search]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
        setPage(0);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        setPage(0);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const confirmDelete = (userId: number) => {
        setDeleteDialog({ open: true, userId });
    };

    const handleDelete = async () => {
        if (!deleteDialog.userId) return;
        try {
            await fetchApi(`/admin/users/${deleteDialog.userId}`, { method: 'DELETE' });
            setDeleteDialog({ open: false, userId: null });
            fetchUsers();
            fetchStats();
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
        }
    };

    const getStatusChip = (status: string, role: string) => {
        if (role === 'ADMIN') return <Chip label="Admin" color="primary" size="small" />;
        switch (status) {
            case 'VERIFIED': return <Chip label="Active" color="success" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />;
            case 'UNDER_REVIEW': return <Chip label="Pending" color="warning" size="small" sx={{ bgcolor: '#fff3e0', color: '#ef6c00' }} />;
            case 'REJECTED': return <Chip label="Deactive" color="error" size="small" sx={{ bgcolor: '#ffebee', color: '#c62828' }} />;
            default: return <Chip label={status} size="small" />;
        }
    };

    return (
        <DashboardLayout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>Users</Typography>
                <Typography variant="body2" color="text.secondary">Dashboard &gt; Users</Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    {
                        label: 'Total Users',
                        value: stats.total,
                        color: 'primary.main',
                        bgColor: '#e3f2fd',
                        iconColor: '#1976d2',
                        icon: <GroupIcon sx={{ fontSize: 32, color: '#1976d2' }} />
                    },
                    {
                        label: 'Active Users',
                        value: stats.active,
                        color: 'success.main',
                        bgColor: '#e8f5e9',
                        iconColor: '#2e7d32',
                        icon: <ActiveIcon sx={{ fontSize: 32, color: '#2e7d32' }} />
                    },
                    {
                        label: 'Inactive Users',
                        value: stats.inactive,
                        color: 'error.main',
                        bgColor: '#ffebee',
                        iconColor: '#c62828',
                        icon: <InactiveIcon sx={{ fontSize: 32, color: '#c62828' }} />
                    },
                    {
                        label: 'Pending Approvals',
                        value: stats.pending,
                        color: 'warning.main',
                        bgColor: '#fff3e0',
                        iconColor: '#ef6c00',
                        icon: <PendingIcon sx={{ fontSize: 32, color: '#ef6c00' }} />
                    }
                ].map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                height: '100%',
                                bgcolor: '#fff',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.1)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 3,
                                        bgcolor: stat.bgColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {stat.icon}
                                </Box>

                            </Box>
                            <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5, color: 'text.primary' }}>
                                {stat.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                {stat.label}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Tabs & Filters */}
            <Paper sx={{ mb: 4, borderRadius: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="All" value="ALL" />
                        <Tab label="Admins" value="ADMIN" />
                        <Tab label="Pending" value="PENDING" />
                        <Tab label="Rejected" value="REJECTED" />
                    </Tabs>
                </Box>

                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search by name or email"
                        value={search}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: 300 }}
                    />
                    <Stack direction="row" spacing={1}>
                        {/* Placeholder for Sort/Filter buttons if needed later */}
                    </Stack>
                </Box>

                {/* Table */}
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f9fafb' }}>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>Loading...</TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>No users found.</TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar src={user.profilePicture ? `${API_URL.replace('/api', '')}/uploads/${user.profilePicture}` : undefined} alt={user.name}>{user.name?.charAt(0)}</Avatar>
                                                <Typography variant="body2" fontWeight={500}>{user.name}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                size="small"
                                                color={user.role === 'ADMIN' ? 'warning' : 'default'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{getStatusChip(user.status, user.role)}</TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="View Profile">
                                                    <Link href={`/profile/${user.id}?from=admin-users`} passHref>
                                                        <IconButton size="small" color="primary">
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Link>
                                                </Tooltip>
                                                <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={totalElements}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: 1, borderColor: 'divider' }}
                />
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, userId: null })}>
                <DialogTitle>Delete User?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, userId: null })}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
            {/* Action Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                {selectedUser && (selectedUser.status === 'UNDER_REVIEW' || selectedUser.status === 'REJECTED') && (
                    <MenuItem onClick={() => handleVerificationClick('VERIFIED')} sx={{ color: 'success.main' }}>
                        <ListItemIcon>
                            <ActiveIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText>Approve</ListItemText>
                    </MenuItem>
                )}
                {selectedUser && selectedUser.status === 'UNDER_REVIEW' && (
                    <MenuItem onClick={() => handleVerificationClick('REJECTED')} sx={{ color: 'error.main' }}>
                        <ListItemIcon>
                            <InactiveIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>Reject</ListItemText>
                    </MenuItem>
                )}
                <MenuItem onClick={handleDeleteClickFromMenu} sx={{ color: 'text.secondary' }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Delete User</ListItemText>
                </MenuItem>
            </Menu>

            {/* Verification Confirmation Dialog */}
            <Dialog
                open={verificationDialog.open}
                onClose={() => setVerificationDialog({ ...verificationDialog, open: false })}
            >
                <DialogTitle>
                    {verificationDialog.type === 'VERIFIED' ? 'Approve User?' : 'Reject User?'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to {verificationDialog.type === 'VERIFIED' ? 'approve' : 'reject'} this user?
                        {verificationDialog.type === 'VERIFIED'
                            ? ' The user will be able to log in and use the application.'
                            : ' The user will be notified of the rejection.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setVerificationDialog({ ...verificationDialog, open: false })}>Cancel</Button>
                    <Button
                        onClick={handleConfirmVerification}
                        color={verificationDialog.type === 'VERIFIED' ? 'success' : 'error'}
                        variant="contained"
                        autoFocus
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}
