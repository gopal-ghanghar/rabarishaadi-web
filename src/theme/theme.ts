'use client';

import { createTheme } from '@mui/material/styles';
import { Geist } from 'next/font/google';

const geist = Geist({
    subsets: ['latin'],
    display: 'swap',
});

const theme = createTheme({
    typography: {
        fontFamily: geist.style.fontFamily,
    },
    palette: {
        primary: {
            main: '#d6002a', // Rabari Red
            dark: '#b91c1c',
            light: '#ff4d6d',
        },
        secondary: {
            main: '#C5A059', // Gold
            light: '#e6c47f',
            dark: '#947535',
        },
        background: {
            default: '#FFFBF7', // Cream
            paper: '#ffffff',
        },
        text: {
            primary: '#111827',
            secondary: '#6b7280',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #d6002a 0%, #b91c1c 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #ff1f4b 0%, #d6002a 100%)',
                    }
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }
            }
        }
    },
});

export default theme;
