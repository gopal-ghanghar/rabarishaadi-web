'use client';

import { useState, useRef, useCallback } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Button,
    Paper,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Add as AddIcon,
    Close as CloseIcon,
    Collections as CollectionsIcon,
    MoreHoriz as MoreHorizIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import { API_URL } from '@/lib/api';
import GalleryLightbox from './GalleryLightbox';

interface PhotoItem {
    id: number;
    url: string;
    isPrimary: boolean;
    uploadedAt: string;
}

interface ImageGalleryProps {
    photos: PhotoItem[];
    onPhotosChange: () => void;
    editable?: boolean;
}

const MAX_PHOTOS = 10;

export default function ImageGallery({ photos, onPhotosChange, editable = true }: ImageGalleryProps) {
    const [uploading, setUploading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState<PhotoItem | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Menu state
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [menuPhoto, setMenuPhoto] = useState<PhotoItem | null>(null);

    const getImageUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        return `${API_URL.replace('/api', '')}/uploads/${url}`;
    };

    const handleUpload = async (files: FileList | File[]) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const remaining = MAX_PHOTOS - photos.length;
        if (remaining <= 0) {
            alert(`Maximum ${MAX_PHOTOS} images allowed.`);
            return;
        }

        const fileArray = Array.from(files).slice(0, remaining);
        if (fileArray.length === 0) return;

        for (const file of fileArray) {
            if (file.size > 50 * 1024 * 1024) {
                alert(`File "${file.name}" exceeds 50MB limit.`);
                return;
            }
        }

        setUploading(true);
        try {
            const formData = new FormData();
            fileArray.forEach(file => formData.append('files', file));

            const response = await fetch(`${API_URL}/gallery/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Upload failed');
            }

            onPhotosChange();
        } catch (error: any) {
            alert(error.message || 'Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files);
        }
    }, [photos.length]);

    const handleSetPrimary = async (photoId: number) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/gallery/${photoId}/set-primary`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to set as profile picture');
            onPhotosChange();
        } catch (error) {
            alert('Failed to set as profile picture');
        }
    };

    const handleDownload = async (photo: PhotoItem) => {
        try {
            const url = getImageUrl(photo.url);
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = photo.url.split('/').pop() || 'photo.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            alert('Failed to download photo');
        }
    };

    const handleDelete = async () => {
        if (!photoToDelete) return;
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/gallery/${photoToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete photo');
            setDeleteDialogOpen(false);
            setPhotoToDelete(null);
            onPhotosChange();
        } catch (error) {
            alert('Failed to delete photo');
        }
    };

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, photo: PhotoItem) => {
        event.stopPropagation();
        setMenuAnchor(event.currentTarget);
        setMenuPhoto(photo);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setMenuPhoto(null);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CollectionsIcon color="primary" />
                    <Typography variant="h6" color="primary">Photos</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {editable && (
                        <Chip
                            label={`${photos.length}/${MAX_PHOTOS}`}
                            size="small"
                            color={photos.length >= MAX_PHOTOS ? 'error' : 'default'}
                            variant="outlined"
                        />
                    )}
                    {editable && photos.length < MAX_PHOTOS && (
                        <Button
                            variant="text"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{ textTransform: 'none' }}
                        >
                            Add photos
                        </Button>
                    )}
                </Box>
            </Box>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* Photo Grid — 5 columns */}
            <Box
                onDragOver={editable ? (e) => { e.preventDefault(); setDragOver(true); } : undefined}
                onDragLeave={editable ? () => setDragOver(false) : undefined}
                onDrop={editable ? handleDrop : undefined}
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(4, 1fr)', md: 'repeat(5, 1fr)' },
                    gap: 1,
                    ...(dragOver ? { outline: '2px dashed', outlineColor: 'primary.main', outlineOffset: 4, borderRadius: 2 } : {})
                }}
            >
                {photos.map((photo, index) => (
                    <Box
                        key={photo.id}
                        sx={{
                            position: 'relative',
                            borderRadius: 2,
                            overflow: 'hidden',
                            aspectRatio: '1',
                            cursor: 'pointer',
                            '&:hover .action-btn': { opacity: 1 },
                        }}
                    >
                        <Box
                            component="img"
                            src={getImageUrl(photo.url)}
                            alt={`Photo ${index + 1}`}
                            onClick={() => openLightbox(index)}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />

                        {/* Primary badge */}
                        {photo.isPrimary && (
                            <Chip
                                icon={<StarIcon sx={{ fontSize: 12 }} />}
                                label="Profile"
                                size="small"
                                color="primary"
                                sx={{
                                    position: 'absolute',
                                    top: 6, left: 6,
                                    fontSize: '0.65rem',
                                    height: 22,
                                }}
                            />
                        )}

                        {/* ... action button */}
                        {editable && (
                            <IconButton
                                className="action-btn"
                                size="small"
                                onClick={(e) => handleMenuOpen(e, photo)}
                                sx={{
                                    position: 'absolute',
                                    top: 6, right: 6,
                                    bgcolor: 'rgba(0,0,0,0.55)',
                                    color: 'white',
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    width: 28, height: 28,
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' }
                                }}
                            >
                                <MoreHorizIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        )}
                    </Box>
                ))}

                {/* Upload placeholder when empty */}
                {photos.length === 0 && editable && (
                    <Box
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                            borderRadius: 2,
                            border: '2px dashed',
                            borderColor: 'divider',
                            aspectRatio: '1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                        }}
                    >
                        {uploading ? (
                            <CircularProgress size={24} />
                        ) : (
                            <>
                                <AddIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">Add Photo</Typography>
                            </>
                        )}
                    </Box>
                )}
            </Box>

            {uploading && photos.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary">Uploading...</Typography>
                </Box>
            )}

            {/* Context Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { minWidth: 200, borderRadius: 2, boxShadow: 4 } } }}
            >
                {menuPhoto && !menuPhoto.isPrimary && (
                    <MenuItem onClick={() => { handleSetPrimary(menuPhoto!.id); handleMenuClose(); }}>
                        <ListItemIcon><StarBorderIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Set as profile picture</ListItemText>
                    </MenuItem>
                )}
                <MenuItem onClick={() => { if (menuPhoto) handleDownload(menuPhoto); handleMenuClose(); }}>
                    <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Download</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { setPhotoToDelete(menuPhoto); setDeleteDialogOpen(true); handleMenuClose(); }}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                    <ListItemText>Delete photo</ListItemText>
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs">
                <DialogTitle>Delete Photo</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this photo?
                        {photoToDelete?.isPrimary && (
                            <Typography component="span" color="warning.main" fontWeight={600}>
                                {' '}This is your current profile picture. Another photo will be set as your profile picture.
                            </Typography>
                        )}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Lightbox */}
            <GalleryLightbox
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                images={photos.map(p => ({ id: p.id, url: p.url }))}
                initialIndex={lightboxIndex}
            />
        </Box>
    );
}
