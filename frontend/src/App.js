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
import Forum from './pages/Forum';
import TopicDetail from './pages/TopicDetail';
import NewTopic from './pages/NewTopic';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#14B8A6', // Teal green
      dark: '#0F766E',
      light: '#5EEAD4',
    },
    secondary: {
      main: '#0F172A', // Navy blue
      dark: '#020617',
      light: '#1E293B',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(20, 184, 166, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
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
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/topic/:topicId" element={<TopicDetail />} />
              <Route path="/forum/new-topic" element={<NewTopic />} />
            </Routes>
          </Box>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
