import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import SubjectSelection from './components/SubjectSelection';
import Exam from './components/Exam';
import Admin from './components/Admin';
import Home from './components/Home';
import { ToastProvider } from './context/ToastContext';
import './App.css';

// Wrapper component to handle navigation logic inside Router context
const AppContent = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('selectedSubject');
    localStorage.removeItem('examAnswers');
    navigate('/auth/login');
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/auth/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <div className="app">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<Login onLogin={handleLogin} />} />

        {/* Student Routes */}
        <Route
          path="/dashboard/siswa"
          element={
            <ProtectedRoute allowedRoles={['siswa']}>
              <SubjectSelection
                user={user}
                onSelectSubject={(subjectId) => navigate(`/dashboard/siswa/exam/${subjectId}`)}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/siswa/exam/:subjectId"
          element={
            <ProtectedRoute allowedRoles={['siswa']}>
              <ExamWrapper user={user} />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/dashboard/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin', 'pengawas']}>
              <Admin user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

// Wrapper to extract params for Exam
import { useParams } from 'react-router-dom';
const ExamWrapper = ({ user }) => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  return (
    <Exam
      user={user}
      subjectId={subjectId}
      onBack={() => navigate('/dashboard/siswa')}
    />
  );
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  );
}

export default App;
