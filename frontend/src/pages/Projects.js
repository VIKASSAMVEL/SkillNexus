import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Tabs,
  Tab,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Paper,
  Fade,
  Slide,
  Zoom,
  Grow,
  Collapse,
  Avatar
} from '@mui/material';
import {
  Add,
  FilterList,
  GroupWork,
  TrendingUp,
  Star
} from '@mui/icons-material';
import ProjectCard from '../components/ProjectCard';
import CreateProjectDialog from '../components/CreateProjectDialog';
import Footer from '../components/Footer';
import api from '../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    project_type: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [tabTransition, setTabTransition] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [activeTab, filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setTabTransition(false);

      setTimeout(() => setTabTransition(true), 150);

      const params = { ...filters };

      // Get user data from localStorage
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : null;

      if (activeTab === 'my-projects' && userId) {
        params.participant_id = userId;
      } else if (activeTab === 'created' && userId) {
        params.creator_id = userId;
      }

      const response = await api.get('/projects', { params });
      setProjects(response.data.projects || []);
    } catch (error) {
      setError('Failed to load projects');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setCreateDialogOpen(true);
  };

  const handleProjectCreated = () => {
    setCreateDialogOpen(false);
    fetchProjects();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', project_type: '', status: '' });
  };

  const getTabLabel = (tab) => {
    switch (tab) {
      case 'all': return 'All Projects';
      case 'my-projects': return 'My Projects';
      case 'created': return 'Created by Me';
      default: return tab;
    }
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'all': return <GroupWork />;
      case 'my-projects': return <Star />;
      case 'created': return <TrendingUp />;
      default: return <GroupWork />;
    }
  };

  const getStatsData = () => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    const userId = userData ? JSON.parse(userData).id : null;

    // Filter stats based on active tab
    let filteredProjects = projects;
    
    if (activeTab === 'my-projects' && userId) {
      filteredProjects = projects.filter(p => 
        p.participants?.some(part => part.id === userId)
      );
    } else if (activeTab === 'created' && userId) {
      filteredProjects = projects.filter(p => 
        p.creator_id === userId
      );
    }
    
    const total = filteredProjects.length;
    const active = filteredProjects.filter(p => p.status === 'active').length;
    const completed = filteredProjects.filter(p => p.status === 'completed').length;
    return { total, active, completed };
  };

  const stats = getStatsData();

  if (loading && projects.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
          sx={{
            background: 'radial-gradient(circle at top right, rgba(20, 184, 166, 0.1), rgba(15, 23, 42, 0.5))',
            bgcolor: '#0F172A',
            borderRadius: 4,
            p: 4,
            border: '1px solid #1E293B'
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: '#14B8A6',
              mb: 3,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
          <Typography variant="h6" sx={{ color: '#94A3B8', fontWeight: 500 }}>
            Loading amazing projects...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0F766E 0%, #0D5656 50%, #14B8A6 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                background: 'linear-gradient(45deg, #ffffff 30%, rgba(255,255,255,0.9) 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Community Projects
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                mb: 4,
                opacity: 0.95,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.6,
                color: '#E2E8F0'
              }}
            >
              Join collaborative initiatives that make a difference in your community.
              From skill-sharing workshops to impactful community service projects.
            </Typography>

            {/* Stats Cards */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Grid container spacing={3} sx={{ maxWidth: 800, justifyContent: 'center' }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'rgba(20, 184, 166, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(20, 184, 166, 0.3)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          bgcolor: 'rgba(20, 184, 166, 0.25)'
                        }
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#E2E8F0' }}>
                        {stats.total}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, color: '#CBD5E1' }}>
                        Total Projects
                      </Typography>
                    </Paper>
                  </Zoom>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Zoom in={true} style={{ transitionDelay: '400ms' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'rgba(20, 184, 166, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(20, 184, 166, 0.3)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          bgcolor: 'rgba(20, 184, 166, 0.25)'
                        }
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#E2E8F0' }}>
                        {stats.active}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, color: '#CBD5E1' }}>
                        Active Now
                      </Typography>
                    </Paper>
                  </Zoom>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Zoom in={true} style={{ transitionDelay: '600ms' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'rgba(20, 184, 166, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(20, 184, 166, 0.3)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          bgcolor: 'rgba(20, 184, 166, 0.25)'
                        }
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#E2E8F0' }}>
                        {stats.completed}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, color: '#CBD5E1' }}>
                        Completed
                      </Typography>
                    </Paper>
                  </Zoom>
                </Grid>
              </Grid>
            </Box>

            <Slide direction="up" in={true} timeout={800}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={handleCreateProject}
                sx={{
                  bgcolor: '#14B8A6',
                  color: '#0F172A',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(20, 184, 166, 0.3)',
                  '&:hover': {
                    bgcolor: '#0F766E',
                    color: '#E2E8F0',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 12px 40px rgba(20, 184, 166, 0.4)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Start a New Project
              </Button>
            </Slide>
          </Box>
        </Container>

        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            right: '8%',
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'rgba(20, 184, 166, 0.15)',
            animation: 'float 8s ease-in-out infinite'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '25%',
            left: '6%',
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: 'rgba(20, 184, 166, 0.15)',
            animation: 'float 6s ease-in-out infinite reverse'
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {error && (
          <Fade in={true}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)',
                bgcolor: '#dc2626',
                color: '#E2E8F0',
                '& .MuiAlert-icon': { color: '#E2E8F0' }
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Navigation Tabs */}
        <Fade in={true} timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              borderRadius: 3,
              border: '1px solid',
              borderColor: '#1E293B',
              overflow: 'hidden',
              bgcolor: '#1A2332'
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  py: 2,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: '#94A3B8',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#0F766E',
                    color: '#14B8A6',
                    transform: 'translateY(-1px)'
                  },
                  '&.Mui-selected': {
                    bgcolor: '#0F766E',
                    color: '#14B8A6',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)'
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  bgcolor: '#14B8A6'
                }
              }}
            >
              <Tab
                icon={getTabIcon('all')}
                label="All Projects"
                value="all"
                iconPosition="start"
              />
              <Tab
                icon={getTabIcon('my-projects')}
                label="My Projects"
                value="my-projects"
                iconPosition="start"
              />
              <Tab
                icon={getTabIcon('created')}
                label="Created by Me"
                value="created"
                iconPosition="start"
              />
            </Tabs>
          </Paper>
        </Fade>

        {/* Filters Section */}
        <Box mb={4}>
          <Button
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            sx={{
              mb: 2,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              color: '#14B8A6',
              borderColor: '#1E293B',
              bgcolor: '#1A2332',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#14B8A6',
                bgcolor: '#0F766E',
                color: '#E2E8F0',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)'
              }
            }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>

          <Collapse in={showFilters} timeout={400}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: '#1E293B',
                bgcolor: '#1A2332'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#14B8A6' }}>
                Filter Projects
              </Typography>
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>Category</InputLabel>
                    <Select
                      value={filters.category}
                      label="Category"
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      sx={{
                        borderRadius: 2,
                        color: '#E2E8F0',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: 2,
                          borderColor: '#1E293B'
                        },
                        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#14B8A6'
                        },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#14B8A6'
                        },
                        '& .MuiSvgIcon-root': { color: '#14B8A6' }
                      }}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      <MenuItem value="Technology">Technology</MenuItem>
                      <MenuItem value="Community Service">Community Service</MenuItem>
                      <MenuItem value="Education">Education</MenuItem>
                      <MenuItem value="Arts & Crafts">Arts & Crafts</MenuItem>
                      <MenuItem value="Sports & Fitness">Sports & Fitness</MenuItem>
                      <MenuItem value="Music">Music</MenuItem>
                      <MenuItem value="Cooking">Cooking</MenuItem>
                      <MenuItem value="Business">Business</MenuItem>
                      <MenuItem value="Health & Wellness">Health & Wellness</MenuItem>
                      <MenuItem value="Home & Garden">Home & Garden</MenuItem>
                      <MenuItem value="Environmental">Environmental</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>Project Type</InputLabel>
                    <Select
                      value={filters.project_type}
                      label="Project Type"
                      onChange={(e) => handleFilterChange('project_type', e.target.value)}
                      sx={{
                        borderRadius: 2,
                        color: '#E2E8F0',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: 2,
                          borderColor: '#1E293B'
                        },
                        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#14B8A6'
                        },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#14B8A6'
                        },
                        '& .MuiSvgIcon-root': { color: '#14B8A6' }
                      }}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="skill_sharing">Skill Sharing</MenuItem>
                      <MenuItem value="community_service">Community Service</MenuItem>
                      <MenuItem value="educational">Educational</MenuItem>
                      <MenuItem value="creative">Creative Project</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: '#94A3B8', '&.Mui-focused': { color: '#14B8A6' } }}>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      sx={{
                        borderRadius: 2,
                        color: '#E2E8F0',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: 2,
                          borderColor: '#1E293B'
                        },
                        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#14B8A6'
                        },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#14B8A6'
                        },
                        '& .MuiSvgIcon-root': { color: '#14B8A6' }
                      }}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="planning">Planning</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    fullWidth
                    sx={{
                      py: 1,
                      borderRadius: 2,
                      fontWeight: 600,
                      color: '#14B8A6',
                      borderColor: '#1E293B',
                      bgcolor: '#1A2332',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#14B8A6',
                        bgcolor: '#0F766E',
                        color: '#E2E8F0',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)'
                      }
                    }}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>
        </Box>

        {/* Projects Grid */}
        <Fade in={tabTransition} timeout={600}>
          <Box>
            {projects.length === 0 ? (
              <Grow in={true} timeout={800}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    borderRadius: 4,
                    border: '2px dashed',
                    borderColor: '#1E293B',
                    bgcolor: '#1A2332'
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3,
                      bgcolor: '#0F766E',
                      boxShadow: '0 8px 24px rgba(20, 184, 166, 0.3)'
                    }}
                  >
                    <GroupWork sx={{ fontSize: 40, color: '#14B8A6' }} />
                  </Avatar>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#E2E8F0' }}>
                    {activeTab === 'all' ? 'No projects found' : `No ${getTabLabel(activeTab).toLowerCase()} found`}
                  </Typography>
                  <Typography variant="body1" color="#94A3B8" mb={4} sx={{ maxWidth: 400, mx: 'auto' }}>
                    {activeTab === 'all'
                      ? 'Be the first to create a community project and inspire others to join!'
                      : 'Start by creating your own project or joining existing community initiatives.'
                    }
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    onClick={handleCreateProject}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      bgcolor: '#0F766E',
                      color: '#E2E8F0',
                      boxShadow: '0 4px 16px rgba(20, 184, 166, 0.3)',
                      '&:hover': {
                        bgcolor: '#14B8A6',
                        color: '#0F172A',
                        transform: 'translateY(-2px) scale(1.02)',
                        boxShadow: '0 8px 24px rgba(20, 184, 166, 0.4)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Create Your First Project
                  </Button>
                </Paper>
              </Grow>
            ) : (
              <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
                {projects.map((project, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id} sx={{ display: 'flex' }}>
                    <Grow
                      in={tabTransition}
                      timeout={600 + index * 100}
                      style={{ transformOrigin: '0 0 0', width: '100%' }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <ProjectCard project={project} onUpdate={fetchProjects} />
                      </Box>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Fade>

        {/* Create Project Dialog */}
        <CreateProjectDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      </Container>

      <Footer />

    </Box>
  );
};

export default Projects;