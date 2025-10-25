import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Divider,
  Button,
  Chip
} from '@mui/material';
import { Send, Close } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const ChatContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#1A2332'
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: '6px'
  },
  '&::-webkit-scrollbar-track': {
    bgcolor: '#1A2332'
  },
  '&::-webkit-scrollbar-thumb': {
    bgcolor: '#14B8A6',
    borderRadius: '3px'
  }
}));

const MessageBubble = styled(Paper)(({ isOwn }) => ({
  padding: '8px 12px',
  marginBottom: '8px',
  maxWidth: '80%',
  wordWrap: 'break-word',
  backgroundColor: isOwn ? '#0F766E' : '#334155',
  color: '#E2E8F0',
  alignSelf: isOwn ? 'flex-end' : 'flex-start'
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid #1E293B',
  backgroundColor: '#1A2332'
}));

const Chat = ({ socket, sessionId, participants, currentUser, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      const handleChatMessage = (message) => {
        setMessages(prev => [...prev, message]);
      };

      socket.on('chat-message', handleChatMessage);

      return () => {
        socket.off('chat-message', handleChatMessage);
      };
    }
  }, [socket]);

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      const message = {
        text: newMessage.trim(),
        sender: currentUser?.name || 'You',
        senderId: currentUser?.id || socket.id,
        timestamp: new Date().toISOString()
      };

      socket.emit('chat-message', message);
      setMessages(prev => [...prev, { ...message, isOwn: true }]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <ChatContainer>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" sx={{ color: '#E2E8F0' }}>
          Chat ({participants.length} participants)
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#94A3B8' }}>
          <Close />
        </IconButton>
      </Box>

      {/* Participants List */}
      <Box sx={{ p: 2, borderBottom: '1px solid #1E293B' }}>
        <Typography variant="subtitle2" sx={{ color: '#94A3B8', mb: 1 }}>
          Participants:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {participants.map((participant) => (
            <Chip
              key={participant.id}
              label={participant.name || 'Anonymous'}
              size="small"
              sx={{
                bgcolor: '#0F766E',
                color: '#E2E8F0',
                '& .MuiChip-avatar': {
                  bgcolor: '#14B8A6'
                }
              }}
              avatar={
                <Avatar sx={{ bgcolor: '#14B8A6', width: 20, height: 20 }}>
                  {(participant.name || 'A').charAt(0).toUpperCase()}
                </Avatar>
              }
            />
          ))}
        </Box>
      </Box>

      {/* Messages */}
      <MessagesContainer>
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#94A3B8'
            }}
          >
            <Typography variant="body2">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.isOwn ? 'flex-end' : 'flex-start',
                mb: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{ color: '#94A3B8', mr: 1 }}
                >
                  {message.sender}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#64748B' }}
                >
                  {formatTime(message.timestamp)}
                </Typography>
              </Box>
              <MessageBubble isOwn={message.isOwn}>
                <Typography variant="body2">
                  {message.text}
                </Typography>
              </MessageBubble>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* Input */}
      <InputContainer>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#E2E8F0',
                '& fieldset': { borderColor: '#1E293B' },
                '&:hover fieldset': { borderColor: '#14B8A6' },
                '&.Mui-focused fieldset': { borderColor: '#14B8A6' }
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#94A3B8'
              }
            }}
          />
          <IconButton
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            sx={{
              color: '#14B8A6',
              '&:disabled': { color: '#475569' },
              alignSelf: 'flex-end'
            }}
          >
            <Send />
          </IconButton>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: '#64748B', mt: 1, display: 'block' }}
        >
          Press Enter to send, Shift+Enter for new line
        </Typography>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;