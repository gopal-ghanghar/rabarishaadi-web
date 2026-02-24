'use client';

import { Box, Paper, Typography, Avatar, IconButton, Badge, InputBase, Button, Menu, MenuItem, Stack, AppBar, Toolbar } from '@mui/material';
import { NotificationsOutlined, Search as SearchIcon, Add as AddIcon, KeyboardArrowDown, Diamond as DiamondIcon, Chat as ChatIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi, API_URL } from '@/lib/api';

interface DashboardHeaderProps {
    title?: string;
    subtitle?: string;
    showAddButton?: boolean;
}

import { useUIStore } from '@/store/useUIStore'; // Removed
import { useChatStore } from '@/store/useChatStore';

import MessagesPopover from '@/components/messages/MessagesPopover';

export default function DashboardHeader({ showAddButton = false }: DashboardHeaderProps) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [profilePic, setProfilePic] = useState<string | null>(null);

    // Message Popover State
    const [msgPopoverAnchor, setMsgPopoverAnchor] = useState<null | HTMLElement>(null);

    const handleMsgClick = (event: React.MouseEvent<HTMLElement>) => {
        setMsgPopoverAnchor(event.currentTarget);
    };

    const handleMsgClose = () => {
        setMsgPopoverAnchor(null);
    };

    useEffect(() => {
        const loadProfilePic = async () => {
            try {
                const data = await fetchApi('/profile/me');
                if (data.profilePicture) {
                    setProfilePic(data.profilePicture);
                }
            } catch (e) {
                // Ignore error (profile might not exist yet)
            }
        };
        if (user) {
            loadProfilePic();

            // Fetch initial unread count so badge shows on login
            const loadUnreadCount = async () => {
                try {
                    const data = await fetchApi('/chat/unread-count');
                    useChatStore.getState().setGlobalUnreadCount(data.count);
                } catch (e) {
                    // Ignore if chat API not available
                }
            };
            loadUnreadCount();

            // Connect chat WebSocket early so real-time updates work from any page
            const { chatService } = require('@/lib/services/chat');
            chatService.connect();
        }
    }, [user]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
        router.push('/auth/login');
    };

    return (
        <AppBar
            position="sticky"
            color="inherit"
            elevation={0}
            sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                zIndex: (theme) => theme.zIndex.drawer + 1
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
                {/* Left: Product Logo & Name */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 240 }}>
                    <Box sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <DiamondIcon />
                    </Box>
                    <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5, color: 'text.primary' }}>
                        RabariShaadi
                    </Typography>
                </Box>

                {/* Center: Search Bar */}
                <Paper
                    sx={{
                        p: '2px 4px',
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        width: 400,
                        maxWidth: '100%',
                        borderRadius: 3, // Changed from 99 to 3
                        bgcolor: 'background.default',
                        boxShadow: 'none',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <IconButton sx={{ p: '10px' }} aria-label="search">
                        <SearchIcon color="action" />
                    </IconButton>
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search"
                        inputProps={{ 'aria-label': 'search' }}
                    />
                </Paper>

                {/* Right: Actions & Profile */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

                    {/* Add Button (Admin Only) */}
                    {showAddButton && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 2, display: { xs: 'none', sm: 'flex' } }}
                        >
                            Add
                        </Button>
                    )}

                    {/* Notifications */}
                    <IconButton
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3, // Consistent with other elements
                            width: 40,
                            height: 40
                        }}
                    >
                        <Badge badgeContent={2} color="error" variant="dot">
                            <NotificationsOutlined />
                        </Badge>
                    </IconButton>

                    {/* Message Icon */}
                    <IconButton
                        onClick={handleMsgClick}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            width: 40,
                            height: 40,
                            bgcolor: (theme) => msgPopoverAnchor ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                            color: msgPopoverAnchor ? 'primary.main' : 'inherit'
                        }}
                    >
                        <Badge badgeContent={useChatStore((state) => state.globalUnreadCount)} color="error" max={99}>
                            <ChatIcon />
                        </Badge>
                    </IconButton>

                    {/* Messages Popover */}
                    <MessagesPopover
                        anchorEl={msgPopoverAnchor}
                        open={Boolean(msgPopoverAnchor)}
                        onClose={handleMsgClose}
                    />

                    {/* User Dropdown */}
                    <Box
                        onClick={handleMenuOpen}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer',
                            p: 0.5,
                            pr: 1,
                            borderRadius: 3, // Changed from 99 to 3
                            '&:hover': { bgcolor: 'action.hover' }
                        }}
                    >
                        <Avatar
                            src={profilePic ? `${API_URL.replace('/api', '')}/uploads/${profilePic}` : undefined}
                            sx={{ width: 40, height: 40, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600, fontSize: '0.9rem', borderRadius: 2 }}
                            variant="rounded"
                        >
                            {user?.firstName?.[0] || 'U'}
                        </Avatar>

                        <Stack alignItems="start" sx={{ display: { xs: 'none', md: 'flex' } }}>
                            <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
                                {user?.firstName || 'User'} {user?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" lineHeight={1}>
                                {user?.email}
                            </Typography>
                        </Stack>

                        <KeyboardArrowDown color="action" fontSize="small" />
                    </Box>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        sx={{ mt: 1 }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            elevation: 4,
                            sx: { borderRadius: 3, minWidth: 200, mt: 1.5 }
                        }}
                    >
                        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700}>
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {user?.email}
                            </Typography>
                        </Box>
                        <MenuItem onClick={() => { router.push('/profile'); handleMenuClose(); }}>
                            <Typography variant="body2" fontWeight={500}>My Profile</Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <Typography variant="body2" fontWeight={500}>Logout</Typography>
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
