import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{
        marginLeft: 'var(--sidebar-width)',
        flex: 1, display: 'flex', flexDirection: 'column',
        minHeight: '100vh', background: 'var(--bg-tertiary)'
      }}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1200, width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
