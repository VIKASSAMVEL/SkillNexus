import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  const lastUpdated = "October 25, 2025"; // Current date

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
            Privacy Policy
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
            The SkillNexus Team ("us", "we", or "our") operates the SkillNexus website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.
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
            We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.
          </Typography>
        </Box>

        {/* Privacy Policy Content */}
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
              1. Information Collection and Use
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
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#F59E0B',
                  fontWeight: 600,
                  mb: 1,
                  fontSize: '1.1rem'
                }}
              >
                Personal Data:
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
                While using our Service, we may ask you to provide us with certain personally identifiable information, including but not limited to: Email address, Name, Location Data (City, Postal Code), Skills and Interests.
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: '#F59E0B',
                  fontWeight: 600,
                  mb: 1,
                  fontSize: '1.1rem'
                }}
              >
                Usage Data:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#CBD5E1',
                  lineHeight: 1.7,
                  fontSize: '1rem'
                }}
              >
                We may also collect information on how the Service is accessed and used.
              </Typography>
            </Box>
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
              2. Use of Data
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
              The SkillNexus Team uses the collected data for various purposes:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: '#CBD5E1', lineHeight: 1.7 }}>
              <li>To provide and maintain the Service;</li>
              <li>To notify you about changes to our Service;</li>
              <li>To allow you to participate in interactive features of our Service;</li>
              <li>To match you with other users based on skills and location;</li>
              <li>To provide customer support.</li>
            </Box>
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
              3. Data Security
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#CBD5E1',
                lineHeight: 1.7,
                fontSize: '1rem'
              }}
            >
              The security of your data is important to us. We use industry-standard practices like SSL encryption and password hashing to protect your information. However, no method of transmission over the Internet is 100% secure.
            </Typography>
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
              4. Your Data Rights
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#CBD5E1',
                lineHeight: 1.7,
                fontSize: '1rem'
              }}
            >
              You have the right to access, update, or delete the information we have on you by visiting your profile settings page.
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
            Questions About Your Privacy?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#CBD5E1',
              mb: 3
            }}
          >
            If you have any questions about this Privacy Policy, please contact us.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#94A3B8',
                fontWeight: 600
              }}
            >
              Privacy Team
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#14B8A6',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = 'mailto:privacy@skillnexus.com'}
            >
              privacy@skillnexus.com
            </Typography>
          </Box>
        </Box>
      </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default PrivacyPolicy;