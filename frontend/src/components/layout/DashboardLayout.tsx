import React, { useState } from 'react'
import { Github, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import UserProfilePanel from '../profile/UserProfilePanel'
import ThemeToggle from '../ui/ThemeToggle'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, signInWithGitHub, signOut } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 backdrop-blur-sm"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-1.5" style={{ backgroundColor: 'var(--accent)' }}>
              <Github className="w-5 h-5" style={{ color: 'var(--accent-fg)' }} />
            </div>
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Open Source Dashboard
            </span>
          </div>

          {/* Auth area */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {loading ? (
              <div
                className="w-8 h-8 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--bg-elevated)' }}
              />
            ) : user ? (
              <>
                {/* Clickable avatar + username — opens profile panel */}
                <button
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  aria-label="Open profile"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata.user_name ?? 'User'}
                      className="w-8 h-8 rounded-full transition-colors"
                      style={{ border: '1px solid var(--border-subtle)' }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
                    >
                      {(user.user_metadata?.user_name ?? 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span
                    className="text-sm hidden sm:block transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {user.user_metadata?.user_name ?? user.email}
                  </span>
                </button>

                {/* Sign out */}
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)'
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-elevated)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)'
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={signInWithGitHub}
                className="flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)'}
              >
                <LogIn className="w-4 h-4" />
                Sign in with GitHub
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Profile panel */}
      {user && (
        <UserProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
      )}
    </div>
  )
}