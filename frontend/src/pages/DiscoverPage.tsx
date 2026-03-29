import { useEffect, useState } from 'react'
import ProjectCard from '../components/cards/ProjectCard'
import { Project } from '../types'
import { fetchDiscoverProjects } from '../services/githubService'
import { AlertCircle } from 'lucide-react'

export default function DiscoverPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    fetchDiscoverProjects()
      .then((data) => { setProjects(data); setLoading(false) })
      .catch((err) => {
        console.error(err)
        setError('Failed to load projects from GitHub. Check your token or try again.')
        setLoading(false)
      })
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
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Discover Projects
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Beginner-friendly open-source repositories with good first issues — pulled live from GitHub.
        </p>
      </div>

      {loading ? (
        <Skeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <AlertCircle className="w-10 h-10 text-red-400 opacity-70" />
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={load}
            className="mt-2 text-sm px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)'}
          >
            Retry
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            No projects found
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Try adjusting the search filters in githubService.ts
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