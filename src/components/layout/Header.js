import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'hooks/useAuth'
import { supabase } from 'lib/supabase'
import { Bell, Menu, ChevronDown, User, LogOut } from 'lucide-react'

export default function Header({ onMenuClick }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notifRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    if (profile) fetchNotifications()
  }, [profile])

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchNotifications = async () => {
    const { data } = await supabase.from('notifications').select('*')
      .eq('user_id', profile?.id).order('created_at', { ascending: false }).limit(10)
    setNotifications(data || [])
  }

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile?.id)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  return (
    <header style={{
      height: 'var(--header-height)', background: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border)', display: 'flex',
      alignItems: 'center', padding: '0 24px', gap: 16,
      position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Good {greeting},{' '}
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {profile?.full_name?.split(' ')[0] || 'Scholar'}
          </span>
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="btn-icon" onClick={() => setShowNotifications(!showNotifications)} style={{ position: 'relative' }}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4, width: 8, height: 8,
                borderRadius: '50%', background: '#ef4444', border: '2px solid white'
              }} />
            )}
          </button>
          {showNotifications && (
            <div style={{
              position: 'absolute', right: 0, top: 44, width: 320,
              background: 'var(--bg-primary)', border: '1px solid var(--border)',
              borderRadius: 14, boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden'
            }}>
              <div style={{
                padding: '14px 16px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.length === 0
                  ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications yet</div>
                  : notifications.map(n => (
                    <div key={n.id} style={{
                      padding: '12px 16px',
                      background: n.is_read ? 'transparent' : 'var(--upm-light-blue)',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <p style={{ fontWeight: n.is_read ? 400 : 600, fontSize: 13, marginBottom: 2 }}>{n.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{n.message}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{getTimeAgo(n.created_at)}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={userRef}>
          <button onClick={() => setShowUserMenu(!showUserMenu)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
            borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer'
          }}>
            <div className="avatar avatar-sm" style={{
              background: profile?.role === 'academic_staff' ? 'var(--upm-gold)' : 'var(--upm-navy)'
            }}>
              {getInitials(profile?.full_name)}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 120 }} className="truncate">
              {profile?.full_name?.split(' ')[0]}
            </span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>
          {showUserMenu && (
            <div style={{
              position: 'absolute', right: 0, top: 44, width: 180,
              background: 'var(--bg-primary)', border: '1px solid var(--border)',
              borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 100, padding: 6
            }}>
              <button onClick={() => { navigate('/profile'); setShowUserMenu(false) }} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 8, width: '100%', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)'
              }}>
                <User size={15} /> My Profile
              </button>
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <button onClick={handleSignOut} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 8, width: '100%', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 13, color: 'var(--danger)'
              }}>
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
