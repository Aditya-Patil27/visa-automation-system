import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ActivityLogs from './components/ActivityLogs';
import AdminDashboardOverview from './components/AdminDashboardOverview';
import AiVisaChatbot from './components/AiVisaChatbot';
import ApprovalWorkflow from './components/ApprovalWorkflow';
import DocumentVaultUploadSystem from './components/DocumentVaultUploadSystem';
import EligibilityResultsSuggestions from './components/EligibilityResultsSuggestions';
import ScraperMonitoringDashboard from './components/ScraperMonitoringDashboard';
import UserDashboard from './components/UserDashboard';
import VisaAppointmentScheduler from './components/VisaAppointmentScheduler';
import VisaEligibilityChecker from './components/VisaEligibilityChecker';
import VisaKnowledgeManagement from './components/VisaKnowledgeManagement';
import VisaProgressTracker from './components/VisaProgressTracker';
import TrackingSimulation from './components/TrackingSimulation';
import AuthPage from './components/AuthPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [role, setRole] = useState(localStorage.getItem('user_role') || null);

  const handleLogin = (newToken, newRole) => {
    setToken(newToken);
    setRole(newRole);
    localStorage.setItem('access_token', newToken);
    localStorage.setItem('user_role', newRole);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <LandingPageWrapper />
        } />
        
        {/* Protected/Auth Routes */}
        <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
        <Route path="/register" element={<AuthPage onLogin={handleLogin} />} />

        {/* Dashboard Routes (Protected) */}
        <Route path="/activity-logs" element={<ProtectedRoute token={token}><ActivityLogs /></ProtectedRoute>} />
        <Route path="/admin-dashboard-overview" element={<ProtectedRoute token={token}><AdminDashboardOverview /></ProtectedRoute>} />
        <Route path="/ai-visa-chatbot" element={<ProtectedRoute token={token}><AiVisaChatbot /></ProtectedRoute>} />
        <Route path="/user-dashboard" element={<ProtectedRoute token={token}><UserDashboard /></ProtectedRoute>} />
        <Route path="/visa-eligibility-checker" element={<ProtectedRoute token={token}><VisaEligibilityChecker /></ProtectedRoute>} />
        <Route path="/visa-knowledge-management" element={<ProtectedRoute token={token}><VisaKnowledgeManagement /></ProtectedRoute>} />
        <Route path="/visa-progress-tracker" element={<ProtectedRoute token={token}><VisaProgressTracker /></ProtectedRoute>} />
        <Route path="/tracking-simulation" element={<ProtectedRoute token={token}><TrackingSimulation /></ProtectedRoute>} />
        
        {/* Unprotected routes */}
        <Route path="/approval-workflow" element={<ApprovalWorkflow />} />
        <Route path="/document-vault-upload-system" element={<DocumentVaultUploadSystem />} />
        <Route path="/eligibility-results-suggestions" element={<EligibilityResultsSuggestions />} />
        <Route path="/scraper-monitoring-dashboard" element={<ScraperMonitoringDashboard />} />
        <Route path="/visa-appointment-scheduler" element={<VisaAppointmentScheduler />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
// Wrapper for protecting routes
function ProtectedRoute({ token, children }) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Wrapper to provide navigation to LandingPage props
function LandingPageWrapper() {
  const navigate = useNavigate();
  return (
    <LandingPage 
      onLoginClick={() => navigate('/login')}
      onGetStartedClick={() => navigate('/register')}
    />
  );
}

export default App;
