import React from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Footer from '../components/Footer';

const ReportUser = () => {
  const reportingSections = [
    {
      question: "How to Report a User",
      answer: "Navigate to the profile of the user you wish to report.\n\nClick the \"Report User\" button (often represented by a flag icon or located in a '...' menu).\n\nFill out the short form, selecting the reason for your report and providing a brief description of the incident."
    },
    {
      question: "How to Report a Project",
      answer: "On the project's detail page, click the \"Report Project\" button.\n\nSelect the reason for the report (e.g., \"Spam,\" \"Illegal Activity,\" \"Hate Speech\")."
    },
    {
      question: "What Happens Next?",
      answer: "A member of our Trust & Safety team will review your report within 24 hours. We will investigate the claim and take appropriate action, which may include a warning, content removal, or account suspension. For privacy reasons, we may not be able to share the specific outcome of our investigation."
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#0F172A' }}>
      <Box sx={{ flex: 1, py: 8 }}>
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
            How to Report a Concern
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
            If you encounter a user or a project that violates our Community Guidelines or makes you feel unsafe, please report them. Your feedback is crucial to keeping our community safe.
          </Typography>
        </Box>

        {/* Reporting Guide Accordion */}
        <Paper
          elevation={3}
          sx={{
            bgcolor: '#1E293B',
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid #334155'
          }}
        >
          {reportingSections.map((section, index) => (
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
                      my: 2
                    }
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}
                  >
                    {section.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.7,
                      fontSize: '1rem',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {section.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              {index < reportingSections.length - 1 && (
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
            Need Help with Reporting?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#CBD5E1',
              mb: 3
            }}
          >
            Our Trust & Safety team is available 24/7 to assist you with any concerns.
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
      <Footer />
    </Box>
  );
};

export default ReportUser;