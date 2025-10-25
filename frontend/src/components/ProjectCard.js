import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  Paper,
  Fade,
  Zoom,
  Grow,
  LinearProgress,
  Grid
} from '@mui/material';
import {
  LocationOn,
  Event,
  Group,
  Person,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  ArrowForward,
  CalendarToday,
  People as PeopleIcon,
  Star,
  TrendingUp
} from '@mui/icons-material';
import { formatCurrency } from '../utils/formatters';
import api from '../services/api';

const ProjectCard = ({ project, onUpdate }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState('');
  const [hovered, setHovered] = useState(false);

  // Get user data from localStorage
  const userData = localStorage.getItem('user');
  const currentUserId = userData ? JSON.parse(userData).id : null;
  const isCreator = project.creator_id === currentUserId;
  const isParticipant = project.participants?.some(p => p.id === currentUserId);
  const canJoin = !isCreator && !isParticipant && project.status !== 'completed' && project.status !== 'cancelled';
  const canLeave = isParticipant && !isCreator;

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'info';
      case 'active': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getProjectTypeLabel = (type) => {
    switch (type) {
      case 'skill_sharing': return 'Skill Sharing';
      case 'community_service': return 'Community Service';
      case 'educational': return 'Educational';
      case 'creative': return 'Creative Project';
      default: return type;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'planning': return <CalendarToday />;
      case 'active': return <TrendingUp />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <CalendarToday />;
    }
  };

  const getProjectTypeColor = (type) => {
    switch (type) {
      case 'skill_sharing': return 'primary';
      case 'community_service': return 'success';
      case 'educational': return 'warning';
      case 'creative': return 'secondary';
      default: return 'default';
    }
  };

  const getProgressValue = () => {
    if (!project.max_participants) return 0;
    return (project.current_participants / project.max_participants) * 100;
  };

  const handleJoinProject = async () => {
    try {
      setJoining(true);
      setError('');
      await api.post(`/projects/${project.id}/join`);
      setDetailsOpen(false);
      onUpdate();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to join project');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveProject = async () => {
    try {
      setLeaving(true);
      setError('');
      await api.post(`/projects/${project.id}/leave`);
      setDetailsOpen(false);
      onUpdate();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to leave project');
    } finally {
      setLeaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Card
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: 3,
          border: '1px solid',
          borderColor: '#1E293B',
          bgcolor: '#1A2332',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(20, 184, 166, 0.15)',
            borderColor: '#14B8A6'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${
              project.status === 'active' ? '#10B981' :
              project.status === 'planning' ? '#14B8A6' :
              project.status === 'completed' ? '#64748B' : '#EF4444'
            }, ${
              project.status === 'active' ? '#34D399' :
              project.status === 'planning' ? '#2DD4BF' :
              project.status === 'completed' ? '#94A3B8' : '#F87171'
            })`
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setDetailsOpen(true)}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                flexGrow: 1,
                mr: 1,
                fontWeight: 600,
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                color: '#E2E8F0'
              }}
            >
              {project.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {getStatusIcon(project.status)}
              <Chip
                label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  transition: 'all 0.3s ease',
                  bgcolor: project.status === 'active' ? '#10B981' :
                           project.status === 'planning' ? '#14B8A6' :
                           project.status === 'completed' ? '#64748B' : '#EF4444',
                  color: '#0F172A',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />
            </Box>
          </Box>

          <Typography
            variant="body2"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5,
              color: '#CBD5E1',
              mb: 3
            }}
          >
            {project.description}
          </Typography>

          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 1.5,
                bgcolor: '#0F766E',
                color: '#14B8A6',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {project.creator_name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#E2E8F0' }}>
                {project.creator_name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                Project Creator
              </Typography>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap={1.5} mb={3}>
            {project.location && (
              <Box display="flex" alignItems="center">
                <LocationOn sx={{ mr: 1, fontSize: 18, color: '#14B8A6' }} />
                <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                  {project.location}
                </Typography>
              </Box>
            )}

            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <PeopleIcon sx={{ mr: 1, fontSize: 18, color: '#14B8A6' }} />
                <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                  {project.current_participants || 0}
                  {project.max_participants && `/${project.max_participants}`} participants
                </Typography>
              </Box>
              {project.max_participants && (
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  {Math.round(getProgressValue())}% full
                </Typography>
              )}
            </Box>

            {project.max_participants && (
              <LinearProgress
                variant="determinate"
                value={getProgressValue()}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#0F766E',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${
                      getProgressValue() > 80 ? '#EF4444' :
                      getProgressValue() > 60 ? '#F59E0B' : '#10B981'
                    }, ${
                      getProgressValue() > 80 ? '#F87171' :
                      getProgressValue() > 60 ? '#FBBF24' : '#34D399'
                    })`
                  }
                }}
              />
            )}
          </Box>

          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            <Chip
              label={project.category}
              size="small"
              sx={{
                fontWeight: 500,
                bgcolor: '#0F766E',
                color: '#14B8A6',
                border: '1px solid #14B8A6',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)'
                }
              }}
            />
            <Chip
              label={getProjectTypeLabel(project.project_type)}
              size="small"
              sx={{
                fontWeight: 500,
                bgcolor: project.project_type === 'community_service' ? '#10B981' :
                         project.project_type === 'educational' ? '#F59E0B' :
                         project.project_type === 'creative' ? '#8B5CF6' : '#14B8A6',
                color: '#0F172A',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)'
                }
              }}
            />
          </Box>

          {(project.start_date || project.end_date) && (
            <Box display="flex" alignItems="center" mt={2}>
              <Event sx={{ mr: 1, fontSize: 16, color: '#14B8A6' }} />
              <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                {project.start_date && formatDate(project.start_date)}
                {project.start_date && project.end_date && ' - '}
                {project.end_date && formatDate(project.end_date)}
              </Typography>
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
          <Button
            size="small"
            endIcon={<ArrowForward />}
            sx={{
              fontWeight: 600,
              color: '#14B8A6',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateX(4px)',
                color: '#2DD4BF'
              }
            }}
          >
            View Details
          </Button>

          <Box display="flex" gap={1}>
            {canJoin && (
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinProject();
                }}
                disabled={joining}
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  bgcolor: '#0F766E',
                  color: '#E2E8F0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    bgcolor: '#14B8A6',
                    color: '#0F172A',
                    boxShadow: '0 6px 20px rgba(20, 184, 166, 0.3)'
                  }
                }}
              >
                {joining ? 'Joining...' : 'Join'}
              </Button>
            )}
            {canLeave && (
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLeaveProject();
                }}
                disabled={leaving}
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  color: '#EF4444',
                  borderColor: '#EF4444',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    borderColor: '#F87171',
                    color: '#F87171',
                    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)'
                  }
                }}
              >
                {leaving ? 'Leaving...' : 'Leave'}
              </Button>
            )}
          </Box>
        </CardActions>
      </Card>

      {/* Project Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        transitionDuration={400}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 32px 64px rgba(0,0,0,0.2)',
            bgcolor: '#0F172A',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, bgcolor: '#0F172A' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: '#E2E8F0' }}>
              {project.title}
            </Typography>
            <Box display="flex" gap={1}>
              {getStatusIcon(project.status)}
              <Chip
                label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                sx={{
                  fontWeight: 600,
                  bgcolor: project.status === 'active' ? '#10B981' :
                           project.status === 'planning' ? '#14B8A6' :
                           project.status === 'completed' ? '#64748B' : '#EF4444',
                  color: '#0F172A'
                }}
              />
            </Box>
          </Box>
          <Box display="flex" gap={1} mt={2} flexWrap="wrap">
            <Chip
              label={project.category}
              size="small"
              sx={{
                fontWeight: 500,
                bgcolor: '#0F766E',
                color: '#14B8A6',
                border: '1px solid #14B8A6'
              }}
            />
            <Chip
              label={getProjectTypeLabel(project.project_type)}
              size="small"
              sx={{
                fontWeight: 500,
                bgcolor: project.project_type === 'community_service' ? '#10B981' :
                         project.project_type === 'educational' ? '#F59E0B' :
                         project.project_type === 'creative' ? '#8B5CF6' : '#14B8A6',
                color: '#0F172A'
              }}
            />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, bgcolor: '#0F172A' }}>
          {error && (
            <Fade in={true}>
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)',
                  bgcolor: '#7F1D1D',
                  color: '#FCA5A5',
                  border: '1px solid #DC2626'
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#14B8A6' }}>
            Description
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, mb: 4, color: '#CBD5E1' }}>
            {project.description}
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: '#1E293B',
                  bgcolor: '#1A2332'
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#14B8A6' }}>
                  Project Details
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center">
                    <Person sx={{ mr: 2, color: '#14B8A6' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>Created by</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#E2E8F0' }}>{project.creator_name}</Typography>
                    </Box>
                  </Box>

                  {project.location && (
                    <Box display="flex" alignItems="center">
                      <LocationOn sx={{ mr: 2, color: '#14B8A6' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>Location</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#E2E8F0' }}>{project.location}</Typography>
                      </Box>
                    </Box>
                  )}

                  <Box display="flex" alignItems="center">
                    <Group sx={{ mr: 2, color: '#14B8A6' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>Participants</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#E2E8F0' }}>
                        {project.current_participants || 0}
                        {project.max_participants && `/${project.max_participants}`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: '#1E293B',
                  bgcolor: '#1A2332'
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#14B8A6' }}>
                  Timeline
                </Typography>
                {(project.start_date || project.end_date) ? (
                  <Box display="flex" flexDirection="column" gap={2}>
                    {project.start_date && (
                      <Box display="flex" alignItems="center">
                        <CalendarToday sx={{ mr: 2, color: '#14B8A6' }} />
                        <Box>
                          <Typography variant="body2" sx={{ color: '#94A3B8' }}>Start Date</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#E2E8F0' }}>{formatDate(project.start_date)}</Typography>
                        </Box>
                      </Box>
                    )}

                    {project.end_date && (
                      <Box display="flex" alignItems="center">
                        <CheckCircle sx={{ mr: 2, color: '#10B981' }} />
                        <Box>
                          <Typography variant="body2" sx={{ color: '#94A3B8' }}>End Date</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#E2E8F0' }}>{formatDate(project.end_date)}</Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    No specific timeline set for this project.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {project.participants && project.participants.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: '#1E293B',
                bgcolor: '#1A2332'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', color: '#E2E8F0' }}>
                <PeopleIcon sx={{ mr: 1, color: '#14B8A6' }} />
                Participants ({project.participants.length})
              </Typography>
              <List sx={{ py: 0 }}>
                {project.participants.map((participant, index) => (
                  <React.Fragment key={participant.id}>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: participant.role === 'creator' ? '#0F766E' : '#0F766E',
                            color: '#14B8A6',
                            fontWeight: 600
                          }}
                        >
                          {participant.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#E2E8F0' }}>
                              {participant.name}
                            </Typography>
                            {participant.role === 'creator' && (
                              <Chip
                                label="Creator"
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 20,
                                  bgcolor: '#0F766E',
                                  color: '#14B8A6',
                                  border: '1px solid #14B8A6'
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                            Joined {new Date(participant.joined_at).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < project.participants.length - 1 && <Divider sx={{ mx: 0, borderColor: '#1E293B' }} />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, gap: 1, bgcolor: '#0F172A' }}>
          <Button
            onClick={() => setDetailsOpen(false)}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              px: 3,
              color: '#14B8A6',
              '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.1)' }
            }}
          >
            Close
          </Button>
          {canJoin && (
            <Button
              variant="contained"
              onClick={handleJoinProject}
              disabled={joining}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                bgcolor: '#0F766E',
                color: '#E2E8F0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  bgcolor: '#14B8A6',
                  color: '#0F172A',
                  boxShadow: '0 6px 20px rgba(20, 184, 166, 0.3)'
                }
              }}
            >
              {joining ? 'Joining...' : 'Join Project'}
            </Button>
          )}
          {canLeave && (
            <Button
              variant="outlined"
              onClick={handleLeaveProject}
              disabled={leaving}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                color: '#EF4444',
                borderColor: '#EF4444',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  borderColor: '#F87171',
                  color: '#F87171',
                  boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)'
                }
              }}
            >
              {leaving ? 'Leaving...' : 'Leave Project'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectCard;