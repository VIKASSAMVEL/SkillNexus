import React from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Star as StarIcon,
  VerifiedUser as VerifiedIcon,
  School as SchoolIcon
} from '@mui/icons-material';

const VerificationProcess = () => {
  const verificationBadges = [
    {
      title: "Community Reviewed Badge",
      icon: <StarIcon sx={{ color: '#F59E0B', fontSize: 28 }} />,
      badge: <Chip
        label="Community Reviewed"
        sx={{
          bgcolor: 'rgba(245, 158, 11, 0.1)',
          color: '#F59E0B',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          fontWeight: 600
        }}
      />,
      howToGet: "This badge is automatically awarded to users who have completed 3 or more skill sessions and maintained an average rating of 4.5 stars or higher.",
      whatItMeans: "This member is active and has been positively reviewed by their peers."
    },
    {
      title: "ID Verified Badge [FUTURE SCOPE]",
      icon: <VerifiedIcon sx={{ color: '#10B981', fontSize: 28 }} />,
      badge: <Chip
        label="ID Verified"
        sx={{
          bgcolor: 'rgba(16, 185, 129, 0.1)',
          color: '#10B981',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          fontWeight: 600
        }}
      />,
      howToGet: "This optional badge is awarded to members who complete an identity check with our future third-party partner by submitting a photo of their government-issued ID.",
      whatItMeans: "We have confirmed that this user's name and photo match their government ID, adding a strong layer of authenticity."
    },
    {
      title: "Skill Verified Badge [FUTURE SCOPE]",
      icon: <SchoolIcon sx={{ color: '#8B5CF6', fontSize: 28 }} />,
      badge: <Chip
        label="Skill Verified"
        sx={{
          bgcolor: 'rgba(139, 92, 246, 0.1)',
          color: '#8B5CF6',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          fontWeight: 600
        }}
      />,
      howToGet: "For select skills, users will be able to submit a portfolio or pass a short quiz to earn this badge.",
      whatItMeans: "This member has demonstrated a specific proficiency in their listed skill."
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
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Understanding Our Trust Badges
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#CBD5E1',
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            We offer several ways for members to build trust within the community. When you see these badges on a user's profile, here's what they mean.
          </Typography>
        </Box>

        {/* Verification Badges Accordion */}
        <Paper
          elevation={3}
          sx={{
            bgcolor: '#1E293B',
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid #334155'
          }}
        >
          {verificationBadges.map((badge, index) => (
            <Box key={index}>
              <Accordion
                sx={{
                  bgcolor: 'transparent',
                  '&:before': { display: 'none' },
                  '& .MuiAccordionSummary-root': {
                    bgcolor: '#1E293B',
                    color: '#E2E8F0',
                    '&:hover': {
                      bgcolor: '#334155'
                    }
                  },
                  '& .MuiAccordionDetails-root': {
                    bgcolor: '#0F172A',
                    color: '#CBD5E1',
                    borderTop: '1px solid #334155'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon sx={{ color: '#14B8A6' }} />
                  }
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      my: 2,
                      alignItems: 'center',
                      gap: 2
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    {badge.icon}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: '1.1rem'
                      }}
                    >
                      {badge.title}
                    </Typography>
                    <Box sx={{ ml: 'auto' }}>
                      {badge.badge}
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: '#14B8A6',
                        fontWeight: 600,
                        mb: 1,
                        fontSize: '1rem'
                      }}
                    >
                      How to get it:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.7,
                        fontSize: '1rem',
                        mb: 3
                      }}
                    >
                      {badge.howToGet}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: '#14B8A6',
                        fontWeight: 600,
                        mb: 1,
                        fontSize: '1rem'
                      }}
                    >
                      What it means:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.7,
                        fontSize: '1rem'
                      }}
                    >
                      {badge.whatItMeans}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
              {index < verificationBadges.length - 1 && (
                <Divider sx={{ bgcolor: '#334155' }} />
              )}
            </Box>
          ))}
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
            Questions About Verification?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#CBD5E1',
              mb: 3
            }}
          >
            Want to learn more about our verification process or get help with your badges?
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#94A3B8',
                fontWeight: 600
              }}
            >
              Support Team
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#14B8A6',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = 'mailto:support@skillnexus.com'}
            >
              support@skillnexus.com
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default VerificationProcess;