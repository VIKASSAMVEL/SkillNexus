import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0F172A',
        borderTop: '1px solid #1E293B',
        py: { xs: 4, md: 6 },
        mt: 'auto',
        width: '100%'
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              color: '#14B8A6',
              mb: 2,
              fontWeight: 700
            }}
          >
            SkillNexus
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#E2E8F0',
              mb: 1,
              fontWeight: 500
            }}
          >
            Developed by Team Rejections
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#94A3B8',
              display: 'block'
            }}
          >
            © {currentYear} SkillNexus. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
