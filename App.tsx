
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectsList from './pages/ProjectsList';
import ProjectDetail from './pages/ProjectDetail';
import MyTasks from './pages/MyTasks';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ClientDashboard from './pages/ClientDashboard';
import ClientLayout from './components/ClientLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminClients from './pages/AdminClients';
import AdminEmployees from './pages/AdminEmployees';
import AdminAllProjects from './pages/AdminAllProjects';
import AdminInvoices from './pages/AdminInvoices';
import AdminSettings from './pages/AdminSettings';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import Profile from './pages/Profile';
import DeliverableReview from './pages/DeliverableReview';

function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <Layout />
            </ProtectedRoute>
          }
        >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="projects" element={<AdminAllProjects />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<Profile />} />
        </Route>

        {/* Coordinator Routes */}
        <Route 
          path="/coordinator" 
          element={
            <ProtectedRoute roles={['coordinator']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/coordinator/dashboard" replace />} />
          <Route path="dashboard" element={<CoordinatorDashboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Internal Employee/PM Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute roles={['project_manager', 'employee', 'admin', 'coordinator']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:projectId/deliverables/:deliverableId" element={<DeliverableReview />} />
          <Route path="tasks" element={<MyTasks />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Client-facing Routes */}
         <Route 
          path="/client" 
          element={
            <ProtectedRoute roles={['client']}>
              <ClientLayout />
            </ProtectedRoute>
          }
        >
            <Route index element={<Navigate to="/client/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="projects/:projectId/deliverables/:deliverableId" element={<DeliverableReview />} />
        </Route>


        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

export default App;