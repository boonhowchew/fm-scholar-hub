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
    <div className="loading-screen">
      <div className="spinner" style={{ width: 36, height: 36 }} />
      <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>Loading FM Scholar Hub...</p>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (staffOnly && profile?.role === 'trainee') return <Navigate to="/dashboard" replace />
  return <AppLayout>{children}</AppLayout>
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
          <Route path="/manage-users" element={<PrivateRoute staffOnly><ManageUsers /></PrivateRoute>} />
          <Route path="/staff-tools" element={<PrivateRoute staffOnly><StaffTools /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

function LoginRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (user) return <Navigate to="/dashboard" replace />
  return <Login />
}
