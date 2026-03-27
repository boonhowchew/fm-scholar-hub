import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'hooks/useAuth'
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #003366 0%, #001a33 50%, #0d0d1a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: -100, right: -100,
        width: 400, height: 400, borderRadius: '50%',
        background: 'rgba(201,168,76,0.08)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: -150, left: -100,
        width: 500, height: 500, borderRadius: '50%',
        background: 'rgba(0,102,204,0.1)', pointerEvents: 'none'
      }} />
      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '20px',
            background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(201,168,76,0.4)'
          }}>
            <GraduationCap size={36} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            FM Scholar Hub
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
            Department of Family Medicine · UPM
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.97)', borderRadius: 20,
          padding: '36px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ marginBottom: 6, fontSize: 20, color: '#003366' }}>Welcome back</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>
            Sign in to your scholar account
          </p>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: '#94a3b8'
                }} />
                <input className="form-input" type="email" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: 38 }} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: '#94a3b8'
                }} />
                <input className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: 38, paddingRight: 38 }} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#94a3b8', padding: 0
                  }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}
              style={{ justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</>
                : 'Sign In'}
            </button>
          </form>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              Access is managed by the Department of Family Medicine.<br />
              Contact your programme coordinator if you need assistance.
            </p>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
          © 2025 Universiti Putra Malaysia · Department of Family Medicine
        </p>
      </div>
    </div>
  )
}
