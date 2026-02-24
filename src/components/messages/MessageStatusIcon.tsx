'use client';

import { Box } from '@mui/material';

interface MessageStatusIconProps {
    status: 'SENT' | 'DELIVERED' | 'SEEN' | string;
}

/**
 * Message delivery status indicator:
 * - SENT: Single gray check mark (✓)
 * - DELIVERED: Double gray check marks (✓✓)
 * - SEEN: Double blue check marks (✓✓)
 */
export default function MessageStatusIcon({ status }: MessageStatusIconProps) {
    const isDouble = status === 'DELIVERED' || status === 'SEEN';
    const color = status === 'SEEN' ? '#4FC3F7' : '#9E9E9E';

    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                ml: 0.5,
                position: 'relative',
                width: isDouble ? 18 : 12,
                height: 12,
                flexShrink: 0,
            }}
        >
            {/* First check mark (always shown) */}
            <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    position: isDouble ? 'absolute' : 'relative',
                    left: 0,
                }}
            >
                <path
                    d="M3 8.5L6.5 12L13 4"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {/* Second check mark (only for DELIVERED / SEEN) */}
            {isDouble && (
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        position: 'absolute',
                        left: 6,
                    }}
                >
                    <path
                        d="M3 8.5L6.5 12L13 4"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </Box>
    );
}
