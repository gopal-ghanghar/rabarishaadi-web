'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Avatar,
    IconButton,
    InputBase,
    Paper,
    Badge,
    Tabs,
    Tab,
    Button,
    CircularProgress,
    Stack,
    TextField, // Added
    InputAdornment, // Added
    Divider, // Added
    Drawer // Added
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
    Search as SearchIcon,
    MoreHoriz as MoreIcon,
    Edit as EditIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns'; // Changed from format
import { chatService } from '@/lib/services/chat';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { useChatStore } from '@/store/useChatStore'; // Added

interface Conversation {
    userId: number;
    name: string;
    profilePicture?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export default function MessagesDrawer() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { isMessagesOpen, closeMessages } = useUIStore();
    const globalUnreadCount = useChatStore(state => state.globalUnreadCount); // Subscribe to updates

    // Pagination & Filter State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0); // 0 = All, 1 = Unread
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Observer for infinite scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Reset when drawer opens or tab changes
    useEffect(() => {
        if (isMessagesOpen) {
            setConversations([]);
            setPage(0);
            setHasMore(true);
            setLoading(false); // Ensure loading is reset
            // Trigger fetch via page=0 effect
        }
    }, [isMessagesOpen, tabValue]);

    // Fetch conversations
    useEffect(() => {
        if (!isMessagesOpen) return;

        const fetchConversations = async () => {
            setLoading(true);
            try {
                const unreadOnly = tabValue === 1;
                const data = await chatService.getConversations(page, 15, '', unreadOnly);

                // data is Page<ConversationDTO>
                const newConvs = data.content || [];

                setConversations(prev => {
                    // Avoid duplicates just in case
                    if (page === 0) return newConvs;

                    // Simple distinct filter by userId
                    const existingIds = new Set(prev.map(c => c.userId));
                    const filteredNew = newConvs.filter((c: Conversation) => !existingIds.has(c.userId));
                    return [...prev, ...filteredNew];
                });

                setHasMore(!data.last);
            } catch (error) {
                console.error("Failed to load conversations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [isMessagesOpen, page, tabValue, user, globalUnreadCount]); // Refetch on global unread update (new message)

    const handleConversationClick = (userId: number) => {
        router.push(`/messages?userId=${userId}`);
        // closeMessages(); // Optional: close or keep open? kept open per UI preference
    };

    const handleSeeAllClick = () => {
        router.push('/messages');
        closeMessages();
    };

    const formatTime = (time: string) => {
        if (!time) return '';
        try {
            return formatDistanceToNow(new Date(time), { addSuffix: true });
        } catch (e) {
            return '';
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isMessagesOpen) return null;

    return (
        <Drawer
            anchor="right"
            open={isMessagesOpen}
            onClose={closeMessages}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 400 } }
            }}
        >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700}>
                    Messages
                </Typography>
                <Stack direction="row" spacing={1}>
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <MoreIcon />
                    </IconButton>
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={closeMessages}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </Box>

            <Box sx={{ p: 2, pb: 0 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'action.hover',
                        borderRadius: 2,
                        mb: 2
                    }}
                >
                    <IconButton sx={{ p: '8px' }} aria-label="search">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                    </IconButton>
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Paper>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} variant="fullWidth">
                    <Tab label="All" />
                    <Tab label="Unread" />
                </Tabs>
            </Box>

            <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
                {filteredConversations.map((conv, index) => (
                    <div key={conv.userId} ref={index === filteredConversations.length - 1 ? lastElementRef : null}>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => handleConversationClick(conv.userId)}
                                sx={{
                                    px: 2,
                                    py: 2,
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <ListItemAvatar sx={{ minWidth: 'auto', mr: 2 }}>
                                    <Badge
                                        color="success"
                                        variant="dot"
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        invisible={false} // Placeholder for online status
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                border: '2px solid white'
                                            }
                                        }}
                                    >
                                        <Avatar src={conv.profilePicture} alt={conv.name} sx={{ width: 50, height: 50 }} />
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" fontWeight={conv.unreadCount > 0 ? 600 : 500} sx={{ lineHeight: 1.2 }}>
                                            {conv.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <Typography
                                                variant="body2"
                                                color={conv.unreadCount > 0 ? "text.primary" : "text.secondary"}
                                                fontWeight={conv.unreadCount > 0 ? 600 : 400}
                                                noWrap
                                                sx={{ maxWidth: 160, fontSize: '0.85rem' }}
                                            >
                                                {conv.lastMessage}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                · {formatTime(conv.lastMessageTime)}
                                            </Typography>
                                        </Box>
                                    }
                                />
                                {conv.unreadCount > 0 && (
                                    <Box sx={{ ml: 1 }}>
                                        <Badge badgeContent={conv.unreadCount} color="error" />
                                    </Box>
                                )}
                            </ListItemButton>
                        </ListItem>
                        <Divider component="li" />
                    </div>
                ))}

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}

                {!loading && filteredConversations.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {tabValue === 1 ? 'No unread messages' : 'No conversations found'}
                        </Typography>
                    </Box>
                )}
            </List>

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    fullWidth
                    color="primary"
                    onClick={handleSeeAllClick}
                >
                    See all in Messenger
                </Button>
            </Box>
        </Box>
    );
}
