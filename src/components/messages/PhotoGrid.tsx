'use client';

import { Box, Typography } from '@mui/material';
import { API_URL } from '@/lib/api';

interface Attachment {
    id: number;
    fileName: string;
    originalName: string;
    fileSize: number;
    contentType: string;
    url: string;
}

interface PhotoGridProps {
    attachments: Attachment[];
    onPhotoClick: (index: number) => void;
}

export default function PhotoGrid({ attachments, onPhotoClick }: PhotoGridProps) {
    const baseUrl = API_URL.replace('/api', '');
    const count = attachments.length;

    if (count === 0) return null;

    // Single photo — full width
    if (count === 1) {
        return (
            <Box
                onClick={() => onPhotoClick(0)}
                sx={{
                    cursor: 'pointer',
                    borderRadius: 2,
                    overflow: 'hidden',
                    maxWidth: 300,
                    '&:hover': { opacity: 0.9 }
                }}
            >
                <img
                    src={`${baseUrl}${attachments[0].url}`}
                    alt={attachments[0].originalName}
                    style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: 300,
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: 8
                    }}
                />
            </Box>
        );
    }

    // Multiple photos — grid
    const visibleCount = Math.min(count, 4);
    const remaining = count - visibleCount;

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: count === 2 ? '1fr 1fr' : '1fr 1fr',
                gridTemplateRows: count <= 2 ? '1fr' : '1fr 1fr',
                gap: 0.5,
                borderRadius: 2,
                overflow: 'hidden',
                maxWidth: 300
            }}
        >
            {attachments.slice(0, visibleCount).map((att, idx) => (
                <Box
                    key={att.id}
                    onClick={() => onPhotoClick(idx)}
                    sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        // First image spans full width if 3 photos
                        ...(count === 3 && idx === 0 ? { gridColumn: '1 / -1' } : {}),
                        '&:hover': { opacity: 0.9 }
                    }}
                >
                    <img
                        src={`${baseUrl}${att.url}`}
                        alt={att.originalName}
                        style={{
                            width: '100%',
                            height: count <= 2 ? 180 : 120,
                            objectFit: 'cover',
                            display: 'block'
                        }}
                    />
                    {/* "+N more" overlay on last visible photo */}
                    {idx === visibleCount - 1 && remaining > 0 && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography variant="h5" color="white" fontWeight={700}>
                                +{remaining}
                            </Typography>
                        </Box>
                    )}
                </Box>
            ))}
        </Box>
    );
}
