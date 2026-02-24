"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Avatar, Menu, MenuItem, Divider } from "@mui/material";
import { useAuthStore } from "@/store/useAuthStore";
import { Person, Logout } from "@mui/icons-material";

export default function Navbar() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);



    // Hydrate store on mount to prevent mismatch
    useEffect(() => {
        useAuthStore.getState().setFromLocalStorage();
    }, []);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        router.push("/auth/login");
    };

    const handleProfile = () => {
        handleClose();
        router.push("/dashboard");
    };

    // Transparent on home, White/Shadow on others
    const appBarStyles = isHomePage
        ? {
            background: "transparent",
            boxShadow: "none",
            position: "absolute" as const,
            top: 0,
            left: 0,
            width: "100%",
        }
        : {
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            position: "sticky" as const,
            top: 0,
        };

    // Hide Navbar on dashboard pages where DashboardLayout is used
    if (pathname?.startsWith('/dashboard') ||
        pathname?.startsWith('/matches') ||
        pathname?.startsWith('/profile') ||
        pathname?.startsWith('/admin') ||
        pathname?.startsWith('/shortlisted') ||
        pathname?.startsWith('/requests') ||
        pathname?.startsWith('/connections') ||
        pathname?.startsWith('/messages')) {
        return null;
    }

    const textColor = isHomePage ? "white" : "text.primary";
    const logoColor = isHomePage ? "white" : "primary.main";

    return (
        <AppBar sx={{ ...appBarStyles, zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: "space-between", height: 80 }}>
                    {/* Logo */}
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                color: logoColor,
                                fontFamily: "var(--font-heading)",
                                letterSpacing: "-0.5px",
                                textShadow: isHomePage ? "0 2px 4px rgba(0,0,0,0.3)" : "none",
                            }}
                        >
                            RabariShaadi
                        </Typography>
                    </Link>

                    {/* Nav Links */}
                    <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4 }}>
                        {["Home", "About Us", "Membership", "Contact"].map((item) => (
                            <Link key={item} href="/" style={{ textDecoration: "none" }}>
                                <Typography
                                    sx={{
                                        fontWeight: 500,
                                        color: textColor,
                                        "&:hover": { color: "primary.main" },
                                        transition: "color 0.2s",
                                        textShadow: isHomePage ? "0 1px 2px rgba(0,0,0,0.5)" : "none",
                                    }}
                                >
                                    {item}
                                </Typography>
                            </Link>
                        ))}
                    </Box>

                    {/* Auth Buttons / User Menu */}
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        {!isAuthenticated ? (
                            <>
                                <Link href="/auth/login" style={{ textDecoration: "none" }}>
                                    <Button
                                        variant="text"
                                        sx={{
                                            color: textColor,
                                            fontWeight: 600,
                                            "&:hover": { color: "primary.main" },
                                        }}
                                    >
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/auth/signup" style={{ textDecoration: "none" }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        sx={{
                                            borderRadius: 99,
                                            px: 3,
                                            py: 1,
                                            boxShadow: "0 4px 10px rgba(214, 0, 42, 0.3)",
                                        }}
                                    >
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                        {user?.firstName?.[0] || <Person />}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorEl}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <Box sx={{ px: 2, py: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {user?.firstName} {user?.lastName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {user?.email}
                                        </Typography>
                                    </Box>
                                    <Divider />
                                    <MenuItem onClick={handleProfile}>
                                        <Person sx={{ mr: 1, fontSize: 20 }} /> My Profile
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <Logout sx={{ mr: 1, fontSize: 20 }} /> Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
