import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoaderProps {
    size?: number | string;
    message?: string;
    fullScreen?: boolean;
    center?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
    size = 40,
    message,
    fullScreen = false,
    center = true
}) => {
    const containerStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...(fullScreen ? {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            bgcolor: 'background.default'
        } : {
            width: '100%',
            py: 4
        })
    };

    return (
        <Box sx={center ? containerStyles : {}}>
            <CircularProgress size={size} color="primary" />
            {message && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {message}
                </Typography>
            )}
        </Box>
    );
};

export default Loader;
