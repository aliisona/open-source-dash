import { useEffect, useState } from 'react'
import ProjectCard from '../components/cards/ProjectCard'
import { Project } from '../types'
import { fetchSavedProjects } from '../services/githubService'
import { Bookmark } from 'lucide-react'

export default function SavedPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSavedProjects().then((data) => {
      setProjects(data)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Saved Projects</h1>
        </div>
        <p className="text-gray-400">
          Projects you've bookmarked for later.
          {/* TODO: persist saved projects to localStorage or backend */}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-900 rounded-2xl animate-pulse border border-gray-800" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No saved projects yet</p>
          <p className="text-sm mt-1">Head to Discover to find something interesting.</p>
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
