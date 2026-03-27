import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from 'hooks/useAuth'
import AppLayout from 'components/layout/AppLayout'
import Login from 'components/auth/Login'
import Dashboard from 'pages/Dashboard'
import Announcements from 'pages/Announcements'
import { ThreadList, ThreadDetail } from 'pages/Forum'
import AdminTools from 'pages/AdminTools'
import ManageUsers from 'pages/ManageUsers'
import Profile from 'pages/Profile'
import { ExamPrep, Research, PrimaryCare, StaffTools, Schedule } from 'pages/Placeholders'
import 'styles/global.css'

function PrivateRoute({ children, staffOnly = false }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16, background:'#f1f5f9' }}>
      <div style={{ width:36, height:36, border:'3px solid #e2e8f0', borderTopColor:'#003366', borderRadius:'50%', animation:'spin 0.6s linear infinite' }} />
      <p style={{ color:'#64748b' }}>Loading FM Scholar Hub...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (staffOnly && profile?.role === 'trainee') return <Navigate to="/dashboard" replace />
  return <AppLayout>{children}</AppLayout>
}

function LoginRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><div style={{ width:32, height:32, border:'3px solid #e2e8f0', borderTopColor:'#003366', borderRadius:'50%', animation:'spin 0.6s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
  if (user) return <Navigate to="/dashboard" replace />
  return <Login />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/announcements" element={<PrivateRoute><Announcements /></PrivateRoute>} />
          <Route path="/forum" element={<PrivateRoute><ThreadList /></PrivateRoute>} />
          <Route path="/forum/thread/:id" element={<PrivateRoute><ThreadDetail /></PrivateRoute>} />
          <Route path="/admin-tools" element={<PrivateRoute><AdminTools /></PrivateRoute>} />
          <Route path="/schedule" element={<PrivateRoute><Schedule /></PrivateRoute>} />
          <Route path="/exam-prep" element={<PrivateRoute><ExamPrep /></PrivateRoute>} />
          <Route path="/research" element={<PrivateRoute><Research /></PrivateRoute>} />
          <Route path="/primary-care" element={<PrivateRoute><PrimaryCare /></PrivateRoute>} />
          <Route path="/manage-users" element={<PrivateRoute staffOnly={true}><ManageUsers /></PrivateRoute>} />
          <Route path="/staff-tools" element={<PrivateRoute staffOnly={true}><StaffTools /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
