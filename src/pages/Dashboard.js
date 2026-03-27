import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'hooks/useAuth'
import { supabase } from 'lib/supabase'
import {
  BookOpen, MessageSquare, Megaphone, CalendarDays,
  ClipboardList, TrendingUp, Clock, CheckCircle,
  AlertCircle, ChevronRight, GraduationCap, FlaskConical
} from 'lucide-react'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '20px' }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: color + '18', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</p>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</p>}
    </div>
  </div>
)

const getYearLabel = (year) => {
  const map = { 1: 'Year 1 — Hospital Posting', 2: 'Year 2 — Hospital Posting + Research', 3: 'Year 3 — Clinic Posting + Pro 2', 4: 'Year 4 — Clinic Posting + Final Viva' }
  return map[year] || `Year ${year}`
}

const getMilestones = (year) => {
  const all = {
    1: [
      { label: 'Family Case Study (FCS) submitted', type: 'assignment' },
      { label: 'FCS approved by supervisor', type: 'assignment' },
      { label: 'Logbook: knowledge competencies', type: 'logbook' },
      { label: 'Logbook: procedural skills', type: 'logbook' },
      { label: 'Professional Exam 1 — Theory (SBA)', type: 'exam' },
      { label: 'Professional Exam 1 — OSCE', type: 'exam' },
    ],
    2: [
      { label: 'Research proposal submitted to supervisor', type: 'research' },
      { label: 'Ethics committee submission', type: 'research' },
      { label: 'Ethics approval received', type: 'research' },
      { label: 'Logbook: knowledge competencies', type: 'logbook' },
      { label: 'Logbook: procedural skills', type: 'logbook' },
    ],
    3: [
      { label: 'Data collection commenced', type: 'research' },
      { label: 'Professional Exam 2 — Theory (SBA + KFQ)', type: 'exam' },
      { label: 'Professional Exam 2 — OSCE + LOSCE', type: 'exam' },
      { label: 'Logbook: knowledge competencies', type: 'logbook' },
    ],
    4: [
      { label: 'Data collection completed', type: 'research' },
      { label: 'Thesis write-up submitted to supervisor', type: 'research' },
      { label: 'Family Case Study (FCS) Year 4 submitted', type: 'assignment' },
      { label: 'Practice Diary completed (60 cases)', type: 'assignment' },
      { label: 'Thesis submitted to Graduate Studies', type: 'research' },
      { label: 'Final Viva Voce — Practice Diary', type: 'exam' },
      { label: 'Final Viva Voce — Thesis Defence', type: 'exam' },
    ]
  }
  return all[year] || []
}

const typeColor = {
  exam: 'var(--danger)',
  assignment: 'var(--upm-navy)',
  logbook: 'var(--success)',
  research: '#7c3aed'
}

