"use client";

import { Box, Paper, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Button, Card, CardContent, Tooltip } from "@mui/material";
import {
    Dashboard as DashboardIcon,
    PersonSearch as PersonSearchIcon,
    Bookmark as BookmarkIcon,
    People as PeopleIcon,
    Logout as LogoutIcon,
    Settings as SettingsIcon,
    Help as HelpIcon
} from "@mui/icons-material";
import { alpha } from '@mui/material/styles';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { logout, user } = useAuthStore();
    const { isSidebarCollapsed, toggleSidebar } = useUIStore();

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    const commonListItemButtonSx = {
        borderRadius: 2,
        px: isSidebarCollapsed ? 1 : 2,
        py: 1.25,
        justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
        color: 'text.secondary',
        '&.Mui-selected': {
            bgcolor: (theme: any) => alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            fontWeight: 600,
            '&:hover': { bgcolor: (theme: any) => alpha(theme.palette.primary.main, 0.15) }
        },
        '&:hover': { bgcolor: 'action.hover', color: 'text.primary' }
    };

    const adminListItemButtonSx = {
        ...commonListItemButtonSx,
        '&.Mui-selected': { bgcolor: 'secondary.light', color: 'secondary.main', fontWeight: 600 },
    };

    const SidebarItem = ({ href, icon: Icon, label, selected, onClick, sx, iconColor }: any) => {
        const button = (
            <ListItemButton
                component={href ? Link : 'div'}
                href={href}
                onClick={onClick}
                selected={selected}
                sx={sx}
            >
                <ListItemIcon sx={{ minWidth: isSidebarCollapsed ? 0 : 40, color: (selected || iconColor) ? (iconColor || 'inherit') : 'text.secondary', justifyContent: 'center' }}>
                    <Icon fontSize="small" color={iconColor ? undefined : "inherit"} style={iconColor ? { color: iconColor } : {}} />
                </ListItemIcon>
                {!isSidebarCollapsed && (
                    <ListItemText
                        primary={label}
                        primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: selected ? 600 : 500 }}
                    />
                )}
            </ListItemButton>
        );

        return isSidebarCollapsed ? (
            <Tooltip title={label} placement="right" arrow>
                {button}
            </Tooltip>
        ) : button;
    };

    return (
        <Box component="aside" sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>

                {/* MENU Group */}
                {!isSidebarCollapsed && (
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 2, display: 'block', px: 2, fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                        MENU
                    </Typography>
                )}

                <List disablePadding sx={{ mb: 1 }}>
                    {user?.role === 'USER' && (
                        <>
                            <ListItem disablePadding sx={{ mb: 1, display: 'block' }}>
                                <SidebarItem href="/dashboard" icon={DashboardIcon} label="Overview" selected={pathname === '/dashboard'} sx={commonListItemButtonSx} />
                            </ListItem>
                            <ListItem disablePadding sx={{ mb: 1, display: 'block' }}>
                                <SidebarItem href="/matches" icon={PersonSearchIcon} label="Find Matches" selected={pathname === '/matches'} sx={commonListItemButtonSx} />
                            </ListItem>
                            <ListItem disablePadding sx={{ mb: 1, display: 'block' }}>
                                <SidebarItem href="/shortlisted" icon={BookmarkIcon} label="Shortlisted" selected={pathname === '/shortlisted'} sx={commonListItemButtonSx} />
                            </ListItem>
                            <ListItem disablePadding sx={{ mb: 1, display: 'block' }}>
                                <SidebarItem href="/connections" icon={PeopleIcon} label="Connections" selected={pathname === '/connections'} sx={commonListItemButtonSx} />
                            </ListItem>
                        </>
                    )}

                    {/* Admin Links */}
                    {user?.role === 'ADMIN' && (
                        <>
                            <ListItem disablePadding sx={{ mt: 1, mb: 1, display: 'block' }}>
                                <SidebarItem href="/admin" icon={DashboardIcon} label="Admin Panel" selected={pathname === '/admin'} sx={adminListItemButtonSx} iconColor={pathname === '/admin' ? undefined : "#f57c00"} />
                            </ListItem>
                            <ListItem disablePadding sx={{ mt: 1, mb: 1, display: 'block' }}>
                                <SidebarItem href="/admin/users" icon={Users} label="Users" selected={pathname.startsWith('/admin/users')} sx={adminListItemButtonSx} iconColor={pathname.startsWith('/admin/users') ? undefined : "#f57c00"} />
                            </ListItem>
                        </>
                    )}
                </List>

                {/* Divider - Only show in Expanded mode to avoid double dividers in collapsed */}
                {!isSidebarCollapsed && <Divider sx={{ my: 2 }} />}
                {isSidebarCollapsed && <Divider sx={{ my: 1, mx: 1 }} />}

                {/* GENERAL Group */}
                {!isSidebarCollapsed && (
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 2, display: 'block', px: 2, fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                        GENERAL
                    </Typography>
                )}

                <List disablePadding>
                    <ListItem disablePadding sx={{ mb: 1, display: 'block' }}>
                        <SidebarItem href="#" icon={SettingsIcon} label="Settings" sx={{ ...commonListItemButtonSx, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }} />
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1, display: 'block' }}>
                        <SidebarItem href="#" icon={HelpIcon} label="Help" sx={{ ...commonListItemButtonSx, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }} />
                    </ListItem>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <SidebarItem onClick={handleLogout} icon={LogoutIcon} label="Logout" sx={{ ...commonListItemButtonSx, color: 'error.main', '&:hover': { bgcolor: (theme: any) => alpha(theme.palette.error.main, 0.1) } }} />
                    </ListItem>
                </List>
            </Box>

            {/* Bottom Actions Container */}
            <Box sx={{ mt: 2 }}>

                {/* Collapse Toggle Button at Bottom */}
                <Divider sx={{ mb: 2, mx: isSidebarCollapsed ? 1 : 0 }} />

                <ListItemButton
                    onClick={toggleSidebar}
                    sx={{
                        borderRadius: 2,
                        justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                        px: isSidebarCollapsed ? 1 : 2,
                        py: 1.25,
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'action.hover', color: 'text.primary' }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: isSidebarCollapsed ? 0 : 40, color: 'inherit', justifyContent: 'center' }}>
                        {isSidebarCollapsed ?
                            <Tooltip title="Expand" placement="right" arrow><ChevronRight size={20} /></Tooltip> :
                            <ChevronLeft size={20} />
                        }
                    </ListItemIcon>
                    {!isSidebarCollapsed && (
                        <ListItemText
                            primary="Collapse Menu"
                            primaryTypographyProps={{ fontSize: '0.90rem', fontWeight: 500 }}
                        />
                    )}
                </ListItemButton>
            </Box>
        </Box>
    );
}
