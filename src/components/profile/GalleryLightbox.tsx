'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    IconButton,
    Box,
    Typography
} from '@mui/material';
import {
    Close as CloseIcon,
    ChevronLeft,
    ChevronRight
} from '@mui/icons-material';
import { API_URL } from '@/lib/api';

interface GalleryLightboxProps {
    open: boolean;
    onClose: () => void;
    images: { id: number; url: string }[];
    initialIndex?: number;
}

export default function GalleryLightbox({ open, onClose, images, initialIndex = 0 }: GalleryLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex, open]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;
            if (e.key === 'ArrowLeft') setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
            if (e.key === 'ArrowRight') setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, images.length, onClose]);

    if (!images.length) return null;

    const getImageUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        return `${API_URL.replace('/api', '')}/uploads/${url}`;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen
            PaperProps={{
                sx: {
                    bgcolor: 'rgba(0, 0, 0, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }
            }}
        >
            {/* Close button */}
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                    zIndex: 10
                }}
            >
                <CloseIcon />
            </IconButton>

            {/* Counter */}
            <Typography
                sx={{
                    position: 'absolute',
                    top: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'white',
                    fontSize: '0.9rem',
                    zIndex: 10
                }}
            >
                {currentIndex + 1} of {images.length}
            </Typography>

            {/* Left arrow */}
            {images.length > 1 && (
                <IconButton
                    onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                    sx={{
                        position: 'absolute',
                        left: 16,
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                        zIndex: 10
                    }}
                >
                    <ChevronLeft sx={{ fontSize: 32 }} />
                </IconButton>
            )}

            {/* Image */}
            <Box
                component="img"
                src={getImageUrl(images[currentIndex]?.url || '')}
                alt={`Photo ${currentIndex + 1}`}
                sx={{
                    maxWidth: '90vw',
                    maxHeight: '85vh',
                    objectFit: 'contain',
                    borderRadius: 2,
                }}
            />

            {/* Right arrow */}
            {images.length > 1 && (
                <IconButton
                    onClick={() => setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                        zIndex: 10
                    }}
                >
                    <ChevronRight sx={{ fontSize: 32 }} />
                </IconButton>
            )}
        </Dialog>
    );
}
