import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Shield as ShieldIcon,
  VerifiedUser as VerifiedIcon,
  Report as ReportIcon,
  Public as PublicIcon,
  Chat as ChatIcon,
  CreditCard as CreditCardIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const TrustSafety = () => {
  const safetyPillars = [
    {
      title: "Community Guidelines",
      description: "The rules of the road for all members. Learn about our standards for respect, authenticity, and reliability.",
      icon: <ShieldIcon sx={{ fontSize: 40, color: '#14B8A6' }} />,
      link: "/community-guidelines"
    },
    {
      title: "Our Verification Process",
      description: "Learn what our trust badges mean and how you can become a verified member to build your reputation.",
      icon: <VerifiedIcon sx={{ fontSize: 40, color: '#F59E0B' }} />,
      link: "/verification-process"
    },
    {
      title: "Reporting a User",
      description: "See someone or something that violates our policies? Here's how to let us know so we can take action.",
      icon: <ReportIcon sx={{ fontSize: 40, color: '#EF4444' }} />,
      link: "/report-user"
    }
  ];

  const safetyTips = [
    {
      icon: <PublicIcon sx={{ color: '#14B8A6' }} />,
      text: "Meet in Public: For any in-person skill exchange, we strongly recommend meeting in a public place (like a coffee shop or library) for the first time."
    },
    {
      icon: <ChatIcon sx={{ color: '#14B8A6' }} />,
      text: "Keep Communication On-Platform: Use our built-in chat to communicate. This creates a record and protects your personal information like your phone number."
    },
    {
      icon: <CreditCardIcon sx={{ color: '#14B8A6' }} />,
      text: "Never Share Financial Info: Never share your bank account, credit card details, or other sensitive financial information with other users."
    },
    {
      icon: <StarIcon sx={{ color: '#14B8A6' }} />,
      text: "Check Reviews: Always check a user's profile for ratings and reviews from other members before scheduling a session."
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A', py: 8 }}>
      <Container maxWidth="lg">
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
            The SkillNexus Trust & Safety Center
          </Typography>
          <Typography
            variant="h3"
            sx={{
              color: '#E2E8F0',
              fontWeight: 600,
              mb: 4,
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}
          >
            Your Safety is Our Priority
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#CBD5E1',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: '1.1rem'
            }}
          >
            Welcome to the SkillNexus Trust & Safety Center. We are built on a foundation of community, and a strong community is built on trust.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#94A3B8',
              maxWidth: '700px',
              mx: 'auto',
              mt: 2,
              lineHeight: 1.7,
              fontSize: '1rem'
            }}
          >
            Our goal is to provide you with the tools and resources to connect, share, and collaborate with your neighbors safely. We are committed to building a reliable platform where everyone feels secure.
          </Typography>
        </Box>

        {/* Core Safety Pillars */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            sx={{
              color: '#E2E8F0',
              textAlign: 'center',
              mb: 4,
              fontWeight: 600
            }}
          >
            Our Core Safety Pillars
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 4 }}>
            {safetyPillars.map((pillar, index) => (
              <Box key={index} sx={{ flex: '0 0 auto', width: { xs: '100%', md: '350px' } }}>
                <Card
                  component={RouterLink}
                  to={pillar.link}
                  sx={{
                    bgcolor: '#1E293B',
                    borderRadius: 3,
                    height: '100%',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(20, 184, 166, 0.15)',
                      borderColor: '#14B8A6'
                    }
                  }}
                >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {pillar.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#E2E8F0',
                      mb: 2,
                      fontWeight: 600
                    }}
                  >
                    {pillar.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#CBD5E1',
                      lineHeight: 1.6
                    }}
                  >
                    {pillar.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            ))}
          </Box>
        </Box>

        {/* General Safety Tips */}
        <Paper
          elevation={3}
          sx={{
            bgcolor: '#1E293B',
            borderRadius: 3,
            p: 4,
            border: '1px solid #334155'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#E2E8F0',
              textAlign: 'center',
              mb: 4,
              fontWeight: 600
            }}
          >
            General Safety Tips
          </Typography>
          <List sx={{ width: '100%' }}>
            {safetyTips.map((tip, index) => (
              <Box key={index}>
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 50 }}>
                    {tip.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#CBD5E1',
                          lineHeight: 1.6,
                          fontSize: '1rem'
                        }}
                      >
                        {tip.text}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < safetyTips.length - 1 && (
                  <Divider sx={{ bgcolor: '#334155', my: 1 }} />
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
            Need Help or Have Concerns?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#CBD5E1',
              mb: 3
            }}
          >
            Our safety team is here to support you. Don't hesitate to reach out.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#94A3B8',
                fontWeight: 600
              }}
            >
              Safety & Support
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#14B8A6',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = 'mailto:safety@skillnexus.com'}
            >
              safety@skillnexus.com
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default TrustSafety;