import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import Chatbot from './components/Chatbot';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useContext(AppContext);
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route 
              path="/citizen/*" 
              element={
                <ProtectedRoute allowedRole="Citizen">
                  <CitizenDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRole="Admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/worker/*" 
              element={
                <ProtectedRoute allowedRole="Worker">
                  <WorkerDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
      <Chatbot />
    </Router>
  );
};

export default App;
