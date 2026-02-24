'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, IconButton, Typography, Modal, Fade } from '@mui/material';
import {
    Close as CloseIcon,
    ArrowBackIos as PrevIcon,
    ArrowForwardIos as NextIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    CropFree as ResetZoomIcon
} from '@mui/icons-material';
import { API_URL } from '@/lib/api';

interface Attachment {
    id: number;
    fileName: string;
    originalName: string;
    fileSize: number;
    contentType: string;
    url: string;
}

interface PhotoLightboxProps {
    open: boolean;
    attachments: Attachment[];
    initialIndex: number;
    onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.25;

export default function PhotoLightbox({ open, attachments, initialIndex, onClose }: PhotoLightboxProps) {
    const baseUrl = API_URL.replace('/api', '');
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Zoom & pan state
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const panStart = useRef({ x: 0, y: 0 });
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Reset zoom & pan when image changes or lightbox opens/closes
    const resetZoom = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, []);

    useEffect(() => {
        setCurrentIndex(initialIndex);
        resetZoom();
    }, [initialIndex, open, resetZoom]);

    // Reset zoom on image change
    useEffect(() => {
        resetZoom();
    }, [currentIndex, resetZoom]);

    const handlePrev = useCallback(() => {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : attachments.length - 1));
    }, [attachments.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex(prev => (prev < attachments.length - 1 ? prev + 1 : 0));
    }, [attachments.length]);

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => {
            const next = Math.max(prev - ZOOM_STEP, MIN_ZOOM);
            if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
            return next;
        });
    }, []);

    // Mouse wheel zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY < 0) {
            setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
        } else {
            setZoom(prev => {
                const next = Math.max(prev - ZOOM_STEP, MIN_ZOOM);
                if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
                return next;
            });
        }
    }, []);

    // Double-click to toggle zoom
    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (zoom > 1) {
            resetZoom();
        } else {
            setZoom(2);
        }
    }, [zoom, resetZoom]);

    // Drag to pan (when zoomed in)
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (zoom <= 1) return;
        e.preventDefault();
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        panStart.current = { ...pan };
    }, [zoom, pan]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setPan({
            x: panStart.current.x + dx,
            y: panStart.current.y + dy
        });
    }, []);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    // Keyboard navigation + zoom shortcuts
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrev();
            else if (e.key === 'ArrowRight') handleNext();
            else if (e.key === 'Escape') onClose();
            else if (e.key === '+' || e.key === '=') { e.preventDefault(); handleZoomIn(); }
            else if (e.key === '-' || e.key === '_') { e.preventDefault(); handleZoomOut(); }
            else if (e.key === '0') { e.preventDefault(); resetZoom(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, handlePrev, handleNext, onClose, handleZoomIn, handleZoomOut, resetZoom]);

    if (!attachments.length) return null;

    const current = attachments[currentIndex];
    const isZoomed = zoom > 1;
    const zoomPercent = Math.round(zoom * 100);

    return (
        <Modal open={open} onClose={onClose} closeAfterTransition>
            <Fade in={open}>
                <Box
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        bgcolor: 'rgba(0,0,0,0.92)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        outline: 'none',
                        zIndex: 9999
                    }}
                    onClick={isZoomed ? undefined : onClose}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            zIndex: 1
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                            {currentIndex + 1} / {attachments.length}
                        </Typography>

                        {/* Zoom controls */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton
                                onClick={handleZoomOut}
                                disabled={zoom <= MIN_ZOOM}
                                sx={{
                                    color: 'white',
                                    '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' }
                                }}
                                size="small"
                            >
                                <ZoomOutIcon />
                            </IconButton>

                            <Typography
                                variant="body2"
                                color="white"
                                sx={{
                                    opacity: 0.8,
                                    minWidth: 48,
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    fontSize: '0.8rem'
                                }}
                            >
                                {zoomPercent}%
                            </Typography>

                            <IconButton
                                onClick={handleZoomIn}
                                disabled={zoom >= MAX_ZOOM}
                                sx={{
                                    color: 'white',
                                    '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' }
                                }}
                                size="small"
                            >
                                <ZoomInIcon />
                            </IconButton>

                            {isZoomed && (
                                <IconButton
                                    onClick={resetZoom}
                                    sx={{ color: 'white', ml: 0.5 }}
                                    size="small"
                                >
                                    <ResetZoomIcon />
                                </IconButton>
                            )}
                        </Box>

                        <IconButton onClick={onClose} sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Image with zoom & pan */}
                    <Box
                        ref={imageContainerRef}
                        onClick={(e) => e.stopPropagation()}
                        onWheel={handleWheel}
                        onDoubleClick={handleDoubleClick}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'visible',
                            cursor: isZoomed ? (isDragging.current ? 'grabbing' : 'grab') : 'zoom-in',
                            userSelect: 'none'
                        }}
                    >
                        <img
                            src={`${baseUrl}${current.url}`}
                            alt={current.originalName}
                            draggable={false}
                            style={{
                                maxWidth: '90vw',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                                borderRadius: zoom > 1 ? 0 : 8,
                                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                                transformOrigin: 'center center',
                                transition: isDragging.current ? 'none' : 'transform 0.2s ease',
                                pointerEvents: 'none'
                            }}
                        />
                    </Box>

                    {/* Navigation arrows */}
                    {attachments.length > 1 && (
                        <>
                            <IconButton
                                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                sx={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                                    width: 48,
                                    height: 48
                                }}
                            >
                                <PrevIcon />
                            </IconButton>
                            <IconButton
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                sx={{
                                    position: 'absolute',
                                    right: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                                    width: 48,
                                    height: 48
                                }}
                            >
                                <NextIcon />
                            </IconButton>
                        </>
                    )}

                    {/* Thumbnail strip */}
                    {attachments.length > 1 && (
                        <Box
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                                position: 'absolute',
                                bottom: 16,
                                display: 'flex',
                                gap: 1,
                                px: 2,
                                overflowX: 'auto',
                                maxWidth: '90vw'
                            }}
                        >
                            {attachments.map((att, idx) => (
                                <Box
                                    key={att.id}
                                    onClick={() => setCurrentIndex(idx)}
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: idx === currentIndex ? '2px solid white' : '2px solid transparent',
                                        opacity: idx === currentIndex ? 1 : 0.5,
                                        transition: 'all 0.2s',
                                        flexShrink: 0,
                                        '&:hover': { opacity: 0.8 }
                                    }}
                                >
                                    <img
                                        src={`${baseUrl}${att.url}`}
                                        alt={att.originalName}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Fade>
        </Modal>
    );
}
