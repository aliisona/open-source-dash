import { useEffect, useRef, useState } from 'react'
import ProjectCard from '../components/cards/ProjectCard'
import Pagination from '../components/ui/Pagination'
import { Project } from '../types'
import { fetchDiscoverProjects } from '../services/githubService'
import { AlertCircle, ArrowDown, GitPullRequest, Star, Users } from 'lucide-react'

const PAGE_SIZE = 12
const TOTAL_PAGES = 3

export default function DiscoverPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const gridRef = useRef<HTMLDivElement>(null)

  const paginated = projects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
      {/* ── Hero Section ── */}
      <div
        className="rounded-2xl px-8 py-14 mb-12 text-center relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Subtle background glow */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, var(--accent) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
          {/* Badge */}
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent)',
              border: '1px solid var(--accent-border)',
            }}
          >
            <img src="/soup.webp" alt="sopu" className="inline w-4 h-4 mr-1" style={{ imageRendering: 'pixelated' }} /> sopu dash
          </span>

          {/* Headline */}
          <h1
            className="text-4xl font-bold leading-tight tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            welcome to sopu dash!
          </h1>

          {/* Subtext */}
          <p
            className="text-base leading-relaxed max-w-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            sopu is your home for finding open-source projects to contribute to.
            browse repos with good first issues, save the ones you love, and
            start making an impact — one pull request at a time.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-2">
              <GitPullRequest className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Good first issues
            </span>
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Trending repos
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Save & track
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={scrollToGrid}
            className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)'}
          >
            Browse Projects
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Project Grid ── */}
      <div ref={gridRef}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Beginner-friendly repositories
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Pulled live from GitHub · updated every hour
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
              Try again in a moment.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginated.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            {projects.length > PAGE_SIZE && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.min(TOTAL_PAGES, Math.ceil(projects.length / PAGE_SIZE))}
                onPageChange={handlePageChange}
                githubExploreUrl="https://github.com/explore"
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
