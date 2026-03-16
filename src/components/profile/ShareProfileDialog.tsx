import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    IconButton,
    OutlinedInput,
    InputAdornment,
    Divider,
    Stack,
    Tooltip,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Close as CloseIcon,
    ContentCopy as ContentCopyIcon,
    Check as CheckIcon,
    WhatsApp as WhatsAppIcon,
    Facebook as FacebookIcon,
    Instagram as InstagramIcon
} from '@mui/icons-material';

interface ShareProfileDialogProps {
    open: boolean;
    onClose: () => void;
    shareUrl: string;
}

export default function ShareProfileDialog({ open, onClose, shareUrl }: ShareProfileDialogProps) {
    const [copied, setCopied] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setSnackbarMessage('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleWhatsAppShare = () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    const handleFacebookShare = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    const handleInstagramShare = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setSnackbarMessage('Link copied! Paste it in Instagram to share.');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarMessage('');
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        width: '100%',
                        maxWidth: 400
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    pb: 1
                }}>
                    <Typography variant="h6" fontWeight="bold">Share Profile</Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                
                <DialogContent>
                    <Box sx={{ mb: 3, mt: 1 }}>
                        <OutlinedInput
                            value={shareUrl}
                            readOnly
                            fullWidth
                            size="small"
                            sx={{ 
                                bgcolor: 'grey.50',
                                borderRadius: 2,
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'grey.300',
                                }
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <Tooltip title={copied ? "Copied!" : "Copy link"}>
                                        <IconButton
                                            onClick={handleCopy}
                                            edge="end"
                                            color={copied ? "success" : "default"}
                                        >
                                            {copied ? <CheckIcon /> : <ContentCopyIcon />}
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            }
                        />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Share via
                        </Typography>
                        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                            <IconButton 
                                onClick={handleWhatsAppShare}
                                sx={{ 
                                    color: '#25D366',
                                    bgcolor: 'rgba(37, 211, 102, 0.1)',
                                    '&:hover': { bgcolor: 'rgba(37, 211, 102, 0.2)' },
                                    width: 48,
                                    height: 48
                                }}
                            >
                                <WhatsAppIcon fontSize="medium" />
                            </IconButton>
                            
                            <IconButton 
                                onClick={handleFacebookShare}
                                sx={{ 
                                    color: '#1877F2',
                                    bgcolor: 'rgba(24, 119, 242, 0.1)',
                                    '&:hover': { bgcolor: 'rgba(24, 119, 242, 0.2)' },
                                    width: 48,
                                    height: 48
                                }}
                            >
                                <FacebookIcon fontSize="medium" />
                            </IconButton>

                            <IconButton 
                                onClick={handleInstagramShare}
                                sx={{ 
                                    color: '#E4405F',
                                    bgcolor: 'rgba(228, 64, 95, 0.1)',
                                    '&:hover': { bgcolor: 'rgba(228, 64, 95, 0.2)' },
                                    width: 48,
                                    height: 48
                                }}
                            >
                                <InstagramIcon fontSize="medium" />
                            </IconButton>
                        </Stack>
                    </Box>
                </DialogContent>
            </Dialog>

            <Snackbar
                open={Boolean(snackbarMessage)}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
