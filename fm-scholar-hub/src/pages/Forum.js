import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from 'hooks/useAuth'
import { supabase } from 'lib/supabase'
import { MessageSquare, Plus, ArrowLeft, Send, Pin, Lock, Eye, X, AlertCircle, ChevronRight } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

export function ThreadList() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [threads, setThreads] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category_id: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchThreads(null)
    const channel = supabase.channel('forum-threads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_threads' }, () => fetchThreads(null))
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('forum_categories').select('*').order('sort_order')
    setCategories(data || [])
  }

  const fetchThreads = async (catId) => {
    let q = supabase.from('forum_threads')
      .select('*, profiles(full_name, role), forum_categories(name)')
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(30)
    if (catId) q = q.eq('category_id', catId)
    const { data } = await q
    setThreads(data || [])
  }

  const handleCatFilter = (cat) => {
    setSelectedCat(cat?.id || null)
    fetchThreads(cat?.id || null)
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim() || !form.category_id) {
      setError('Please fill in all fields.'); return
    }
    setSubmitting(true); setError('')
    const { error } = await supabase.from('forum_threads').insert({ ...form, author_id: profile.id })
    if (error) { setError(error.message); setSubmitting(false); return }
    setShowModal(false)
    setForm({ title: '', content: '', category_id: '' })
    setSubmitting(false)
    fetchThreads(selectedCat)
  }

  const getRoleColor = (role) => {
    if (role === 'academic_staff') return 'var(--upm-gold)'
    if (role === 'admin') return '#7c3aed'
    return 'var(--upm-navy)'
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Forum</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Discuss clinical cases, research, exam prep and more</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Thread</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => handleCatFilter(null)} style={{
          padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
          background: !selectedCat ? 'var(--upm-navy)' : 'var(--bg-primary)',
          color: !selectedCat ? 'white' : 'var(--text-secondary)',
          border: `1px solid ${!selectedCat ? 'var(--upm-navy)' : 'var(--border)'}`,
          cursor: 'pointer'
        }}>All Topics</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => handleCatFilter(c)} style={{
            padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
            background: selectedCat === c.id ? 'var(--upm-navy)' : 'var(--bg-primary)',
            color: selectedCat === c.id ? 'white' : 'var(--text-secondary)',
            border: `1px solid ${selectedCat === c.id ? 'var(--upm-navy)' : 'var(--border)'}`,
            cursor: 'pointer'
          }}>{c.name}</button>
        ))}
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {threads.length === 0 ? (
          <div className="empty-state" style={{ padding: 60 }}>
            <MessageSquare size={40} />
            <h3>No threads yet</h3>
            <p style={{ fontSize: 13 }}>Be the first to start a discussion.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Start a thread</button>
          </div>
        ) : threads.map((t, i) => (
          <div key={t.id} onClick={() => navigate(`/forum/thread/${t.id}`)}
            style={{
              padding: '16px 20px', cursor: 'pointer',
              borderBottom: i < threads.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', alignItems: 'center', gap: 14, transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: getRoleColor(t.profiles?.role),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 13, fontWeight: 600, flexShrink: 0
            }}>
              {t.profiles?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                {t.is_pinned && <Pin size={13} color="var(--upm-gold)" />}
                {t.is_locked && <Lock size={13} color="var(--text-muted)" />}
                <span className="badge badge-navy" style={{ fontSize: 10 }}>{t.forum_categories?.name}</span>
              </div>
              <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }} className="truncate">{t.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {t.profiles?.full_name}
                {t.profiles?.role === 'academic_staff' && <span style={{ color: 'var(--upm-gold)', fontWeight: 600 }}> · Staff</span>}
                {' · '}{formatDistanceToNow(new Date(t.updated_at), { addSuffix: true })}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                <Eye size={13} />{t.views || 0}
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Thread</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}><AlertCircle size={15} />{error}</div>}
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                <option value="">Select a category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="Thread title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea className="form-textarea" placeholder="Write your post here..." style={{ minHeight: 160 }} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Posting...' : 'Post Thread'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ThreadDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [thread, setThread] = useState(null)
  const [replies, setReplies] = useState([])
  const [newReply, setNewReply] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchThread()
    fetchReplies()
    const channel = supabase.channel(`thread-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_replies', filter: `thread_id=eq.${id}` }, () => fetchReplies())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [id])

  const fetchThread = async () => {
    const { data } = await supabase.from('forum_threads')
      .select('*, profiles(full_name, role), forum_categories(name)').eq('id', id).single()
    setThread(data)
    setLoading(false)
    if (data) await supabase.from('forum_threads').update({ views: (data.views || 0) + 1 }).eq('id', id)
  }

  const fetchReplies = async () => {
    const { data } = await supabase.from('forum_replies')
      .select('*, profiles(full_name, role)').eq('thread_id', id).order('created_at')
    setReplies(data || [])
  }

  const handleReply = async () => {
    if (!newReply.trim()) return
    setSubmitting(true)
    await supabase.from('forum_replies').insert({ thread_id: id, content: newReply.trim(), author_id: profile.id })
    await supabase.from('forum_threads').update({ updated_at: new Date().toISOString() }).eq('id', id)
    setNewReply('')
    setSubmitting(false)
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  const getRoleColor = (role) => {
    if (role === 'academic_staff') return 'var(--upm-gold)'
    if (role === 'admin') return '#7c3aed'
    return 'var(--upm-navy)'
  }

  if (loading) return <div className="loading-screen" style={{ height: 400 }}><div className="spinner" /></div>
  if (!thread) return <div className="empty-state card"><p>Thread not found</p></div>

  return (
    <div>
      <button onClick={() => navigate('/forum')} className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to Forum
      </button>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span className="badge badge-navy" style={{ fontSize: 11 }}>{thread.forum_categories?.name}</span>
          {thread.is_pinned && <span className="badge badge-gold" style={{ fontSize: 11 }}>Pinned</span>}
          {thread.is_locked && <span className="badge badge-red" style={{ fontSize: 11 }}>Locked</span>}
        </div>
        <h2 style={{ marginBottom: 16, fontSize: 20 }}>{thread.title}</h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div className="avatar" style={{ background: getRoleColor(thread.profiles?.role) }}>
            {getInitials(thread.profiles?.full_name)}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14 }}>
              {thread.profiles?.full_name}
              {thread.profiles?.role === 'academic_staff' && <span style={{ color: 'var(--upm-gold)', fontSize: 12 }}> · Academic Staff</span>}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(thread.created_at), 'd MMM yyyy, h:mm a')}</p>
          </div>
        </div>
        <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8, padding: '16px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
          {thread.content}
        </div>
      </div>
      {replies.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ marginBottom: 12, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h4>
          {replies.map(r => (
            <div key={r.id} className="card" style={{ marginBottom: 10, padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="avatar avatar-sm" style={{ background: getRoleColor(r.profiles?.role) }}>
                  {getInitials(r.profiles?.full_name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>
                      {r.profiles?.full_name}
                      {r.profiles?.role === 'academic_staff' && <span style={{ color: 'var(--upm-gold)', fontSize: 11 }}> · Staff</span>}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</p>
                    {r.is_solution && <span className="badge badge-green" style={{ fontSize: 11 }}>Solution</span>}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{r.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!thread.is_locked ? (
        <div className="card">
          <h4 style={{ marginBottom: 12 }}>Post a reply</h4>
          <textarea className="form-textarea" placeholder="Share your thoughts..." style={{ minHeight: 120, marginBottom: 12 }}
            value={newReply} onChange={e => setNewReply(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleReply() }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ctrl+Enter to post</p>
            <button className="btn btn-primary" onClick={handleReply} disabled={submitting || !newReply.trim()}>
              <Send size={14} /> {submitting ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      ) : (
        <div className="alert alert-info"><Lock size={15} /> This thread has been locked.</div>
      )}
    </div>
  )
}
