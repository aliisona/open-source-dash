import { useEffect, useState } from 'react'
import ProjectCard from '../components/cards/ProjectCard'
import { Project } from '../types'
import { fetchTrendingProjects } from '../services/githubService'
import { TrendingUp } from 'lucide-react'

export default function TrendingPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingProjects().then((data) => {
      setProjects(data)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Trending Projects</h1>
        </div>
        <p className="text-gray-400">
          Most active and starred repositories right now.
          {/* TODO: wire to GitHub trending API or star-velocity metric */}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-900 rounded-2xl animate-pulse border border-gray-800" />
          ))}
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
