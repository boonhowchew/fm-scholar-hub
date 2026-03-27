import React, { useState, useEffect } from 'react'
import { useAuth } from 'hooks/useAuth'
import { supabase } from 'lib/supabase'
import { Users, Plus, X, AlertCircle, Edit2, Search } from 'lucide-react'

export default function ManageUsers() {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState({ full_name: '', email: '', role: 'trainee', training_year: '1', cohort_year: '1', current_posting: '', matric_number: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isAdmin = profile?.role === 'admin'

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('training_year').order('full_name')
    setUsers(data || [])
    setLoading(false)
  }

  const openEdit = (user) => {
    setEditUser(user)
    setForm({
      full_name: user.full_name, email: user.email,
      role: user.role, training_year: user.training_year?.toString() || '1',
      cohort_year: user.cohort_year?.toString() || '1',
      current_posting: user.current_posting || '',
      matric_number: user.matric_number || '', phone: user.phone || ''
    })
    setShowModal(true); setError(''); setSuccess('')
  }

  const handleCreateAccount = async () => {
    if (!form.full_name || !form.email) { setError('Name and email are required.'); return }
    setSubmitting(true); setError(''); setSuccess('')

    if (editUser) {
      const { error } = await supabase.from('profiles').update({
        full_name: form.full_name, role: form.role,
        training_year: parseInt(form.training_year),
        cohort_year: parseInt(form.cohort_year),
        current_posting: form.current_posting,
        matric_number: form.matric_number, phone: form.phone
      }).eq('id', editUser.id)
      if (error) { setError(error.message); setSubmitting(false); return }
      setSuccess('Profile updated successfully.')
      fetchUsers()
      setTimeout(() => { setShowModal(false); setEditUser(null); setSuccess('') }, 1500)
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin?.createUser({
        email: form.email, password: 'FMScholar2025!', email_confirm: true
      })
      if (authError) {
        setError('Account creation requires admin API. Please create the user via Supabase dashboard Authentication → Users, then their profile will be created here on first login.')
        setSubmitting(false); return
      }
    }
    setSubmitting(false)
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.matric_number?.toLowerCase().includes(search.toLowerCase())
  )

  const getRoleBadge = (role) => {
    const map = { trainee: 'badge-navy', academic_staff: 'badge-gold', admin: 'badge-purple' }
    return map[role] || 'badge-navy'
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  if (loading) return <div className="loading-screen" style={{ height: 400 }}><div className="spinner" /></div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Manage Trainees</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            View and manage all trainee and staff profiles
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[1, 2, 3, 4].map(yr => {
          const count = users.filter(u => u.role === 'trainee' && u.training_year === yr).length
          return (
            <div key={yr} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--upm-navy)' }}>{count}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Year {yr} trainees</p>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="form-input" placeholder="Search by name, email or matric number..."
          style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* User list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state"><Users size={36} /><p>No users found</p></div>
        ) : filtered.map((u, i) => (
          <div key={u.id} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
            borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
            transition: 'background 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div className="avatar" style={{
              background: u.role === 'academic_staff' ? 'var(--upm-gold)' : u.role === 'admin' ? '#7c3aed' : 'var(--upm-navy)'
            }}>
              {getInitials(u.full_name)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{u.full_name}</p>
                <span className={`badge ${getRoleBadge(u.role)}`} style={{ fontSize: 11 }}>{u.role.replace('_', ' ')}</span>
                {u.training_year && <span className="badge badge-navy" style={{ fontSize: 11 }}>Year {u.training_year}</span>}
                {!u.is_active && <span className="badge badge-red" style={{ fontSize: 11 }}>Inactive</span>}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {u.email}
                {u.matric_number && ` · ${u.matric_number}`}
                {u.current_posting && ` · ${u.current_posting}`}
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>
              <Edit2 size={13} /> Edit
            </button>
          </div>
        ))}
      </div>

      {/* New user instructions */}
      <div className="alert alert-info" style={{ marginTop: 16 }}>
        <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontWeight: 600, marginBottom: 2 }}>Adding new trainees</p>
          <p>To add a new trainee: go to your <strong>Supabase dashboard → Authentication → Users → Invite user</strong>. Enter their email and they will receive a setup link. On first login, ask them to complete their profile. Their account will then appear here for you to assign their training year and posting.</p>
        </div>
      </div>

      {/* Edit modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditUser(null) }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editUser ? 'Edit Profile' : 'New User'}</h2>
              <button className="btn-icon" onClick={() => { setShowModal(false); setEditUser(null) }}><X size={18} /></button>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: 12 }}><AlertCircle size={14} />{error}</div>}
            {success && <div className="alert alert-success" style={{ marginBottom: 12 }}><AlertCircle size={14} />{success}</div>}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} disabled={!!editUser}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={{ background: editUser ? 'var(--bg-tertiary)' : 'var(--bg-primary)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="trainee">Trainee</option>
                  <option value="academic_staff">Academic Staff</option>
                  {isAdmin && <option value="admin">Admin</option>}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Training Year</label>
                <select className="form-select" value={form.training_year} onChange={e => setForm(p => ({ ...p, training_year: e.target.value }))}>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Matric Number</label>
                <input className="form-input" value={form.matric_number} onChange={e => setForm(p => ({ ...p, matric_number: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Current Posting</label>
              <input className="form-input" placeholder="e.g. HUKM — Internal Medicine" value={form.current_posting}
                onChange={e => setForm(p => ({ ...p, current_posting: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => { setShowModal(false); setEditUser(null) }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateAccount} disabled={submitting}>
                {submitting ? 'Saving...' : editUser ? 'Save Changes' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
