import { useEffect, useState, useRef, useCallback } from 'react'
import { X, Star, GitFork, MapPin, Users, BookOpen, ExternalLink, Code } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { fetchUserProfile, UserProfile, TopLanguage, GitHubRepo } from '../../services/userProfileService'

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  CSS: '#38bdf8',
  HTML: '#e34c26',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  'C++': '#f34b7d',
  C: '#555555',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Vue: '#41b883',
  Svelte: '#ff3e00',
}

interface UserProfilePanelProps {
  open: boolean
  onClose: () => void
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center bg-gray-800/60 rounded-xl p-3 gap-1">
      <span className="text-lg font-bold text-white">{value}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  )
}

function LanguageBar({ lang }: { lang: TopLanguage }) {
  const color = LANGUAGE_COLORS[lang.name] ?? '#888888'
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5 w-28 flex-shrink-0">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-sm text-gray-300 truncate">{lang.name}</span>
      </span>
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${lang.percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{lang.percentage}%</span>
    </div>
  )
}

function RepoRow({ repo }: { repo: GitHubRepo }) {
  const color = LANGUAGE_COLORS[repo.language ?? ''] ?? '#888888'
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-800/40 hover:bg-gray-800 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 group-hover:text-indigo-300 transition-colors truncate">
          {repo.name}
        </p>
        {repo.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{repo.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
          {repo.language && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            {repo.stargazers_count}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="w-3 h-3" />
            {repo.forks_count}
          </span>
        </div>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 flex-shrink-0 mt-0.5 transition-colors" />
    </a>
  )
}

export default function UserProfilePanel({ open, onClose }: UserProfilePanelProps) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const [rendered, setRendered] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const username = user?.user_metadata?.user_name as string | undefined

  // When open becomes true, render first then use double rAF so the browser
  // paints the off-screen starting position before animating in
  useEffect(() => {
    if (open) {
      setRendered(true)
      let frame2: number
      const frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => setVisible(true))
      })
      return () => {
        cancelAnimationFrame(frame1)
        cancelAnimationFrame(frame2)
      }
    } else {
      setVisible(false)
      const timeout = setTimeout(() => setRendered(false), 420)
      return () => clearTimeout(timeout)
    }
  }, [open])

  // Animate out then call onClose — wait for transition to finish
  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 420)
  }, [onClose])

  // Fetch profile only when opened
  const hasFetched = useRef(false)

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleClose])

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
    }, 100)
    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [handleClose])

  // Fetch profile once when first opened
  useEffect(() => {
    if (!open || !username || hasFetched.current) return
    hasFetched.current = true
    setLoading(true)
    setError(null)
    fetchUserProfile(username)
      .then(setProfile)
      .catch((err) => setError(err.message ?? 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [open, username])

  if (!rendered) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
      />

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col overflow-hidden"
        style={{
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.35s ease',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 flex-shrink-0">
          <span className="text-sm font-semibold text-white">Your Profile</span>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-white transition-colors"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">

          {loading && (
            <div className="flex flex-col gap-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-800" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-4 bg-gray-800 rounded w-32" />
                  <div className="h-3 bg-gray-800 rounded w-24" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(i => <div key={i} className="h-16 bg-gray-800 rounded-xl" />)}
              </div>
              <div className="h-32 bg-gray-800 rounded-xl" />
              <div className="h-48 bg-gray-800 rounded-xl" />
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-red-400 text-sm">
              <p>{error}</p>
              <p className="text-gray-500 text-xs mt-2">
                Make sure you're signed in with GitHub.
              </p>
            </div>
          )}

          {!loading && !error && profile && (
            <>
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <img
                  src={profile.stats.avatarUrl}
                  alt={profile.stats.login}
                  className="w-16 h-16 rounded-full border-2 border-gray-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-white truncate">
                    {profile.stats.name ?? profile.stats.login}
                  </p>
                  <a
                    href={profile.stats.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    @{profile.stats.login}
                  </a>
                  {profile.stats.bio && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{profile.stats.bio}</p>
                  )}
                </div>
              </div>

              {/* Location / company */}
              {(profile.stats.location || profile.stats.company) && (
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  {profile.stats.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {profile.stats.location}
                    </span>
                  )}
                  {profile.stats.company && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {profile.stats.company}
                    </span>
                  )}
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2">
                <StatBox label="Repos" value={profile.stats.publicRepos} />
                <StatBox label="Followers" value={profile.stats.followers} />
                <StatBox label="Stars" value={profile.totalStars} />
              </div>

              {/* Top languages */}
              {profile.topLanguages.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Top Languages
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {profile.topLanguages.map((lang) => (
                      <LanguageBar key={lang.name} lang={lang} />
                    ))}
                  </div>
                </div>
              )}

              {/* Recent repos */}
              {profile.recentRepos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Recent Repositories
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {profile.recentRepos.map((repo) => (
                      <RepoRow key={repo.id} repo={repo} />
                    ))}
                  </div>
                </div>
              )}

              {/* TODO: Compare with top contributors of viewed projects */}
              {/* TODO: Connect to Hex or Gemini for fit analysis */}
              <div className="rounded-xl border border-dashed border-gray-700 p-4 text-center text-xs text-gray-600">
                🚀 Contributor comparison + AI fit analysis coming soon
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
