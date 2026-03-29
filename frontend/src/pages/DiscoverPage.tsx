import { useEffect, useState } from 'react'
import ProjectCard from '../components/cards/ProjectCard'
import { Project } from '../types'
import { fetchDiscoverProjects } from '../services/githubService'

export default function DiscoverPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDiscoverProjects().then((data) => {
      setProjects(data)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Discover Projects</h1>
        <p className="text-gray-400">
          Find open-source projects looking for contributors.
          {/* TODO: add language/topic filters here */}
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
