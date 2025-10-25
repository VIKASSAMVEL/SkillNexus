import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  VerifiedUser as VerifiedIcon,
  Schedule as ScheduleIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon,
  Report as ReportIcon
} from '@mui/icons-material';

const CommunityGuidelines = () => {
  const guidelines = [
    {
      icon: <PeopleIcon sx={{ color: '#14B8A6' }} />,
      title: "Be Respectful",
      description: "We have a zero-tolerance policy for harassment, hate speech, discrimination, or bullying of any kind. Treat all members with respect."
    },
    {
      icon: <VerifiedIcon sx={{ color: '#F59E0B' }} />,
      title: "Be Authentic",
      description: "Your profile should be a genuine representation of you. Do not create fake accounts, post spam, or misrepresent your skills and qualifications."
    },
    {
      icon: <ScheduleIcon sx={{ color: '#C084FC' }} />,
      title: "Be Reliable",
      description: "Honor your commitments. If you schedule a session with another member, show up on time and be prepared. If you need to cancel, provide as much notice as possible."
    },
    {
      icon: <GavelIcon sx={{ color: '#EF4444' }} />,
      title: "Obey the Law",
      description: "Do not use our platform to offer or request any services that are illegal."
    },
    {
      icon: <SecurityIcon sx={{ color: '#10B981' }} />,
      title: "Be Safe",
      description: "Do not post personal, private, or confidential information about yourself or others. (See our Safety Tips at the Trust & Safety Center)."
    },
    {
      icon: <ReportIcon sx={{ color: '#F59E0B' }} />,
      title: "Enforcement",
      description: "Violations of these guidelines may result in a warning, account suspension, or permanent removal from the platform. If you see someone violating these rules, please report them immediately."
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A', py: 8 }}>
      <Container maxWidth="md">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              color: '#14B8A6',
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Our Community Guidelines
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#CBD5E1',
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: '1.1rem'
            }}
          >
            To keep SkillNexus a safe, respectful, and reliable space, we require all members to agree to and follow these guidelines.
          </Typography>
        </Box>

        {/* Guidelines List */}
        <Paper
          elevation={3}
          sx={{
            bgcolor: '#1E293B',
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid #334155'
          }}
        >
          <List sx={{ width: '100%', p: 0 }}>
            {guidelines.map((guideline, index) => (
              <Box key={index}>
                <ListItem sx={{ px: 4, py: 3 }}>
                  <ListItemIcon sx={{ minWidth: 60, alignSelf: 'flex-start', mt: 0.5 }}>
                    {guideline.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#E2E8F0',
                          mb: 1,
                          fontWeight: 600,
                          fontSize: '1.1rem'
                        }}
                      >
                        {guideline.title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#CBD5E1',
                          lineHeight: 1.6,
                          fontSize: '1rem'
                        }}
                      >
                        {guideline.description}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < guidelines.length - 1 && (
                  <Divider sx={{ bgcolor: '#334155' }} />
                )}
              </Box>
            ))}
          </List>
        </Paper>

        {/* Contact Section */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#E2E8F0',
              mb: 2
            }}
          >
            Questions About These Guidelines?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#CBD5E1',
              mb: 3
            }}
          >
            We're here to help clarify any aspect of our community guidelines.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#94A3B8',
                fontWeight: 600
              }}
            >
              Community Support
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#14B8A6',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = 'mailto:community@skillnexus.com'}
            >
              community@skillnexus.com
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CommunityGuidelines;