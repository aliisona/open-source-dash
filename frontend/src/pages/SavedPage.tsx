import { useEffect, useState } from 'react'
import ProjectCard from '../components/cards/ProjectCard'
import { Project } from '../types'
import { getSavedProjects } from '../services/savedProjectsService'
import { useAuth } from '../context/AuthContext'
import { Bookmark, LogIn } from 'lucide-react'

export default function SavedPage() {
  const { user, loading: authLoading, signInWithGitHub } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    getSavedProjects()
      .then((data) => {
        setProjects(data)
      })
      .catch((err) => {
        setError(err.message ?? 'Failed to load saved projects.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user, authLoading])

  const handleUnsave = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Saved Projects</h1>
        </div>
        <p className="text-gray-400">Projects you've bookmarked for later.</p>
      </div>

      {/* Not signed in */}
      {!authLoading && !user && (
        <div className="text-center py-24 text-gray-500">
          <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium text-gray-300">Sign in to save projects</p>
          <p className="text-sm mt-1 mb-6">Your saved projects will sync across devices.</p>
          <button
            onClick={signInWithGitHub}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign in with GitHub
          </button>
        </div>
      )}

      {/* Loading */}
      {(authLoading || loading) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-900 rounded-2xl animate-pulse border border-gray-800" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-16 text-red-400">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !authLoading && user && !error && projects.length === 0 && (
        <div className="text-center py-24 text-gray-500">
          <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No saved projects yet</p>
          <p className="text-sm mt-1">Head to Discover and click the bookmark icon on any project.</p>
        </div>
      )}

      {/* Project grid */}
      {!loading && !authLoading && user && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onUnsave={handleUnsave}
            />
          ))}
        </div>
      )}
    </div>
  )
}
