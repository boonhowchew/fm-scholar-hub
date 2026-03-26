import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import {
  CalendarDays, ClipboardList, Clock, BookOpen,
  Plus, X, AlertCircle, Check, ChevronDown, ChevronUp,
  Calendar, UserCheck
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function AdminTools() {
  const { profile } = useAuth()
  const [tab, setTab] = useState('roster')
  const isStaff = profile?.role === 'academic_staff' || profile?.role === 'admin'

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>Administrative Tools</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Teaching roster, leave records, assignment rules and schedules
        </p>
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        {[
          { key: 'roster', label: 'Teaching Roster' },
          { key: 'leave', label: 'Leave Records' },
          { key: 'rules', label: 'Assignment Rules' },
          { key: 'holidays', label: 'Public Holidays' },
        ].map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === 'roster' && <TeachingRoster isStaff={isStaff} profile={profile} />}
      {tab === 'leave' && <LeaveRecords isStaff={isStaff} profile={profile} />}
      {tab === 'rules' && <AssignmentRules isStaff={isStaff} profile={profile} />}
      {tab === 'holidays' && <PublicHolidays isStaff={isStaff} />}
    </div>
  )
}

function TeachingRoster({ isStaff, profile }) {
  const [sessions, setSessions] = useState([])
  const [trainees, setTrainees] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ session_title: '', session_type: 'case_presentation', presenter_id: '', session_date: '', session_time: '', venue: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSessions()
    if (isStaff) fetchTrainees()
  }, [])

  const fetchSessions = async () => {
    const { data } = await supabase.from('teaching_roster')
      .select('*, profiles!teaching_roster_presenter_id_fkey(full_name)')
      .order('session_date')
    setSessions(data || [])
  }

  const fetchTrainees = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, training_year').eq('role', 'trainee').order('full_name')
    setTrainees(data || [])
  }

  const handleSubmit = async () => {
    if (!form.session_title || !form.presenter_id || !form.session_date) { setError('Please fill required fields.'); return }
    setSubmitting(true)
    const { error } = await supabase.from('teaching_roster').insert({ ...form, created_by: profile.id })
    if (error) { setError(error.message); setSubmitting(false); return }
    setShowModal(false)
    setForm({ session_title: '', session_type: 'case_presentation', presenter_id: '', session_date: '', session_time: '', venue: '', notes: '' })
    setSubmitting(false)
    fetchSessions()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this session?')) return
    await supabase.from('teaching_roster').delete().eq('id', id)
    fetchSessions()
  }

  const sessionTypeLabel = { journal_club: 'Journal Club', case_presentation: 'Case Presentation', seminar: 'Seminar', tutorial: 'Tutorial', other: 'Other' }

  const isPast = (date) => new Date(date) < new Date()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        {isStaff && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Add Session</button>}
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {sessions.length === 0 ? (
          <div className="empty-state"><CalendarDays size={36} /><p>No sessions scheduled yet</p></div>
        ) : sessions.map((s, i) => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
            borderBottom: i < sessions.length - 1 ? '1px solid var(--border)' : 'none',
            opacity: isPast(s.session_date) ? 0.55 : 1,
            background: 'transparent', transition: 'background 0.15s'
          }}>
            <div style={{
              background: isPast(s.session_date) ? 'var(--bg-tertiary)' : 'var(--upm-light-blue)',
              borderRadius: 10, padding: '8px 12px', textAlign: 'center', flexShrink: 0, minWidth: 70
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: isPast(s.session_date) ? 'var(--text-muted)' : 'var(--upm-navy)', textTransform: 'uppercase' }}>
                {format(parseISO(s.session_date), 'MMM')}
              </p>
              <p style={{ fontSize: 22, fontWeight: 700, color: isPast(s.session_date) ? 'var(--text-muted)' : 'var(--upm-navy)', lineHeight: 1.1 }}>
                {format(parseISO(s.session_date), 'd')}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {format(parseISO(s.session_date), 'EEE')}
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{s.session_title}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Presenter: {s.profiles?.full_name}
                {s.session_time && ` · ${s.session_time}`}
                {s.venue && ` · ${s.venue}`}
              </p>
              {s.notes && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.notes}</p>}
            </div>
            <span className="badge badge-navy" style={{ fontSize: 11 }}>{sessionTypeLabel[s.session_type]}</span>
            {isStaff && (
              <button className="btn-icon" onClick={() => handleDelete(s.id)} style={{ color: 'var(--danger)' }}>
                <X size={15} />
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add Teaching Session</h2><button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            {error && <div className="alert alert-error" style={{ marginBottom: 12 }}><AlertCircle size={14} />{error}</div>}
            <div className="form-group">
              <label className="form-label">Session Title *</label>
              <input className="form-input" placeholder="e.g. Case Presentation — Hypertension management" value={form.session_title} onChange={e => setForm(p => ({ ...p, session_title: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Session Type</label>
                <select className="form-select" value={form.session_type} onChange={e => setForm(p => ({ ...p, session_type: e.target.value }))}>
                  <option value="case_presentation">Case Presentation</option>
                  <option value="journal_club">Journal Club</option>
                  <option value="seminar">Seminar</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Presenter *</label>
                <select className="form-select" value={form.presenter_id} onChange={e => setForm(p => ({ ...p, presenter_id: e.target.value }))}>
                  <option value="">Select trainee</option>
                  {trainees.map(t => <option key={t.id} value={t.id}>{t.full_name} (Yr {t.training_year})</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-input" type="date" value={form.session_date} onChange={e => setForm(p => ({ ...p, session_date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input className="form-input" type="time" value={form.session_time} onChange={e => setForm(p => ({ ...p, session_time: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Venue</label>
              <input className="form-input" placeholder="e.g. Seminar Room 1, UPM" value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" style={{ minHeight: 60 }} placeholder="Optional notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Add Session'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LeaveRecords({ isStaff, profile }) {
  const [records, setRecords] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ leave_type: 'annual', start_date: '', end_date: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchRecords() }, [])

  const fetchRecords = async () => {
    let q = supabase.from('leave_records').select('*, profiles!leave_records_trainee_id_fkey(full_name)').order('start_date', { ascending: false })
    if (!isStaff) q = q.eq('trainee_id', profile.id)
    const { data } = await q
    setRecords(data || [])
  }

  const handleSubmit = async () => {
    if (!form.start_date || !form.end_date) return
    setSubmitting(true)
    await supabase.from('leave_records').insert({ ...form, trainee_id: profile.id })
    setShowModal(false)
    setForm({ leave_type: 'annual', start_date: '', end_date: '', reason: '' })
    setSubmitting(false)
    fetchRecords()
  }

  const handleStatusUpdate = async (id, status) => {
    await supabase.from('leave_records').update({ status, approved_by: profile.id }).eq('id', id)
    fetchRecords()
  }

  const statusConfig = {
    pending: { label: 'Pending', class: 'badge-amber' },
    approved: { label: 'Approved', class: 'badge-green' },
    rejected: { label: 'Rejected', class: 'badge-red' }
  }

  const leaveTypeLabel = { annual: 'Annual', medical: 'Medical', emergency: 'Emergency', study: 'Study', maternity: 'Maternity', paternity: 'Paternity', other: 'Other' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        {!isStaff && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Apply for Leave</button>}
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {records.length === 0 ? (
          <div className="empty-state"><Clock size={36} /><p>No leave records found</p></div>
        ) : records.map((r, i) => (
          <div key={r.id} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
            borderBottom: i < records.length - 1 ? '1px solid var(--border)' : 'none'
          }}>
            <div style={{ flex: 1 }}>
              {isStaff && <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{r.profiles?.full_name}</p>}
              <p style={{ fontSize: 13 }}>{leaveTypeLabel[r.leave_type]} Leave · {r.days_taken} day{r.days_taken > 1 ? 's' : ''}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {format(parseISO(r.start_date), 'd MMM yyyy')} — {format(parseISO(r.end_date), 'd MMM yyyy')}
              </p>
              {r.reason && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{r.reason}</p>}
            </div>
            <span className={`badge ${statusConfig[r.status]?.class}`}>{statusConfig[r.status]?.label}</span>
            {isStaff && r.status === 'pending' && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm" style={{ background: '#dcfce7', color: '#166534' }} onClick={() => handleStatusUpdate(r.id, 'approved')}><Check size={13} /></button>
                <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b' }} onClick={() => handleStatusUpdate(r.id, 'rejected')}><X size={13} /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Apply for Leave</h2><button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select className="form-select" value={form.leave_type} onChange={e => setForm(p => ({ ...p, leave_type: e.target.value }))}>
                <option value="annual">Annual</option>
                <option value="medical">Medical</option>
                <option value="emergency">Emergency</option>
                <option value="study">Study</option>
                <option value="maternity">Maternity</option>
                <option value="paternity">Paternity</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input className="form-input" type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input className="form-input" type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea className="form-textarea" style={{ minHeight: 80 }} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AssignmentRules({ isStaff, profile }) {
  const [rules, setRules] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchRules() }, [])

  const fetchRules = async () => {
    const { data } = await supabase.from('assignment_rules').select('*').eq('is_active', true).order('applicable_year').order('assignment_type')
    setRules(data || [])
  }

  const typeConfig = {
    FCS: { class: 'badge-navy', label: 'FCS' },
    logbook: { class: 'badge-green', label: 'Logbook' },
    thesis: { class: 'badge-purple', label: 'Thesis' },
    proposal: { class: 'badge-amber', label: 'Proposal' },
    other: { class: 'badge-navy', label: 'Other' }
  }

  const filtered = rules.filter(r => filter === 'all' || r.applicable_year === parseInt(filter))

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', '1', '2', '3', '4'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500,
              background: filter === f ? 'var(--upm-navy)' : 'var(--bg-primary)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${filter === f ? 'var(--upm-navy)' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.15s'
            }}>
            {f === 'all' ? 'All Years' : `Year ${f}`}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(r => (
          <div key={r.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              style={{
                padding: '16px 20px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between', gap: 12,
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <span className={`badge ${typeConfig[r.assignment_type]?.class}`} style={{ fontSize: 11, flexShrink: 0 }}>
                  {typeConfig[r.assignment_type]?.label}
                </span>
                <span className="badge badge-navy" style={{ fontSize: 11, flexShrink: 0 }}>Year {r.applicable_year}</span>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</p>
              </div>
              {expanded === r.id ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
            </div>
            {expanded === r.id && (
              <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)', marginTop: 14, marginBottom: 14 }}>{r.description}</p>
                {r.submission_format && (
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--upm-navy)', marginBottom: 4 }}>SUBMISSION FORMAT</p>
                    <p style={{ fontSize: 13 }}>{r.submission_format}</p>
                  </div>
                )}
                {r.deadline_description && (
                  <div style={{ background: '#fef3c7', borderRadius: 8, padding: '12px 14px', borderLeft: '3px solid var(--upm-gold)' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>DEADLINE</p>
                    <p style={{ fontSize: 13, color: '#78350f' }}>{r.deadline_description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PublicHolidays({ isStaff }) {
  const [holidays, setHolidays] = useState([])

  useEffect(() => {
    supabase.from('public_holidays').select('*').order('holiday_date').then(({ data }) => setHolidays(data || []))
  }, [])

  const upcoming = holidays.filter(h => new Date(h.holiday_date) >= new Date())
  const past = holidays.filter(h => new Date(h.holiday_date) < new Date())

  return (
    <div>
      <h3 style={{ marginBottom: 14 }}>Upcoming Public Holidays — Malaysia 2025</h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        {upcoming.length === 0 ? (
          <div className="empty-state"><p>No upcoming holidays</p></div>
        ) : upcoming.map((h, i) => (
          <div key={h.id} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
            borderBottom: i < upcoming.length - 1 ? '1px solid var(--border)' : 'none'
          }}>
            <div style={{ background: 'var(--upm-light-blue)', borderRadius: 8, padding: '6px 10px', textAlign: 'center', flexShrink: 0, minWidth: 56 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--upm-navy)', textTransform: 'uppercase' }}>{format(parseISO(h.holiday_date), 'MMM')}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--upm-navy)', lineHeight: 1 }}>{format(parseISO(h.holiday_date), 'd')}</p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, fontSize: 14 }}>{h.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(parseISO(h.holiday_date), 'EEEE')} · {h.state === 'national' ? 'National' : h.state.replace('_', ' ')}</p>
            </div>
          </div>
        ))}
      </div>
      {past.length > 0 && (
        <>
          <h3 style={{ marginBottom: 14, color: 'var(--text-secondary)' }}>Past Holidays</h3>
          <div className="card" style={{ padding: 0, overflow: 'hidden', opacity: 0.6 }}>
            {past.map((h, i) => (
              <div key={h.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '10px 20px',
                borderBottom: i < past.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 80 }}>{format(parseISO(h.holiday_date), 'd MMM')}</p>
                <p style={{ fontSize: 13 }}>{h.name}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
