import { useState, useEffect } from 'react'
import { Star, AlertCircle, Zap, ExternalLink, Bookmark } from 'lucide-react'
import { Project } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { saveProject, unsaveProject, isProjectSaved } from '../../services/savedProjectsService'
import ProjectModal from './ProjectModal'

interface ProjectCardProps {
  project: Project
  onUnsave?: (projectId: string) => void
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectCard({ project, onUnsave }: ProjectCardProps) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [savingLoading, setSavingLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!user) { setSaved(false); return }
    isProjectSaved(project.id, user.id)
      .then(setSaved)
      .catch(() => setSaved(false))
  }, [project.id, user])

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return
    setSavingLoading(true)
    try {
      if (saved) {
        await unsaveProject(project.id, user.id)
        setSaved(false)
        onUnsave?.(project.id)
      } else {
        await saveProject(project, user.id)
        setSaved(true)
      }
    } catch (err) {
      console.error('Failed to update saved project:', err)
    } finally {
      setSavingLoading(false)
    }
  }

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="group cursor-pointer rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-border)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px -8px color-mix(in srgb, var(--accent) 20%, transparent)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>
              {project.owner}
            </p>
            <h3
              className="text-base font-semibold transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              {project.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
            {user && (
              <button
                onClick={handleBookmark}
                disabled={savingLoading}
                aria-label={saved ? 'Unsave project' : 'Save project'}
                className="transition-colors disabled:opacity-40"
                style={{ color: saved ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                <Bookmark
                  className="w-4 h-4"
                  fill={saved ? 'var(--accent)' : 'none'}
                />
              </button>
            )}
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="transition-colors"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Open repository"
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {project.description}
        </p>

        {/* Topics */}
        {project.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.topics.slice(0, 4).map(topic => (
              <span
                key={topic}
                className="text-xs px-2 py-0.5 rounded-full"
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
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.languageColor }}
            />
            {project.language}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            {formatNumber(project.stars)}
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            {formatNumber(project.openIssues)} issues
          </span>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-2 mt-auto"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {project.goodFirstIssues > 0 ? (
            <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
              <Zap className="w-3 h-3" />
              {project.goodFirstIssues} good first issues
            </span>
          ) : (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No beginner issues
            </span>
          )}
          <button
            onClick={e => { e.stopPropagation(); setModalOpen(true) }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-fg)',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)'}
          >
            View Issues
          </button>
        </div>

        {/* Last updated */}
        <p className="text-xs -mt-2" style={{ color: 'var(--text-muted)' }}>
          Updated {formatDate(project.lastUpdated)}
        </p>
      </div>

      {modalOpen && (
        <ProjectModal project={project} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}