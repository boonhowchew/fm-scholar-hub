import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from 'hooks/useAuth'
import {
  GraduationCap, LayoutDashboard, Megaphone, MessageSquare,
  CalendarDays, BookOpen, FlaskConical, Newspaper, ClipboardList,
  LogOut, Settings, Users, X
} from 'lucide-react'

const NavItem = ({ to, icon: Icon, label, badge }) => (
  <NavLink to={to} style={({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 14px', borderRadius: 10,
    color: isActive ? 'var(--upm-navy)' : 'var(--text-secondary)',
    background: isActive ? 'var(--upm-light-blue)' : 'transparent',
    fontWeight: isActive ? 600 : 400, fontSize: 14, textDecoration: 'none',
    transition: 'all 0.15s', position: 'relative',
    borderLeft: isActive ? '3px solid var(--upm-navy)' : '3px solid transparent',
  })}>
    <Icon size={18} />
    <span style={{ flex: 1 }}>{label}</span>
    {badge > 0 && (
      <span style={{
        background: '#ef4444', color: 'white', borderRadius: 999,
        fontSize: 11, fontWeight: 700, padding: '1px 7px', minWidth: 20, textAlign: 'center'
      }}>{badge}</span>
    )}
  </NavLink>
)

const SectionLabel = ({ children }) => (
  <p style={{
    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    padding: '16px 14px 6px', marginTop: 4
  }}>{children}</p>
)

export default function Sidebar({ isOpen, onClose }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const isStaff = profile?.role === 'academic_staff' || profile?.role === 'admin'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRoleBadge = (role) => {
    const map = {
      trainee: { label: 'Trainee', class: 'badge-navy' },
      academic_staff: { label: 'Academic Staff', class: 'badge-gold' },
      admin: { label: 'Admin', class: 'badge-purple' }
    }
    return map[role] || { label: role, class: 'badge-navy' }
  }

  return (
    <aside style={{
      width: 'var(--sidebar-width)', background: 'var(--bg-primary)',
      borderRight: '1px solid var(--border)', height: '100vh',
      position: 'fixed', top: 0, left: 0,
      display: 'flex', flexDirection: 'column', zIndex: 50, overflowY: 'auto',
    }}>
      <div style={{
        padding: '20px 18px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: 'var(--upm-navy)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <GraduationCap size={20} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--upm-navy)', lineHeight: 1.2 }}>FM Scholar</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2 }}>Hub · UPM</p>
          </div>
        </div>
      </div>

      <div style={{
        padding: '14px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <div className="avatar" style={{ background: isStaff ? 'var(--upm-gold)' : 'var(--upm-navy)' }}>
          {getInitials(profile?.full_name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }} className="truncate">
            {profile?.full_name || 'Loading...'}
          </p>
          <span className={`badge ${getRoleBadge(profile?.role).class}`} style={{ fontSize: 11, marginTop: 2 }}>
            {getRoleBadge(profile?.role).label}
            {profile?.training_year && ` · Year ${profile.training_year}`}
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
        <SectionLabel>Main</SectionLabel>
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/announcements" icon={Megaphone} label="Announcements" />
        <NavItem to="/forum" icon={MessageSquare} label="Forum" />
        <SectionLabel>Learning</SectionLabel>
        <NavItem to="/exam-prep" icon={BookOpen} label="Exam Preparation" />
        <NavItem to="/research" icon={FlaskConical} label="Research & EBM" />
        <NavItem to="/primary-care" icon={Newspaper} label="Primary Care Updates" />
        <SectionLabel>Administration</SectionLabel>
        <NavItem to="/admin-tools" icon={ClipboardList} label="Admin Tools" />
        <NavItem to="/schedule" icon={CalendarDays} label="Schedule & Roster" />
        {isStaff && (
          <>
            <SectionLabel>Staff</SectionLabel>
            <NavItem to="/manage-users" icon={Users} label="Manage Trainees" />
            <NavItem to="/staff-tools" icon={Settings} label="Staff Tools" />
          </>
        )}
      </nav>

      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <button onClick={handleSignOut} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 14px', borderRadius: 10, color: 'var(--danger)',
          background: 'transparent', fontSize: 14, width: '100%',
          border: 'none', cursor: 'pointer', transition: 'background 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={18} /><span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
