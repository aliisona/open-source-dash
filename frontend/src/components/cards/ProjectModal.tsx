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
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal panel — stop click propagation so clicking inside doesn't close */}
      <div
        className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-800">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">{project.owner}</p>
              <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            </div>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex-shrink-0 mt-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View on GitHub
            </a>
          </div>

          {/* Description */}
          <p className="mt-3 text-gray-400 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-gray-800 border-b border-gray-800">
          <div className="flex flex-col items-center py-4 gap-1">
            <div className="flex items-center gap-1.5 text-yellow-400">
              <Star className="w-4 h-4" />
              <span className="text-lg font-semibold">{formatNumber(project.stars)}</span>
            </div>
            <span className="text-xs text-gray-500">Stars</span>
          </div>
          <div className="flex flex-col items-center py-4 gap-1">
            <div className="flex items-center gap-1.5 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-lg font-semibold">{formatNumber(project.openIssues)}</span>
            </div>
            <span className="text-xs text-gray-500">Open Issues</span>
          </div>
          <div className="flex flex-col items-center py-4 gap-1">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Zap className="w-4 h-4" />
              <span className="text-lg font-semibold">{project.goodFirstIssues}</span>
            </div>
            <span className="text-xs text-gray-500">Good First Issues</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">

          {/* Language + last updated */}
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: project.languageColor }}
              />
              {project.language}
            </span>
            <span className="flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-gray-500" />
              Updated {formatDate(project.lastUpdated)}
            </span>
          </div>

          {/* Topics */}
          {project.topics.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Topics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.topics.map((topic) => (
                  <span
                    key={topic}
                    className="text-xs px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-900"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Good first issues placeholder */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Good First Issues
                </span>
              </div>
              <a
                href={`${project.repoUrl}/issues?q=is%3Aopen+label%3A%22good+first+issue%22`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View all on GitHub →
              </a>
            </div>
            {/* TODO: fetch and render real issues from GitHub API */}
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 text-sm text-gray-500 text-center">
              Issue list coming soon — wire up GitHub API here
            </div>
          </div>

          {/* Recent activity placeholder */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recent Activity
              </span>
            </div>
            {/* TODO: fetch recent commits/PRs from GitHub API */}
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 text-sm text-gray-500 text-center">
              Recent commits and PRs coming soon — wire up GitHub API here
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
