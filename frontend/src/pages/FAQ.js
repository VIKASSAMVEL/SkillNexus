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

const FAQ = () => {
  const faqs = [
    {
      question: "What is SkillNexus?",
      answer: "SkillNexus is a hyperlocal skill-sharing platform. Our mission is to connect neighbors so they can share or learn skills, collaborate on projects, and build a stronger local community."
    },
    {
      question: "How do I offer my skills?",
      answer: "It's easy! After creating your account, navigate to your profile and add the skills you'd like to offer. You can set your availability and add a description of your expertise."
    },
    {
      question: "How do I find someone to help me?",
      answer: "Just use our search bar on the homepage! You can search for any skill (like \"guitar,\" \"Spanish tutoring,\" or \"garden help\") and filter the results by your location and a specific radius to find experts right in your neighborhood."
    },
    {
      question: "Is this platform safe?",
      answer: "We take safety very seriously. We encourage all users to use our built-in reputation system (ratings and reviews), and we offer an optional identity verification. You can learn more at our Trust & Safety Center. As with any online interaction, we advise you to meet in public places for the first time."
    },
    {
      question: "Is SkillNexus free to use?",
      answer: "Yes! Our platform is 100% free for joining, searching, and connecting with other users. Any payment or barter for services is arranged directly between the members."
    },
    {
      question: "What are Community Projects?",
      answer: "Community Projects are collaborative goals posted by members. This could be anything from \"Need 3 people to help build a community garden\" to \"Looking for a designer and coder for a local non-profit website.\" It's a great way to team up and make a difference."
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
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#CBD5E1',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Everything you need to know about SkillNexus and how to get started
          </Typography>
        </Box>

        {/* FAQ Accordion */}
        <Paper
          elevation={3}
          sx={{
            bgcolor: '#1E293B',
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid #334155'
          }}
        >
          {faqs.map((faq, index) => (
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
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.7,
                      fontSize: '1rem'
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              {index < faqs.length - 1 && (
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
            Still have questions?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#CBD5E1',
              mb: 3
            }}
          >
            We're here to help! Reach out to our support team.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#94A3B8',
                fontWeight: 600
              }}
            >
              Email Support
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

export default FAQ;