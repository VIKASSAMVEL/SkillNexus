import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Tabs,
  Tab,
  TextField,
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
  Avatar,
  Divider
} from '@mui/material';
import {
  Add,
  FilterList,
  Search,
  GroupWork,
  TrendingUp,
  Star,
  LocationOn,
  CalendarToday,
  People
} from '@mui/icons-material';
import ProjectCard from '../components/ProjectCard';
import CreateProjectDialog from '../components/CreateProjectDialog';
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

      if (activeTab === 'my-projects') {
        params.participant_id = localStorage.getItem('userId');
      } else if (activeTab === 'created') {
        params.creator_id = localStorage.getItem('userId');
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
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    return { total, active, completed };
  };

  const stats = getStatsData();

  if (loading && projects.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
          sx={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 4,
            p: 4
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: 'primary.main',
              mb: 3,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            Loading amazing projects...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                background: 'linear-gradient(45deg, #ffffff 30%, rgba(255,255,255,0.8) 90%)',
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
                opacity: 0.9,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Join collaborative initiatives that make a difference in your community.
              From skill-sharing workshops to impactful community service projects.
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
              <Grid item xs={12} sm={4}>
                <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        bgcolor: 'rgba(255,255,255,0.15)'
                      }
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Projects
                    </Typography>
                  </Paper>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Zoom in={true} style={{ transitionDelay: '400ms' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        bgcolor: 'rgba(255,255,255,0.15)'
                      }
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {stats.active}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Active Now
                    </Typography>
                  </Paper>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Zoom in={true} style={{ transitionDelay: '600ms' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        bgcolor: 'rgba(255,255,255,0.15)'
                      }
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {stats.completed}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Completed
                    </Typography>
                  </Paper>
                </Zoom>
              </Grid>
            </Grid>

            <Slide direction="up" in={true} timeout={800}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={handleCreateProject}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
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
            bgcolor: 'rgba(255,255,255,0.1)',
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
            bgcolor: 'rgba(255,255,255,0.1)',
            animation: 'float 6s ease-in-out infinite reverse'
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Fade in={true}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)'
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
              borderColor: 'divider',
              overflow: 'hidden'
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
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateY(-1px)'
                  },
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0'
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
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Filter Projects
              </Typography>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category}
                      label="Category"
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: 2
                        }
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

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Project Type</InputLabel>
                    <Select
                      value={filters.project_type}
                      label="Project Type"
                      onChange={(e) => handleFilterChange('project_type', e.target.value)}
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: 2
                        }
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

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: 2
                        }
                      }}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="planning">Planning</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    fullWidth
                    sx={{
                      py: 1,
                      borderRadius: 2,
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
                    borderColor: 'divider',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3,
                      bgcolor: 'primary.main',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    <GroupWork sx={{ fontSize: 40, color: 'white' }} />
                  </Avatar>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {activeTab === 'all' ? 'No projects found' : `No ${getTabLabel(activeTab).toLowerCase()} found`}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={4} sx={{ maxWidth: 400, mx: 'auto' }}>
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
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-2px) scale(1.02)',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Create Your First Project
                  </Button>
                </Paper>
              </Grow>
            ) : (
              <Grid container spacing={3}>
                {projects.map((project, index) => (
                  <Grid item xs={12} md={6} lg={4} key={project.id}>
                    <Grow
                      in={tabTransition}
                      timeout={600 + index * 100}
                      style={{ transformOrigin: '0 0 0' }}
                    >
                      <Box>
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

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </Box>
  );
};

export default Projects;