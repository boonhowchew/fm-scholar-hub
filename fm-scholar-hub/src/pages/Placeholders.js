import React from 'react'
import { BookOpen, FlaskConical, Newspaper, Settings, CalendarDays } from 'lucide-react'

const ComingSoon = ({ icon: Icon, title, description, phase, features }) => (
  <div>
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ marginBottom: 4 }}>{title}</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{description}</p>
    </div>
    <div style={{
      background: 'linear-gradient(135deg, var(--upm-navy) 0%, #004499 100%)',
      borderRadius: 16, padding: '40px 36px', textAlign: 'center',
      color: 'white', marginBottom: 24
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        <Icon size={28} color="white" />
      </div>
      <h2 style={{ color: 'white', marginBottom: 8, fontSize: 22 }}>Coming in {phase}</h2>
      <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
        This section is under development and will be available soon.
        Phase 1 is being deployed first to establish the foundation.
      </p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
      {features.map((f, i) => (
        <div key={i} className="card" style={{ padding: '16px 18px' }}>
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: 'var(--upm-navy)' }}>{f.name}</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
        </div>
      ))}
    </div>
  </div>
)

export function ExamPrep() {
  return <ComingSoon
    icon={BookOpen} title="Exam Preparation" phase="Phase 2"
    description="AI-powered SBA, KFQ, OSCE and LOSCE preparation tools"
    features={[
      { name: 'SBA Arena', desc: 'Domain-mapped SBA practice with commit-first rule and timed exam mode for Pro 1 and Pro 2' },
      { name: 'KFQ Reasoning Lab', desc: 'Clinical scenario reasoning with 1:3 MCQ format and structured debrief' },
      { name: 'OSCE Prep Studio', desc: 'Communication, psychomotor, skills and telephone station simulators' },
      { name: 'LOSCE Coach', desc: '20-minute case simulator — Acute, Chronic, Child and Women consultations' },
      { name: 'Final Viva Simulator', desc: 'Panel 1 and Panel 2 practice — prescribing, prevention, LTC, investigations, ethics' },
      { name: 'Practice Diary Coach', desc: 'Reflective prompts per case entry with 60-case coverage tracker' },
    ]}
  />
}

export function Research() {
  return <ComingSoon
    icon={FlaskConical} title="Research & EBM" phase="Phase 3"
    description="Evidence-based medicine, biostatistics and thesis journey support"
    features={[
      { name: 'EBM Learning Path', desc: 'Principles of evidence-based medicine and clinical epidemiology linked to NotebookLM resources' },
      { name: 'Biostatistics Companion', desc: 'Conceptual learning and applied exercises with interactive worked examples' },
      { name: 'Research Methodology Hub', desc: 'Stage-gated support from proposal design to thesis write-up' },
      { name: 'Thesis Journey Tracker', desc: 'Proposal → Ethics → Data collection → Analysis → Write-up → Viva' },
      { name: 'Research Proposal Coach', desc: 'Structured prompting for Year 2 research proposal design' },
      { name: 'Statistical Analysis Guide', desc: 'Choosing the right test, interpreting results, reporting standards' },
    ]}
  />
}

export function PrimaryCare() {
  return <ComingSoon
    icon={Newspaper} title="Primary Care Updates" phase="Phase 3"
    description="Emerging guidelines, CPG updates and FM news relevant to Malaysia"
    features={[
      { name: 'CPG Spotlight', desc: 'Featured Malaysian clinical practice guideline with application questions' },
      { name: 'FM News Digest', desc: 'Curated weekly updates from AFPM, MOH Malaysia, WONCA and key journals' },
      { name: 'Emerging Issues Tracker', desc: 'Emerging conditions and public health alerts relevant to primary care' },
      { name: 'NotebookLM Library', desc: 'Direct access to all CPG and research methodology NotebookLM sources' },
    ]}
  />
}

export function StaffTools() {
  return <ComingSoon
    icon={Settings} title="Staff Tools" phase="Phase 4"
    description="Supervisor dashboard, trainee monitoring and formation tracking"
    features={[
      { name: 'Cohort Dashboard', desc: 'Engagement patterns, logbook gaps, exam readiness signals across all trainees' },
      { name: 'Individual Trainee View', desc: 'One-page trainee summary before supervision sessions' },
      { name: 'Flag & Alert System', desc: 'Inactivity alerts, logbook mismatch detection, approaching deadlines' },
      { name: 'Supervision Brief', desc: 'Auto-generated trainee summary before a scheduled supervision session' },
      { name: 'Logbook Oversight', desc: 'Track knowledge and procedural skills completion across cohort' },
    ]}
  />
}

export function Schedule() {
  return <ComingSoon
    icon={CalendarDays} title="Schedule & Roster" phase="Phase 1 — in Admin Tools"
    description="The teaching roster, on-call schedule and calendar view"
    features={[
      { name: 'Teaching Roster', desc: 'View in Admin Tools → Teaching Roster tab' },
      { name: 'On-call Schedule', desc: 'Full calendar view of on-call duties coming soon' },
      { name: 'Integrated Calendar', desc: 'Combined view of all sessions, leave and public holidays' },
    ]}
  />
}
