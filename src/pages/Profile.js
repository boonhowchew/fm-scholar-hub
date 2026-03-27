import React, { useState } from 'react'
import { useAuth } from 'hooks/useAuth'
import { User, Mail, Phone, BookOpen, MapPin, Save, AlertCircle } from 'lucide-react'

export default function Profile() {
  const { profile, updateProfile } = useAuth()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    current_posting: profile?.current_posting || '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess(false)
    const { error } = await updateProfile(form)
    if (error) { setError(error.message) } else { setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
    setSaving(false)
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  const yearDescriptions = {
    1: 'Hospital postings — Internal Medicine, O&G, Paediatrics and others',
    2: 'Hospital postings continued + Research proposal and ethics',
    3: 'Clinic postings + Research data collection + Professional Exam 2',
    4: 'Clinic postings + Research completion + Final Viva Voce'
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ marginBottom: 4 }}>My Profile</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
        Manage your account information
      </p>

      {/* Profile header */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: profile?.role === 'academic_staff' ? 'var(--upm-gold)' : 'var(--upm-navy)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: 'white'
          }}>
            {getInitials(profile?.full_name)}
          </div>
          <div>
            <h2 style={{ marginBottom: 4 }}>{profile?.full_name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 6 }}>{profile?.email}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="badge badge-navy">{profile?.role?.replace('_', ' ')}</span>
              {profile?.training_year && <span className="badge badge-gold">Year {profile.training_year}</span>}
              {profile?.matric_number && <span className="badge badge-navy">{profile.matric_number}</span>}
            </div>
          </div>
        </div>

        {profile?.training_year && (
          <div style={{
            marginTop: 16, padding: '12px 14px',
            background: 'var(--upm-light-blue)', borderRadius: 8,
            borderLeft: '3px solid var(--upm-navy)'
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--upm-navy)', marginBottom: 2 }}>
              YEAR {profile.training_year} PROGRAMME
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {yearDescriptions[profile.training_year]}
            </p>
          </div>
        )}
      </div>

      {/* Edit form */}
      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Edit Information</h3>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}><AlertCircle size={15} />{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: 16 }}><AlertCircle size={15} />Profile updated successfully.</div>}

        <div className="form-group">
          <label className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} />Full Name</div>
          </label>
          <input className="form-input" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
        </div>

        <div className="form-group">
          <label className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14} />Email</div>
          </label>
          <input className="form-input" value={profile?.email} disabled style={{ background: 'var(--bg-tertiary)' }} />
          <p className="form-hint">Email cannot be changed here. Contact your administrator.</p>
        </div>

        <div className="form-group">
          <label className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} />Phone Number</div>
          </label>
          <input className="form-input" placeholder="e.g. 012-3456789" value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
        </div>

        <div className="form-group">
          <label className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} />Current Posting</div>
          </label>
          <input className="form-input" placeholder="e.g. HUKM — Internal Medicine Ward" value={form.current_posting}
            onChange={e => setForm(p => ({ ...p, current_posting: e.target.value }))} />
          <p className="form-hint">Where you are currently posted in the programme</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} />{saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
