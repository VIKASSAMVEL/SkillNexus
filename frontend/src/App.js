import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components (to be created)
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Skills from './pages/Skills';
import Bookings from './pages/Bookings';
import Projects from './pages/Projects';
import Recommendations from './pages/Recommendations';
import FAQ from './pages/FAQ';
import TrustSafety from './pages/TrustSafety';
import CommunityGuidelines from './pages/CommunityGuidelines';
import ReportUser from './pages/ReportUser';
import VerificationProcess from './pages/VerificationProcess';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Sessions from './pages/Sessions';
import SessionRoom from './pages/SessionRoom';
import Credits from './components/Credits';
import ScrollToTop from './components/ScrollToTop';
import NotificationPreferences from './components/NotificationPreferences';
import ConflictResolution from './components/ConflictResolution';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ScrollToTop />
        <div className="App" style={{ backgroundColor: '#0F172A', minHeight: '100vh' }}>
          <Header />
          <Box sx={{ width: '100%', m: 0, p: 0, backgroundColor: '#0F172A', minHeight: 'calc(100vh - 64px)' }}>
                        <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/session/:sessionId" element={<SessionRoom />} />
              <Route path="/notifications" element={<NotificationPreferences />} />
              <Route path="/conflicts" element={<ConflictResolution />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/trust-safety" element={<TrustSafety />} />
              <Route path="/community-guidelines" element={<CommunityGuidelines />} />
              <Route path="/report-user" element={<ReportUser />} />
              <Route path="/verification-process" element={<VerificationProcess />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/credits" element={<Credits />} />
            </Routes>
          </Box>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
