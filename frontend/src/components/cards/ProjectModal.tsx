import { X, Star, AlertCircle, Zap, ExternalLink, GitFork, Tag } from 'lucide-react'
import { Project } from '../../types'
import { useEffect } from 'react'

interface ProjectModalProps {
  project: Project
  onClose: () => void
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                {project.owner}
              </p>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {project.name}
              </h2>
            </div>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg flex-shrink-0 mt-1 transition-colors"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-fg)',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--accent)'}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View on GitHub
            </a>
          </div>

          <p className="mt-3 leading-relaxed text-sm" style={{ color: 'var(--text-secondary)' }}>
            {project.description}
          </p>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-3"
          style={{
            borderBottom: '1px solid var(--border)',
          }}
        >
          {[
            { icon: <Star className="w-4 h-4" />, color: '#facc15', value: formatNumber(project.stars), label: 'Stars' },
            { icon: <AlertCircle className="w-4 h-4" />, color: '#f87171', value: formatNumber(project.openIssues), label: 'Open Issues' },
            { icon: <Zap className="w-4 h-4" />, color: '#34d399', value: project.goodFirstIssues, label: 'Good First Issues' },
          ].map(({ icon, color, value, label }, i) => (
            <div
              key={label}
              className="flex flex-col items-center py-4 gap-1"
              style={{
                borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div className="flex items-center gap-1.5 font-semibold text-lg" style={{ color }}>
                {icon}
                <span>{value}</span>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">

          {/* Language + last updated */}
          <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: project.languageColor }}
              />
              {project.language}
            </span>
            <span className="flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              Updated {formatDate(project.lastUpdated)}
            </span>
          </div>

          {/* Topics */}
          {project.topics.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Topics
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.topics.map(topic => (
                  <span
                    key={topic}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: 'var(--accent-subtle)',
                      color: 'var(--accent)',
                      border: '1px solid var(--accent-border)',
                    }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Good first issues */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Good First Issues
                </span>
              </div>
              <a
                href={`${project.repoUrl}/issues?q=is%3Aopen+label%3A%22good+first+issue%22`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs transition-colors"
                style={{ color: 'var(--accent)' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'}
              >
                View all on GitHub →
              </a>
            </div>
            {/* TODO: fetch and render real issues from GitHub API */}
            <div
              className="rounded-xl p-4 text-sm text-center"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              Issue list coming soon — wire up GitHub API here
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Recent Activity
              </span>
            </div>
            {/* TODO: fetch recent commits/PRs from GitHub API */}
            <div
              className="rounded-xl p-4 text-sm text-center"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              Recent commits and PRs coming soon — wire up GitHub API here
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
