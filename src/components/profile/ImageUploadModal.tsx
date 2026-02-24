import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Slider,
    Typography,
    Stack,
    IconButton
} from '@mui/material';
import {
    ZoomIn,
    ZoomOut,
    RotateRight,
    Close as CloseIcon,
    CloudUpload
} from '@mui/icons-material';
import { fetchApi, API_URL } from '@/lib/api';

interface ImageUploadModalProps {
    open: boolean;
    onClose: () => void;
    onUploadSuccess: (filename: string) => void;
}

export default function ImageUploadModal({ open, onClose, onUploadSuccess }: ImageUploadModalProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [uploading, setUploading] = useState(false);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => setImageSrc(reader.result as string));
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: any,
        rotation = 0
    ): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return Promise.reject(new Error('No 2d context'));
        }

        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

        canvas.width = safeArea;
        canvas.height = safeArea;

        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        ctx.drawImage(
            image,
            safeArea / 2 - image.width * 0.5,
            safeArea / 2 - image.height * 0.5
        );

        const data = ctx.getImageData(0, 0, safeArea, safeArea);

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.putImageData(
            data,
            0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
            0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
        );

        return new Promise((resolve) => {
            canvas.toBlob((file) => {
                resolve(file!);
            }, 'image/jpeg');
        });
    };

    const handleUpload = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setUploading(true);
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            const formData = new FormData();
            formData.append('file', croppedImageBlob, 'profile.jpg');

            const endpoint = `${API_URL}/profile/upload-photo`;
            const token = localStorage.getItem('token');

            // Need to use raw fetch for multipart/form-data to let browser handle boundary
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            onUploadSuccess(data.fileName);
            handleClose();
        } catch (error) {
            console.error(error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setImageSrc(null);
        setZoom(1);
        setRotation(0);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Upload Profile Picture
                <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
                {!imageSrc ? (
                    <Box sx={{ p: 4, textAlign: 'center', border: '2px dashed #ccc', borderRadius: 2, cursor: 'pointer' }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="raised-button-file"
                            type="file"
                            onChange={onFileChange}
                        />
                        <label htmlFor="raised-button-file">
                            <Button variant="contained" component="span" startIcon={<CloudUpload />}>
                                Select Image
                            </Button>
                        </label>
                    </Box>
                ) : (
                    <Box sx={{ position: 'relative', height: 400, width: '100%', bgcolor: '#333' }}>
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={1} // Square aspect ratio
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            onRotationChange={setRotation}
                        />
                    </Box>
                )}

                {imageSrc && (
                    <Box sx={{ mt: 3 }}>
                        <Typography gutterBottom>Zoom</Typography>
                        <Stack spacing={2} direction="row" sx={{ mb: 2 }} alignItems="center">
                            <ZoomOut />
                            <Slider
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(e, zoom) => setZoom(Number(zoom))}
                            />
                            <ZoomIn />
                        </Stack>

                        <Typography gutterBottom>Rotation</Typography>
                        <Stack spacing={2} direction="row" alignItems="center">
                            <RotateRight />
                            <Slider
                                value={rotation}
                                min={0}
                                max={360}
                                step={1}
                                onChange={(e, rotation) => setRotation(Number(rotation))}
                            />
                        </Stack>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleUpload} variant="contained" disabled={!imageSrc || uploading}>
                    {uploading ? 'Uploading...' : 'Save Picture'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
