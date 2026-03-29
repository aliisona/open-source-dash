import React, { useState } from 'react'
import { Github, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import UserProfilePanel from '../profile/UserProfilePanel'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, signInWithGitHub, signOut } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <Github className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              Open Source Dashboard
            </span>
          </div>

          {/* Auth area */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse" />
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
                      className="w-8 h-8 rounded-full border border-gray-700 hover:border-indigo-500 transition-colors"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                      {(user.user_metadata?.user_name ?? 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-gray-300 hidden sm:block hover:text-white transition-colors">
                    {user.user_metadata?.user_name ?? user.email}
                  </span>
                </button>

                {/* Sign out */}
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={signInWithGitHub}
                className="flex items-center gap-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors"
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

      {/* Profile panel — always rendered so CSS transition has an element to animate from */}
      {user && (
        <UserProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
      )}
    </div>
  )
}