const typeLabel = {
  exam: 'Exam',
  assignment: 'Assignment',
  logbook: 'Logbook',
  research: 'Research'
}

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])
  const [threads, setThreads] = useState([])
  const [upcomingRoster, setUpcomingRoster] = useState([])
  const [oncall, setOncall] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [profile])

  const fetchData = async () => {
    const [ann, thr, roster, oc] = await Promise.all([
      supabase.from('announcements').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(3),
      supabase.from('forum_threads').select('*, profiles(full_name), forum_categories(name)').order('created_at', { ascending: false }).limit(4),
      supabase.from('teaching_roster').select('*, profiles!teaching_roster_presenter_id_fkey(full_name)').gte('session_date', new Date().toISOString().split('T')[0]).order('session_date').limit(5),
      supabase.from('oncall_schedule').select('*, profiles!oncall_schedule_trainee_id_fkey(full_name)').gte('call_date', new Date().toISOString().split('T')[0]).order('call_date').limit(5)
    ])
    setAnnouncements(ann.data || [])
    setThreads(thr.data || [])
    setUpcomingRoster(roster.data || [])
    setOncall(oc.data || [])
    setLoading(false)
  }

  const milestones = getMilestones(profile?.training_year)

  const getCategoryBadgeColor = (cat) => {
    const map = { exam: 'badge-red', general: 'badge-navy', cpg: 'badge-green', circular: 'badge-amber', emergency: 'badge-red' }
    return map[cat] || 'badge-navy'
  }

  const getDateLabel = (dateStr) => {
    const d = parseISO(dateStr)
    if (isToday(d)) return 'Today'
    if (isTomorrow(d)) return 'Tomorrow'
    return format(d, 'EEE, d MMM')
  }

  if (loading) return (
    <div className="loading-screen" style={{ height: 'calc(100vh - var(--header-height))' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <p style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</p>
    </div>
  )

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--upm-navy) 0%, #004499 100%)',
        borderRadius: 16, padding: '28px 32px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, boxShadow: '0 4px 20px rgba(0,51,102,0.25)'
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 4 }}>
            {getYearLabel(profile?.training_year)}
          </p>
          <h1 style={{ color: 'white', fontSize: 26, marginBottom: 6 }}>
            Welcome, {profile?.full_name?.split(' ')[0]}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            {profile?.current_posting ? `Current posting: ${profile.current_posting}` : 'Set your current posting in your profile'}
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 12, padding: '12px 20px',
            backdropFilter: 'blur(8px)'
          }}>
            <p style={{ color: 'var(--upm-gold)', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
              TRAINING YEAR
            </p>
            <p style={{ color: 'white', fontSize: 36, fontWeight: 700, lineHeight: 1 }}>
              {profile?.training_year || '—'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>of 4</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon={GraduationCap} label="Training Year" value={profile?.training_year || '—'} color="var(--upm-navy)" />
        <StatCard icon={ClipboardList} label="Milestones" value={milestones.length} color="#7c3aed" sub="this year" />
        <StatCard icon={MessageSquare} label="Forum threads" value={threads.length} color="var(--success)" sub="recent" />
        <StatCard icon={Megaphone} label="Announcements" value={announcements.length} color="var(--warning)" sub="recent" />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Announcements */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '18px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Megaphone size={17} color="var(--upm-navy)" />
              <h3>Latest Announcements</h3>
            </div>
            <button onClick={() => navigate('/announcements')}
              style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div>
            {announcements.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No announcements yet
              </div>
            ) : announcements.map((a, i) => (
              <div key={a.id} onClick={() => navigate('/announcements')}
                style={{
                  padding: '14px 20px', cursor: 'pointer',
                  borderBottom: i < announcements.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{a.title}</p>
                  <span className={`badge ${getCategoryBadgeColor(a.category)}`} style={{ fontSize: 11, flexShrink: 0 }}>
                    {a.category}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {a.content}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {format(new Date(a.created_at), 'd MMM yyyy')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Forum */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '18px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={17} color="var(--upm-navy)" />
              <h3>Recent Forum Activity</h3>
            </div>
            <button onClick={() => navigate('/forum')}
              style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div>
            {threads.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No forum activity yet. Start a discussion!
              </div>
            ) : threads.map((t, i) => (
              <div key={t.id} onClick={() => navigate(`/forum/thread/${t.id}`)}
                style={{
                  padding: '14px 20px', cursor: 'pointer',
                  borderBottom: i < threads.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span className="badge badge-navy" style={{ fontSize: 10 }}>{t.forum_categories?.name}</span>
                </div>
                <p style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{t.title}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  by {t.profiles?.full_name} · {format(new Date(t.created_at), 'd MMM')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Milestones */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={17} color="var(--upm-navy)" />
            <h3>Year {profile?.training_year} Milestones</h3>
          </div>
          <div style={{ padding: '12px 16px', maxHeight: 320, overflowY: 'auto' }}>
            {milestones.map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 4px',
                borderBottom: i < milestones.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <CheckCircle size={16} color="var(--border)" style={{ flexShrink: 0 }} />
                <p style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{m.label}</p>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: typeColor[m.type],
                  background: typeColor[m.type] + '14',
                  padding: '2px 8px', borderRadius: 999, flexShrink: 0
                }}>{typeLabel[m.type]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming roster & on-call */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarDays size={17} color="var(--upm-navy)" />
            <h3>Upcoming Schedule</h3>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {upcomingRoster.length === 0 && oncall.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No upcoming sessions scheduled
              </div>
            ) : (
              <>
                {upcomingRoster.map((r, i) => (
                  <div key={r.id} style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 12
                  }}>
                    <div style={{
                      width: 44, textAlign: 'center', flexShrink: 0,
                      background: 'var(--upm-light-blue)', borderRadius: 8, padding: '6px 4px'
                    }}>
                      <p style={{ fontSize: 11, color: 'var(--upm-navy)', fontWeight: 600 }}>
                        {getDateLabel(r.session_date)}
                      </p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>{r.session_title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Presenter: {r.profiles?.full_name}
                        {r.session_time && ` · ${r.session_time}`}
                      </p>
                    </div>
                    <span className="badge badge-navy" style={{ fontSize: 11 }}>{r.session_type?.replace('_', ' ')}</span>
                  </div>
                ))}
                {oncall.map((oc) => (
                  <div key={oc.id} style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 12
                  }}>
                    <div style={{
                      width: 44, textAlign: 'center', flexShrink: 0,
                      background: '#fef3c7', borderRadius: 8, padding: '6px 4px'
                    }}>
                      <p style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>
                        {getDateLabel(oc.call_date)}
                      </p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>{oc.profiles?.full_name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {oc.posting || 'On-call duty'} · {oc.call_type?.replace('_', ' ')}
                      </p>
                    </div>
                    <span className="badge badge-amber" style={{ fontSize: 11 }}>On-call</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
