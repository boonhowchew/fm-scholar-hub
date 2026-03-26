import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { Megaphone, Pin, Plus, X, AlertCircle, Filter } from 'lucide-react'
import { format } from 'date-fns'

const categoryConfig = {
  general: { label: 'General', class: 'badge-navy' },
  exam: { label: 'Exam', class: 'badge-red' },
  cpg: { label: 'CPG Update', class: 'badge-green' },
  circular: { label: 'Circular', class: 'badge-amber' },
  emergency: { label: 'Emergency', class: 'badge-red' }
}

export default function Announcements() {
  const { profile } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', category: 'general', is_pinned: false, target_year: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isStaff = profile?.role === 'academic_staff' || profile?.role === 'admin'

  useEffect(() => {
    fetchAnnouncements()
    const channel = supabase.channel('announcements-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => fetchAnnouncements())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*, profiles(full_name)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
    setAnnouncements(data || [])
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required.'); return }
    setSubmitting(true); setError('')
    const { error } = await supabase.from('announcements').insert({
      ...form, posted_by: profile.id,
      target_year: form.target_year ? parseInt(form.target_year) : null
    })
    if (error) { setError(error.message); setSubmitting(false); return }
    setShowModal(false)
    setForm({ title: '', content: '', category: 'general', is_pinned: false, target_year: '' })
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    await supabase.from('announcements').delete().eq('id', id)
    setSelected(null)
  }

  const filtered = announcements.filter(a => filter === 'all' || a.category === filter)

  if (loading) return <div className="loading-screen" style={{ height: 400 }}><div className="spinner" /></div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Announcements</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Official communications from the Department of Family Medicine
          </p>
        </div>
        {isStaff && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Announcement
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'general', 'exam', 'cpg', 'circular', 'emergency'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500,
              background: filter === f ? 'var(--upm-navy)' : 'var(--bg-primary)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${filter === f ? 'var(--upm-navy)' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.15s'
            }}>
            {f === 'all' ? 'All' : categoryConfig[f]?.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div className="empty-state card">
            <Megaphone size={40} />
            <h3>No announcements</h3>
            <p style={{ fontSize: 13 }}>Check back later for updates from the department.</p>
          </div>
        ) : filtered.map(a => (
          <div key={a.id} onClick={() => setSelected(a)} className="card"
            style={{
              cursor: 'pointer', padding: '18px 20px',
              borderLeft: a.is_pinned ? '4px solid var(--upm-gold)' : '1px solid var(--border)',
              transition: 'box-shadow 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {a.is_pinned && <Pin size={14} color="var(--upm-gold)" />}
                  <span className={`badge ${categoryConfig[a.category]?.class}`} style={{ fontSize: 11 }}>
                    {categoryConfig[a.category]?.label}
                  </span>
                  {a.target_year && (
                    <span className="badge badge-purple" style={{ fontSize: 11 }}>Year {a.target_year}</span>
                  )}
                </div>
                <h3 style={{ marginBottom: 6, fontSize: 15 }}>{a.title}</h3>
                <p style={{
                  fontSize: 13, color: 'var(--text-secondary)',
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                }}>{a.content}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {format(new Date(a.created_at), 'd MMM yyyy')}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {a.profiles?.full_name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {selected.is_pinned && <Pin size={16} color="var(--upm-gold)" />}
                <span className={`badge ${categoryConfig[selected.category]?.class}`}>
                  {categoryConfig[selected.category]?.label}
                </span>
              </div>
              <button className="btn-icon" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <h2 style={{ marginBottom: 8, fontSize: 20 }}>{selected.title}</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              Posted by {selected.profiles?.full_name} · {format(new Date(selected.created_at), 'd MMMM yyyy, h:mm a')}
            </p>
            <div style={{
              whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8,
              color: 'var(--text-primary)', padding: '16px',
              background: 'var(--bg-secondary)', borderRadius: 10
            }}>
              {selected.content}
            </div>
            {isStaff && (
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Announcement</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}><AlertCircle size={15} />{error}</div>}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="Announcement title" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="general">General</option>
                  <option value="exam">Exam</option>
                  <option value="cpg">CPG Update</option>
                  <option value="circular">Circular</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Target Year (optional)</label>
                <select className="form-select" value={form.target_year}
                  onChange={e => setForm(p => ({ ...p, target_year: e.target.value }))}>
                  <option value="">All years</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea className="form-textarea" placeholder="Announcement content..." style={{ minHeight: 140 }}
                value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <input type="checkbox" id="pin" checked={form.is_pinned}
                onChange={e => setForm(p => ({ ...p, is_pinned: e.target.checked }))}
                style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="pin" style={{ fontSize: 13, cursor: 'pointer' }}>Pin this announcement</label>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
