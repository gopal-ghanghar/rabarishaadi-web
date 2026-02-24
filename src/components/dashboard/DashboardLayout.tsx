import { Box, Container } from '@mui/material';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { chatService } from '@/lib/services/chat';
import { useUserPresence } from '../../hooks/usePresence';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, isAuthenticated } = useAuthStore();
    const { isSidebarCollapsed } = useUIStore();

    // Start User Presence Heartbeat
    useUserPresence(isAuthenticated);

    // Start Chat Service
    useEffect(() => {
        if (isAuthenticated && user) {
            chatService.connect();
        }
        return () => {
            // Optional: disconnect if we really leave the dashboard context
            // chatService.disconnect(); 
        };
    }, [isAuthenticated, user]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6FA' }}>
            {/* 1. Full-Width Fixed Header */}
            <DashboardHeader title="" />

            {/* 2. Main Layout Container (Sidebar + Content) */}
            <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 65px)' }}>

                {/* Fixed Sidebar */}
                <Box
                    component="aside"
                    sx={{
                        width: isSidebarCollapsed ? 80 : 280,
                        transition: 'width 0.3s ease',
                        flexShrink: 0,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        position: 'sticky',
                        top: 65, // Below header
                        height: 'calc(100vh - 65px)',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}
                >
                    <Sidebar />
                </Box>

                {/* Scrollable Main Content */}
                <Box component="main" sx={{ flexGrow: 1, p: 4, overflowX: 'hidden' }}>
                    <Container maxWidth="xl" disableGutters>
                        {children}
                    </Container>
                </Box>

                {/* Right Panel: Messages - MOVED TO HEADER POPOVER */}
                {/* <MessagesDrawer /> */}
            </Box>
        </Box >
    );
}

export default DashboardLayout;
