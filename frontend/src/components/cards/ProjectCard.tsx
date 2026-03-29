import { Star, AlertCircle, Zap, ExternalLink } from 'lucide-react'
import { Project } from '../../types'

interface ProjectCardProps {
  project: Project
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-indigo-600/60 hover:shadow-lg hover:shadow-indigo-900/20 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">{project.owner}</p>
          <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
            {project.name}
          </h3>
        </div>
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-indigo-400 transition-colors mt-0.5 flex-shrink-0"
          aria-label="Open repository"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
        {project.description}
      </p>

      {/* Topics */}
      {project.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-900"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-gray-400">
        {/* Language */}
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: project.languageColor }}
          />
          {project.language}
        </span>

        {/* Stars */}
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-yellow-400" />
          {formatNumber(project.stars)}
        </span>

        {/* Open issues */}
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
          {formatNumber(project.openIssues)} issues
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-800 mt-auto">
        {/* Good first issues badge */}
        {project.goodFirstIssues > 0 ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <Zap className="w-3 h-3" />
            {project.goodFirstIssues} good first issues
          </span>
        ) : (
          <span className="text-xs text-gray-600">No beginner issues</span>
        )}

        {/* CTA button */}
        <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
          View Issues
          {/* TODO: open issue detail drawer/modal */}
        </button>
      </div>

      {/* Last updated */}
      <p className="text-xs text-gray-600 -mt-2">
        Updated {formatDate(project.lastUpdated)}
      </p>
    </div>
  )
}
