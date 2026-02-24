'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';

interface ClientRouteGuardProps {
    children: React.ReactNode;
    requiredRole?: 'ADMIN' | 'USER';
}

export default function ClientRouteGuard({ children, requiredRole }: ClientRouteGuardProps) {
    const { isAuthenticated, user, setFromLocalStorage } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        // Ensure auth state is hydrated from local storage
        setFromLocalStorage();
        setChecked(true);
    }, [setFromLocalStorage]);

    useEffect(() => {
        if (!checked) return;

        if (!isAuthenticated) {
            // Avoid redirect loop if already on login (though guard shouldn't be used on login)
            if (!pathname.startsWith('/auth')) {
                router.replace(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
            }
            return;
        }

        if (requiredRole && user) {
            if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
                router.replace('/dashboard'); // User trying to access Admin page
            } else if (requiredRole === 'USER' && user.role !== 'USER') {
                router.replace('/admin'); // Admin trying to access User page
            }
        }
    }, [checked, isAuthenticated, user, requiredRole, router, pathname]);

    // Show loader while checking auth state or if redirecting
    if (!checked || !isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return <>{children}</>;
}
