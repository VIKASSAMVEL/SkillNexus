import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  AttachFile,
  Close,
  Download,
  Delete,
  InsertDriveFile,
  Image,
  VideoFile,
  AudioFile,
  Description,
  FolderZip,
  Upload
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const DropZone = styled(Box)(({ theme, isDragOver }) => ({
  border: `2px dashed ${isDragOver ? '#14B8A6' : '#1E293B'}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragOver ? 'rgba(20, 184, 166, 0.1)' : '#1A2332',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(20, 184, 166, 0.05)'
  }
}));

const FileItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  backgroundColor: '#0F172A',
  border: '1px solid #1E293B',
  '&:hover': {
    backgroundColor: '#1A2332',
    borderColor: '#14B8A6'
  }
}));

const FileSharing = ({ socket, sessionId, isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // File type icons
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image />;
    if (fileType.startsWith('video/')) return <VideoFile />;
    if (fileType.startsWith('audio/')) return <AudioFile />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <Description />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <FolderZip />;
    return <InsertDriveFile />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = async (fileList) => {
    const maxFileSize = 50 * 1024 * 1024; // 50MB limit
    const allowedTypes = [
      'image/*',
      'video/*',
      'audio/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/*',
      'application/zip',
      'application/x-rar-compressed'
    ];

    const validFiles = fileList.filter(file => {
      if (file.size > maxFileSize) {
        setError(`File "${file.name}" is too large. Maximum size is 50MB.`);
        return false;
      }

      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        setError(`File type "${file.type}" is not allowed.`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setError('');
      await uploadFiles(validFiles);
    }
  };

  const uploadFiles = async (fileList) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sessionId', sessionId);

        // Simulate upload progress (in real implementation, use XMLHttpRequest for progress)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 100);

        // Upload file to server
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/sessions/${sessionId}/files`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        clearInterval(progressInterval);

        if (response.ok) {
          const fileData = await response.json();

          // Add file to local state
          const newFile = {
            id: fileData.file.id,
            name: file.name,
            size: file.size,
            type: file.type,
            url: fileData.file.url,
            uploadedBy: 'You',
            uploadedAt: new Date().toISOString()
          };

          setFiles(prev => [...prev, newFile]);

          // Notify other participants via socket
          if (socket) {
            socket.emit('file-shared', {
              sessionId,
              file: newFile
            });
          }
        } else {
          throw new Error('Upload failed');
        }

        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadFile = async (file) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download file.');
    }
  };

  const deleteFile = async (fileId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/sessions/${sessionId}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId));

        // Notify other participants
        if (socket) {
          socket.emit('file-deleted', {
            sessionId,
            fileId
          });
        }
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete file.');
    }
  };

  // Listen for file sharing events from other participants
  React.useEffect(() => {
    if (socket) {
      const handleFileShared = (data) => {
        if (data.file) {
          setFiles(prev => [...prev, data.file]);
        }
      };

      const handleFileDeleted = (data) => {
        setFiles(prev => prev.filter(f => f.id !== data.fileId));
      };

      socket.on('file-shared', handleFileShared);
      socket.on('file-deleted', handleFileDeleted);

      return () => {
        socket.off('file-shared', handleFileShared);
        socket.off('file-deleted', handleFileDeleted);
      };
    }
  }, [socket]);

  if (!isOpen) return null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
          File Sharing
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#94A3B8' }}>
          <Close />
        </IconButton>
      </Box>

      {/* Upload Zone */}
      <Box sx={{ p: 2 }}>
        <DropZone
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload sx={{ fontSize: 48, color: '#14B8A6', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#E2E8F0', mb: 1 }}>
            Drop files here or click to browse
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            Support for images, videos, documents, and archives (max 50MB each)
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
          />
        </DropZone>

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
              Uploading... {uploadProgress}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                bgcolor: '#1E293B',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#14B8A6'
                }
              }}
            />
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{
              mt: 2,
              bgcolor: '#7F1D1D',
              color: '#FCA5A5',
              '& .MuiAlert-icon': { color: '#FCA5A5' }
            }}
          >
            {error}
          </Alert>
        )}
      </Box>

      {/* Files List */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {files.length === 0 ? (
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
            <AttachFile sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body2">
              No files shared yet. Drag and drop files above to get started.
            </Typography>
          </Box>
        ) : (
          <List>
            {files.map((file) => (
              <FileItem key={file.id}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#0F766E' }}>
                    {getFileIcon(file.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
                      {file.name}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        {formatFileSize(file.size)} • Uploaded by {file.uploadedBy}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                        {new Date(file.uploadedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Download">
                    <IconButton
                      onClick={() => downloadFile(file)}
                      sx={{ color: '#14B8A6' }}
                    >
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => deleteFile(file.id)}
                      sx={{ color: '#EF4444' }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </FileItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default FileSharing;