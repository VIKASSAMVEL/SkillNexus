import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Button,
  TextField,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  Chat,
  Brush,
  AttachFile,
  CallEnd,
  MoreVert,
  People,
  Settings,
  Fullscreen,
  FullscreenExit,
  VolumeUp,
  VolumeOff,
  Send,
  Close,
  Download,
  Share,
  GroupAdd,
  ExitToApp
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../services/api';
import Whiteboard from '../components/Whiteboard';
import SessionChat from '../components/Chat';
import FileSharing from '../components/FileSharing';

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: 0,
  minHeight: '100vh',
  backgroundColor: '#0F172A',
  color: '#E2E8F0',
  display: 'flex',
  flexDirection: 'column'
}));

const VideoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundColor: '#1A2332',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  minHeight: 300,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const VideoElement = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 8
});

const ControlBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1, 2),
  backdropFilter: 'blur(10px)'
}));

const ChatDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 350,
    backgroundColor: '#1A2332',
    borderLeft: '1px solid #1E293B',
    color: '#E2E8F0'
  }
}));

const WhiteboardDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 400,
    backgroundColor: '#1A2332',
    borderLeft: '1px solid #1E293B',
    color: '#E2E8F0'
  }
}));

const FileSharingDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 350,
    backgroundColor: '#1A2332',
    borderLeft: '1px solid #1E293B',
    color: '#E2E8F0'
  }
}));

const SessionRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // State management
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isFileSharingOpen, setIsFileSharingOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  // Media state
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);

  // WebRTC and Socket.io
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [peerConnections, setPeerConnections] = useState(new Map());
  const [pendingOffers, setPendingOffers] = useState([]);

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());
  const socketRef = useRef(null);

  // WebRTC configuration
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    initializeSession();
    return () => {
      cleanup();
    };
  }, [sessionId]);

  const createPeerConnection = async (userId) => {
    const pc = new RTCPeerConnection(rtcConfiguration);

    // Add local stream tracks if available
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, event.streams[0]);
        return newMap;
      });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          sessionId,
          from: socketRef.current.id,
          to: userId,
          candidate: event.candidate
        });
      }
    };

    setPeerConnections(prev => new Map(prev).set(userId, pc));

    return pc;
  };

  const addLocalTracksToPeer = (pc, stream) => {
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
  };

  const addLocalStreamToPeers = () => {
    if (localStream) {
      peerConnections.forEach((pc, userId) => {
        // Check if tracks are already added
        const hasVideo = pc.getSenders().some(sender => sender.track?.kind === 'video');
        const hasAudio = pc.getSenders().some(sender => sender.track?.kind === 'audio');
        
        if (!hasVideo || !hasAudio) {
          addLocalTracksToPeer(pc, localStream);
          
          // If connection is established, renegotiate
          if (pc.signalingState === 'stable' && pc.remoteDescription) {
            renegotiate(pc, userId);
          }
        }
      });
    }
  };

  const sendPendingOffers = async () => {
    for (const userId of pendingOffers) {
      const pc = await createPeerConnection(userId);

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current.emit('offer', {
        sessionId,
        from: socketRef.current.id,
        to: userId,
        offer: offer
      });
    }
    setPendingOffers([]);
  };

  const renegotiate = async (pc, userId) => {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current.emit('offer', {
        sessionId,
        from: socketRef.current.id,
        to: userId,
        offer: offer
      });
    } catch (error) {
      console.error('Error renegotiating:', error);
    }
  };

  const initializeSession = async () => {
    try {
      setLoading(true);

      // Fetch session details
      const sessionResponse = await api.get(`/sessions/${sessionId}`);
      setSession(sessionResponse.data.session);

      // Initialize Socket.io connection
      const socketConnection = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      socketRef.current = socketConnection;
      setSocket(socketConnection);

      socketConnection.on('connect', () => {
        console.log('Connected to session room');
        socketConnection.emit('join-session', { sessionId });
      });

      // Socket event handlers
      socketConnection.on('user-joined', handleUserJoined);
      socketConnection.on('user-left', handleUserLeft);
      socketConnection.on('offer', handleOffer);
      socketConnection.on('answer', handleAnswer);
      socketConnection.on('ice-candidate', handleIceCandidate);
      socketConnection.on('file-shared', handleFileShared);

      // Initialize media devices
      await initializeMedia();

    } catch (error) {
      setError('Failed to join session');
      console.error('Error initializing session:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMedia = async () => {
    try {
      // Try to get both video and audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setLocalStream(stream);
      setIsVideoOn(true);
      setIsMicOn(true);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add tracks to existing peer connections
      addLocalStreamToPeers();

      // Send offers to pending users
      sendPendingOffers();

    } catch (error) {
      console.error('Error accessing video and audio devices:', error);
      
      // Try audio-only if video fails
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        });
        
        setLocalStream(audioStream);
        setIsVideoOn(false);
        setIsMicOn(true);
        console.warn('Video not available, using audio only');

        // Add tracks to existing peer connections
        addLocalStreamToPeers();

        // Send offers to pending users
        sendPendingOffers();

      } catch (audioError) {
        console.error('Error accessing audio devices:', audioError);
        setError('Failed to access camera and microphone. Please check permissions and ensure no other application is using them.');
      }
    }
  };

  const handleUserJoined = useCallback(async (data) => {
    console.log('User joined:', data);
    setParticipants(prev => [...prev, { id: data.userId }]);

    if (localStream) {
      // Create peer connection and send offer
      const pc = await createPeerConnection(data.userId);

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current.emit('offer', {
        sessionId,
        from: socketRef.current.id,
        to: data.userId,
        offer: offer
      });
    } else {
      // Add to pending offers
      setPendingOffers(prev => [...prev, data.userId]);
    }
  }, [sessionId, localStream]);

  const handleUserLeft = useCallback((data) => {
    console.log('User left:', data);
    setParticipants(prev => prev.filter(p => p.id !== data.userId));

    // Clean up peer connection
    const pc = peerConnections.get(data.userId);
    if (pc) {
      pc.close();
      setPeerConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });
    }

    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(data.userId);
      return newMap;
    });
  }, [peerConnections]);

  const handleOffer = useCallback(async (data) => {
    const pc = await createPeerConnection(data.from);
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socketRef.current.emit('answer', {
      sessionId,
      from: socketRef.current.id,
      to: data.from,
      answer: answer
    });
  }, [sessionId]);

  const handleAnswer = useCallback(async (data) => {
    const pc = peerConnections.get(data.from);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  }, [peerConnections]);

  const handleIceCandidate = useCallback(async (data) => {
    const pc = peerConnections.get(data.from);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }, [peerConnections]);

  const handleFileShared = useCallback((data) => {
    // Handle file sharing
    console.log('File shared:', data);
  }, []);

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        const screenTrack = localStream.getVideoTracks().find(track => track.label.includes('screen'));
        if (screenTrack) {
          screenTrack.stop();
          setIsScreenSharing(false);
        }
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrack.onended = () => setIsScreenSharing(false);

        // Replace video track
        const sender = peerConnections.values().next().value?.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }

        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const leaveSession = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-session', { sessionId });
      socketRef.current.disconnect();
    }
    cleanup();
    navigate('/sessions');
  };

  const cleanup = () => {
    // Clean up media streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Clean up peer connections
    peerConnections.forEach(pc => pc.close());

    // Clean up socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  if (loading) {
    return (
      <StyledContainer>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress
            size={60}
            sx={{ color: '#14B8A6', mb: 3 }}
          />
          <Typography variant="h6" sx={{ color: '#94A3B8' }}>
            Joining session...
          </Typography>
        </Box>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              bgcolor: '#dc2626',
              color: '#E2E8F0',
              '& .MuiAlert-icon': { color: '#E2E8F0' }
            }}
          >
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/sessions')}
            sx={{
              bgcolor: '#0F766E',
              '&:hover': { bgcolor: '#14B8A6' }
            }}
          >
            Back to Sessions
          </Button>
        </Box>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth={false}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#1A2332'
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ color: '#E2E8F0' }}>
            {session?.skill_name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            with {session?.provider_name}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Badge badgeContent={participants.length} color="primary">
            <IconButton
              sx={{ color: '#14B8A6' }}
              onClick={() => setIsChatOpen(true)}
            >
              <People />
            </IconButton>
          </Badge>

          <IconButton
            sx={{ color: '#14B8A6' }}
            onClick={handleMenuOpen}
          >
            <MoreVert />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                bgcolor: '#1A2332',
                border: '1px solid #1E293B',
                color: '#E2E8F0'
              }
            }}
          >
            <MenuItem onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              <Typography sx={{ ml: 1 }}>
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Typography>
            </MenuItem>
            <MenuItem onClick={() => setIsAudioOn(!isAudioOn)}>
              {isAudioOn ? <VolumeOff /> : <VolumeUp />}
              <Typography sx={{ ml: 1 }}>
                {isAudioOn ? 'Mute Audio' : 'Unmute Audio'}
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* Video Area */}
        <Box sx={{ flex: 1, p: 2 }}>
          <Grid container spacing={2}>
            {/* Local Video */}
            <Grid size={{ xs: 12, md: 6 }}>
              <VideoContainer>
                <VideoElement
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                />
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    color: '#E2E8F0'
                  }}
                >
                  You
                </Typography>
              </VideoContainer>
            </Grid>

            {/* Remote Videos */}
            {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
              <Grid size={{ xs: 12, md: 6 }} key={userId}>
                <VideoContainer>
                  <VideoElement
                    ref={(el) => {
                      if (el && el.srcObject !== stream) {
                        el.srcObject = stream;
                      }
                    }}
                    autoPlay
                    playsInline
                  />
                  <Typography
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      color: '#E2E8F0'
                    }}
                  >
                    Participant
                  </Typography>
                </VideoContainer>
              </Grid>
            ))}
          </Grid>

          {/* Control Bar */}
          <ControlBar>
            <Tooltip title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}>
              <IconButton
                onClick={toggleMic}
                sx={{
                  color: isMicOn ? '#14B8A6' : '#EF4444',
                  bgcolor: 'rgba(15, 23, 42, 0.8)',
                  '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.2)' }
                }}
              >
                {isMicOn ? <Mic /> : <MicOff />}
              </IconButton>
            </Tooltip>

            <Tooltip title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}>
              <IconButton
                onClick={toggleVideo}
                sx={{
                  color: isVideoOn ? '#14B8A6' : '#EF4444',
                  bgcolor: 'rgba(15, 23, 42, 0.8)',
                  '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.2)' }
                }}
              >
                {isVideoOn ? <Videocam /> : <VideocamOff />}
              </IconButton>
            </Tooltip>

            <Tooltip title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}>
              <IconButton
                onClick={toggleScreenShare}
                sx={{
                  color: isScreenSharing ? '#EF4444' : '#14B8A6',
                  bgcolor: 'rgba(15, 23, 42, 0.8)',
                  '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.2)' }
                }}
              >
                {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Open Chat">
              <IconButton
                onClick={() => setIsChatOpen(true)}
                sx={{
                  color: '#14B8A6',
                  bgcolor: 'rgba(15, 23, 42, 0.8)',
                  '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.2)' }
                }}
              >
                <Chat />
              </IconButton>
            </Tooltip>

            <Tooltip title="Open Whiteboard">
              <IconButton
                onClick={() => setIsWhiteboardOpen(true)}
                sx={{
                  color: '#14B8A6',
                  bgcolor: 'rgba(15, 23, 42, 0.8)',
                  '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.2)' }
                }}
              >
                <Brush />
              </IconButton>
            </Tooltip>

            <Tooltip title="File Sharing">
              <IconButton
                onClick={() => setIsFileSharingOpen(true)}
                sx={{
                  color: '#14B8A6',
                  bgcolor: 'rgba(15, 23, 42, 0.8)',
                  '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.2)' }
                }}
              >
                <AttachFile />
              </IconButton>
            </Tooltip>

            <Tooltip title="Leave Session">
              <IconButton
                onClick={leaveSession}
                sx={{
                  color: '#EF4444',
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                }}
              >
                <CallEnd />
              </IconButton>
            </Tooltip>
          </ControlBar>
        </Box>

        {/* Chat Drawer */}
        <ChatDrawer
          anchor="right"
          open={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        >
          <SessionChat
            socket={socket}
            sessionId={sessionId}
            participants={participants}
            currentUser={{ id: socketRef.current?.id, name: 'You' }}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        </ChatDrawer>

        {/* Whiteboard Drawer */}
        <WhiteboardDrawer
          anchor="right"
          open={isWhiteboardOpen}
          onClose={() => setIsWhiteboardOpen(false)}
        >
          <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ color: '#E2E8F0' }}>
                Whiteboard
              </Typography>
              <IconButton
                onClick={() => setIsWhiteboardOpen(false)}
                sx={{ color: '#94A3B8' }}
              >
                <Close />
              </IconButton>
            </Box>

            <Whiteboard
              socket={socket}
              sessionId={sessionId}
              isOpen={isWhiteboardOpen}
              onClose={() => setIsWhiteboardOpen(false)}
            />
          </Box>
        </WhiteboardDrawer>

        {/* File Sharing Drawer */}
        <FileSharingDrawer
          anchor="right"
          open={isFileSharingOpen}
          onClose={() => setIsFileSharingOpen(false)}
        >
          <FileSharing
            socket={socket}
            sessionId={sessionId}
            isOpen={isFileSharingOpen}
            onClose={() => setIsFileSharingOpen(false)}
          />
        </FileSharingDrawer>
      </Box>
    </StyledContainer>
  );
};

export default SessionRoom;