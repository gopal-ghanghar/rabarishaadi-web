'use client';

import { useState, useEffect } from 'react';
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
    Popover,
    InputBase,
    Paper,
    Badge,
    Tabs,
    Tab,
    Button,
    CircularProgress,
    Stack
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
    Search as SearchIcon,
    MoreHoriz as MoreIcon,
    Edit as EditIcon,
    Close as CloseIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { chatService } from '@/lib/services/chat';
import { useAuthStore } from '@/store/useAuthStore';

interface MessagesPopoverProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
}

interface Conversation {
    userId: number;
    name: string;
    profilePicture?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    online?: boolean;
}

export default function MessagesPopover({ anchorEl, open, onClose }: MessagesPopoverProps) {
    const router = useRouter();
    const theme = useTheme();
    const { user } = useAuthStore();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [view, setView] = useState<'conversations' | 'newChat'>('conversations');
    const [connections, setConnections] = useState<any[]>([]);
    const [filteredConnections, setFilteredConnections] = useState<any[]>([]);
    const [searchContact, setSearchContact] = useState('');

    useEffect(() => {
        if (anchorEl) {
            loadConversations();
            setView('conversations'); // Reset view on open
        }
    }, [anchorEl, tabValue, user, debouncedSearch]); // Reload when tab or search changes

    useEffect(() => {
        if (view === 'newChat') {
            loadConnections();
        }
    }, [view]);

    useEffect(() => {
        if (searchContact.trim() === '') {
            setFilteredConnections(connections);
        } else {
            const lower = searchContact.toLowerCase();
            setFilteredConnections(connections.filter(c =>
                (c.firstName + ' ' + c.lastName).toLowerCase().includes(lower)
            ));
        }
    }, [searchContact, connections]);

    const loadConversations = async () => {
        setLoading(true);
        try {
            // const isUnread = tabValue === 1; // Backend support for both search + unread is pending or implemented?
            // implemented.
            const isUnread = tabValue === 1;
            const data = await chatService.getConversations(0, 5, debouncedSearch, isUnread);
            setConversations(data.content || []);
        } catch (error) {
            console.error("Failed to load conversations", error);
        } finally {
            setLoading(false);
        }
    };

    const loadConnections = async () => {
        setLoading(true);
        try {
            const data = await chatService.getConnections();
            setConnections(data.content || []);
            setFilteredConnections(data.content || []);
        } catch (error) {
            console.error("Failed to load connections", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConversationClick = (userId: number) => {
        console.log("Navigating to conversation:", userId);
        router.push(`/messages?userId=${userId}`);
        onClose(); // Close popover when navigating
    };

    const handleNewChatClick = () => {
        setView('newChat');
    };

    const handleBackToConversations = () => {
        setView('conversations');
    };

    const handleSelectContact = (contact: any) => {
        console.log("Starting new chat with:", contact.userId);
        router.push(`/messages?userId=${contact.userId}`);
        onClose();
        setView('conversations');
    };

    const handleSeeAllClick = () => {
        router.push('/messages');
        onClose();
    };

    const formatTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diffInWeeks = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7);

            if (diffInWeeks < 1) {
                return format(date, 'MMM d');
            }
            return format(date, 'MMM d');
        } catch (e) {
            return '';
        }
    };

    return (
        <Popover
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            PaperProps={{
                sx: {
                    width: 360,
                    maxHeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    mt: 1.5,
                    borderRadius: 3,
                    boxShadow: theme.shadows[4]
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: 600 }}>
                {view === 'conversations' ? (
                    <>
                        {/* Header */}
                        <Box sx={{ p: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5" fontWeight={800} sx={{ fontSize: '1.5rem' }}>Chats</Typography>
                                <Stack direction="row" spacing={1}>
                                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                        <MoreIcon />
                                    </IconButton>
                                    <IconButton size="small" sx={{ color: 'primary.main', bgcolor: 'primary.lighter' }} onClick={handleNewChatClick}>
                                        <EditIcon />
                                    </IconButton>
                                </Stack>
                            </Box>

                            <Paper
                                component="form"
                                sx={{
                                    p: '2px 4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: '#F3F4F6',
                                    borderRadius: 2,
                                    boxShadow: 'none',
                                    mb: 3,
                                    mt: 1
                                }}
                            >
                                <IconButton sx={{ p: '8px' }} aria-label="search">
                                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                </IconButton>
                                <InputBase
                                    sx={{ ml: 1, flex: 1, fontSize: '0.95rem' }}
                                    placeholder="Search Messenger"
                                    inputProps={{ 'aria-label': 'search messenger' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </Paper>

                            <Tabs
                                value={tabValue}
                                onChange={(e, v) => setTabValue(v)}
                                variant="fullWidth"
                                sx={{
                                    '& .MuiTabs-indicator': { display: 'none' }
                                }}
                            >
                                <Tab
                                    label="All"
                                    disableRipple
                                    sx={{
                                        mr: 1,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        borderRadius: 2,
                                        '&.Mui-selected': {
                                            color: 'primary.main',
                                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
                                        },
                                        '&:hover': {
                                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05)
                                        }
                                    }}
                                />
                                <Tab
                                    label="Unread"
                                    disableRipple
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        borderRadius: 2,
                                        '&.Mui-selected': {
                                            color: 'primary.main',
                                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
                                        },
                                        '&:hover': {
                                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05)
                                        }
                                    }}
                                />
                            </Tabs>
                        </Box>

                        {/* List */}
                        <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : conversations.length > 0 ? (
                                conversations.map((conv) => (
                                    <ListItem key={conv.userId} disablePadding>
                                        <ListItemButton
                                            onClick={() => handleConversationClick(conv.userId)}
                                            sx={{
                                                px: 2,
                                                py: 1,
                                                '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' }
                                            }}
                                        >
                                            <ListItemAvatar sx={{ minWidth: 'auto', mr: 2 }}>
                                                <Badge
                                                    color="success"
                                                    variant="dot"
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    sx={{
                                                        '& .MuiBadge-badge': {
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: '50%',
                                                            border: '2px solid white',
                                                            bgcolor: conv.online ? 'success.main' : '#9CA3AF'
                                                        }
                                                    }}
                                                >
                                                    <Avatar src={conv.profilePicture} alt={conv.name} sx={{ width: 40, height: 40 }} />
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
                                ))
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                    <Typography variant="body2">
                                        {tabValue === 1 ? 'No unread conversations.' : 'No conversations yet.'}
                                    </Typography>
                                </Box>
                            )}
                        </List>

                        {/* Footer */}
                        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Button
                                fullWidth
                                color="inherit"
                                onClick={handleSeeAllClick}
                                sx={{ textTransform: 'none', fontWeight: 600, color: 'primary.main' }}
                            >
                                See all in Messenger
                            </Button>
                        </Box>
                    </>
                ) : (
                    // New Chat View
                    <>
                        <Box sx={{ p: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={handleBackToConversations} size="small" sx={{ mr: 1 }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="h6" fontWeight="bold">New Message</Typography>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            <InputBase
                                fullWidth
                                placeholder="To: Type a name"
                                value={searchContact}
                                onChange={(e) => setSearchContact(e.target.value)}
                                sx={{ fontSize: '0.95rem' }}
                                autoFocus
                            />
                        </Box>
                        <List sx={{ flex: 1, overflowY: 'auto' }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : filteredConnections.length > 0 ? (
                                filteredConnections.map((contact) => (
                                    <ListItemButton key={contact.userId} onClick={() => handleSelectContact(contact)}>
                                        <ListItemAvatar>
                                            <Avatar src={contact.profilePicture} alt={contact.firstName} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={`${contact.firstName} ${contact.lastName}`}
                                            secondary={contact.headline || 'Connected'}
                                        />
                                    </ListItemButton>
                                ))
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                    <Typography variant="body2">No connections found.</Typography>
                                </Box>
                            )}
                        </List>
                    </>
                )}
            </Box>
        </Popover>
    );
}
