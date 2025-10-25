import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider
} from '@mui/material';

const TermsOfService = () => {
  const lastUpdated = "October 25, 2025"; // Current date

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
            Terms of Service
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: '#94A3B8',
              fontSize: '1rem'
            }}
          >
            Last updated: {lastUpdated}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#CBD5E1',
              maxWidth: '700px',
              mx: 'auto',
              mt: 3,
              lineHeight: 1.7,
              fontSize: '1rem'
            }}
          >
            Please read these Terms of Service ("Terms") carefully before using the SkillNexus website (the "Service") operated by The SkillNexus Team.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#CBD5E1',
              maxWidth: '700px',
              mx: 'auto',
              mt: 2,
              lineHeight: 1.7,
              fontSize: '1rem'
            }}
          >
            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
          </Typography>
        </Box>

        {/* Terms Content */}
        <Paper
          elevation={3}
          sx={{
            bgcolor: '#1E293B',
            borderRadius: 3,
            p: 4,
            border: '1px solid #334155'
          }}
        >
          {/* Section 1 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                color: '#14B8A6',
                fontWeight: 600,
                mb: 2,
                fontSize: '1.5rem'
              }}
            >
              1. Acceptance of Terms
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#CBD5E1',
                lineHeight: 1.7,
                fontSize: '1rem'
              }}
            >
              By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
            </Typography>
          </Box>

          <Divider sx={{ bgcolor: '#334155', my: 3 }} />

          {/* Section 2 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                color: '#14B8A6',
                fontWeight: 600,
                mb: 2,
                fontSize: '1.5rem'
              }}
            >
              2. User Accounts
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#CBD5E1',
                lineHeight: 1.7,
                fontSize: '1rem'
              }}
            >
              When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
            </Typography>
          </Box>

          <Divider sx={{ bgcolor: '#334155', my: 3 }} />

          {/* Section 3 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                color: '#14B8A6',
                fontWeight: 600,
                mb: 2,
                fontSize: '1.5rem'
              }}
            >
              3. User Conduct
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#CBD5E1',
                lineHeight: 1.7,
                fontSize: '1rem',
                mb: 2
              }}
            >
              You agree not to use the Service to:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: '#CBD5E1', lineHeight: 1.7 }}>
              <li>Violate our Community Guidelines;</li>
              <li>Engage in any illegal or fraudulent activity;</li>
              <li>Harass, abuse, or harm other users;</li>
              <li>Post false or misleading information;</li>
              <li>Attempt to gain unauthorized access to our systems.</li>
            </Box>
          </Box>

          <Divider sx={{ bgcolor: '#334155', my: 3 }} />

          {/* Section 4 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                color: '#14B8A6',
                fontWeight: 600,
                mb: 2,
                fontSize: '1.5rem'
              }}
            >
              4. Content
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#CBD5E1',
                lineHeight: 1.7,
                fontSize: '1rem'
              }}
            >
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness. By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service.
            </Typography>
          </Box>

          <Divider sx={{ bgcolor: '#334155', my: 3 }} />

          {/* Section 5 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                color: '#14B8A6',
                fontWeight: 600,
                mb: 2,
                fontSize: '1.5rem'
              }}
            >
              5. Limitation Of Liability
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#CBD5E1',
                lineHeight: 1.7,
                fontSize: '1rem'
              }}
            >
              In no event shall The SkillNexus Team, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service or inability to use the Service.
            </Typography>
          </Box>
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
            Questions About These Terms?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#CBD5E1',
              mb: 3
            }}
          >
            If you have any questions about these Terms of Service, please contact us.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#94A3B8',
                fontWeight: 600
              }}
            >
              Legal Team
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#14B8A6',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = 'mailto:legal@skillnexus.com'}
            >
              legal@skillnexus.com
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default TermsOfService;