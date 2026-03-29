import { X, Star, AlertCircle, Zap, ExternalLink, GitFork, Tag, MessageSquare, User, ChevronDown, ChevronUp } from 'lucide-react'
import ContributorFitSection from './ContributorFitSection'
import { Project, Issue } from '../../types'
import { useEffect, useState } from 'react'
import { fetchRepoIssues } from '../../services/githubService'

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

function IssueRow({ issue }: { issue: Issue }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      onClick={() => issue.body && setExpanded(v => !v)}
      className="flex flex-col gap-2 p-3 rounded-xl transition-colors"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        cursor: issue.body ? 'pointer' : 'default',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-border)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {issue.body && (
            <span className="flex-shrink-0" style={{ color: expanded ? 'var(--accent)' : 'var(--text-muted)' }}>
              {expanded
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          )}
          <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
            #{issue.number} {issue.title}
          </p>
        </div>
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open issue on GitHub"
          onClick={e => e.stopPropagation()}
          className="flex-shrink-0 mt-0.5 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {issue.labels.map(label => (
            <span
              key={label.name}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `#${label.color}22`,
                color: `#${label.color}`,
                border: `1px solid #${label.color}44`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {issue.author}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {issue.comments}
        </span>
        <span>Opened {formatDate(issue.createdAt)}</span>
      </div>

      {/* Expandable description */}
      {expanded && issue.body && (
        <p
          className="text-xs leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto pt-2"
          style={{
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border)',
          }}
        >
          {issue.body}
        </p>
      )}
    </div>
  )
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [issuesLoading, setIssuesLoading] = useState(true)
  const [issuesError, setIssuesError] = useState<string | null>(null)
  const [showGoodFirstOnly, setShowGoodFirstOnly] = useState(false)

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Fetch issues on open and when filter changes
  useEffect(() => {
    setIssuesLoading(true)
    setIssuesError(null)
    fetchRepoIssues(project.owner, project.name, showGoodFirstOnly)
      .then(setIssues)
      .catch(err => setIssuesError(err.message ?? 'Failed to load issues'))
      .finally(() => setIssuesLoading(false))
  }, [project.owner, project.name, showGoodFirstOnly])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
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
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
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
        <div className="grid grid-cols-3" style={{ borderBottom: '1px solid var(--border)' }}>
          {[
            { icon: <Star className="w-4 h-4" />, color: '#facc15', value: formatNumber(project.stars), label: 'Stars' },
            { icon: <AlertCircle className="w-4 h-4" />, color: '#f87171', value: formatNumber(project.openIssues), label: 'Open Issues' },
            { icon: <Zap className="w-4 h-4" />, color: '#34d399', value: project.goodFirstIssues, label: 'Good First Issues' },
          ].map(({ icon, color, value, label }, i) => (
            <div
              key={label}
              className="flex flex-col items-center py-4 gap-1"
              style={{ borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}
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
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.languageColor }} />
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
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
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

          {/* Contributor Fit */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Contributor Fit
              </span>
            </div>
            <ContributorFitSection
              owner={project.owner}
              repo={project.name}
              projectLanguage={project.language}
            />
          </div>

          {/* Issues section */}
          <div>
            {/* Section header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Open Issues
                </span>
              </div>

              {/* Filter toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGoodFirstOnly(false)}
                  className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                  style={{
                    backgroundColor: !showGoodFirstOnly ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: !showGoodFirstOnly ? 'var(--accent-fg)' : 'var(--text-secondary)',
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => setShowGoodFirstOnly(true)}
                  className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                  style={{
                    backgroundColor: showGoodFirstOnly ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: showGoodFirstOnly ? 'var(--accent-fg)' : 'var(--text-secondary)',
                  }}
                >
                  Good First Issues
                </button>

              </div>
            </div>

            {/* Loading skeletons */}
            {issuesLoading && (
              <div className="flex flex-col gap-2 animate-pulse">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="h-20 rounded-xl"
                    style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  />
                ))}
              </div>
            )}

            {/* Error */}
            {!issuesLoading && issuesError && (
              <div
                className="rounded-xl p-4 text-sm text-center"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                {issuesError}
              </div>
            )}

            {/* Empty */}
            {!issuesLoading && !issuesError && issues.length === 0 && (
              <div
                className="rounded-xl p-5 text-sm text-center flex flex-col items-center gap-3"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                <p style={{ color: 'var(--text-muted)' }}>
                  {showGoodFirstOnly
                    ? 'No good first issues found for this project.'
                    : 'No open issues found.'}
                </p>
                {showGoodFirstOnly && (
                  <button
                    onClick={() => setShowGoodFirstOnly(false)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)'}
                  >
                    View all issues instead
                  </button>
                )}
              </div>
            )}

            {/* Issue list */}
            {!issuesLoading && !issuesError && issues.length > 0 && (
              <div className="flex flex-col gap-2">
                {issues.map(issue => (
                  <IssueRow key={issue.id} issue={issue} />
                ))}
              </div>
            )}

            {/* View all link */}
            {!issuesLoading && issues.length > 0 && (
              <a
                href={`${project.repoUrl}/issues${showGoodFirstOnly ? '?q=is%3Aopen+label%3A%22good+first+issue%22' : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs mt-3 transition-colors"
                style={{ color: 'var(--accent)' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'}
              >
                View all on GitHub →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
