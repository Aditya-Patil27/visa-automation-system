import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import LandingPage from './components/LandingPage';
import ActivityLogs from './components/ActivityLogs';
import AdminDashboardOverview from './components/AdminDashboardOverview';
import AdminDocumentReview from './components/AdminDocumentReview';
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
import QuerySupportTicket from './components/QuerySupportTicket';
import VisaMarketplace from './components/VisaMarketplace';
import VisaDetails from './components/VisaDetails';
import ApplyVisa from './components/ApplyVisa';
import MyApplications from './components/MyApplications';
import { api } from './services/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [role, setRole] = useState(localStorage.getItem('user_role') || null);

  const handleLogin = (newToken, newRole) => {
    setToken(newToken);
    setRole(newRole);
    localStorage.setItem('access_token', newToken);
    localStorage.setItem('user_role', newRole);
    localStorage.removeItem('user_profile');
    window.dispatchEvent(new Event('auth-change'));
  };

  return (
    <Router>
      <UserProvider>
        <Routes>
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
        <Route path="/register" element={<AuthPage onLogin={handleLogin} />} />
        <Route path="/activity-logs" element={<ProtectedRoute><ActivityLogs /></ProtectedRoute>} />
        <Route path="/admin-dashboard-overview" element={<ProtectedRoute><AdminDashboardOverview /></ProtectedRoute>} />
        <Route path="/ai-visa-chatbot" element={<ProtectedRoute><AiVisaChatbot /></ProtectedRoute>} />
        <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/visa-eligibility-checker" element={<ProtectedRoute><VisaEligibilityChecker /></ProtectedRoute>} />
        <Route path="/visa-knowledge-management" element={<ProtectedRoute><VisaKnowledgeManagement /></ProtectedRoute>} />
        <Route path="/visa-progress-tracker" element={<ProtectedRoute><VisaProgressTracker /></ProtectedRoute>} />
        <Route path="/tracking-simulation" element={<ProtectedRoute><TrackingSimulation /></ProtectedRoute>} />
        <Route path="/admin-document-review" element={<ProtectedRoute><AdminDocumentReview /></ProtectedRoute>} />
        <Route path="/approval-workflow" element={<ProtectedRoute><ApprovalWorkflow /></ProtectedRoute>} />
        <Route path="/document-vault-upload-system" element={<ProtectedRoute><DocumentVaultUploadSystem /></ProtectedRoute>} />
        <Route path="/eligibility-results-suggestions" element={<ProtectedRoute><EligibilityResultsSuggestions /></ProtectedRoute>} />
        <Route path="/scraper-monitoring-dashboard" element={<ProtectedRoute><ScraperMonitoringDashboard /></ProtectedRoute>} />
        <Route path="/visa-appointment-scheduler" element={<ProtectedRoute><VisaAppointmentScheduler /></ProtectedRoute>} />
          <Route path="/support-tickets" element={<ProtectedRoute><QuerySupportTicket /></ProtectedRoute>} />
          <Route path="/visa-marketplace" element={<ProtectedRoute><VisaMarketplace /></ProtectedRoute>} />
          <Route path="/visa/:id" element={<ProtectedRoute><VisaDetails /></ProtectedRoute>} />
          <Route path="/apply/:visa_id" element={<ProtectedRoute><ApplyVisa /></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </UserProvider>
    </Router>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

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
