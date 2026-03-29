import { useEffect, useState } from 'react'
import ProjectCard from '../components/cards/ProjectCard'
import { Project } from '../types'
import { fetchTrendingProjects } from '../services/githubService'
import { TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'

export default function TrendingPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    fetchTrendingProjects()
      .then((data) => { setProjects(data); setLoading(false) })
      .catch((err) => { setError(err.message ?? 'Failed to load trending projects'); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const Skeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="h-64 rounded-2xl animate-pulse"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        />
      ))}
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-6 h-6" style={{ color: 'var(--accent)' }} />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Trending Projects
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Most starred repositories active in the last 7 days — live from the GitHub API.
        </p>
      </div>

      {loading ? (
        <Skeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 opacity-80" />
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
            Failed to load trending projects
          </p>
          <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>
            {error}
          </p>
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24" style={{ color: 'var(--text-muted)' }}>
          <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            No trending projects found
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Try again in a moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}