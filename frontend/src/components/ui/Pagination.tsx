import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  githubExploreUrl?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  githubExploreUrl = 'https://github.com/explore',
}: PaginationProps) {
  const isFirst = currentPage === 1
  const isLast = currentPage === totalPages

  return (
    <div className="flex items-center justify-between mt-10 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
        }}
        onMouseEnter={e => {
          if (!isFirst) {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-border)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
        }}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      {/* Page indicators */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1
          const isActive = page === currentPage
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-surface)',
                color: isActive ? 'var(--accent-fg)' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-border)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
                }
              }}
            >
              {page}
            </button>
          )
        })}
      </div>

      {/* Next or GitHub Explore on last page */}
      {isLast ? (
        <a
          href={githubExploreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-fg)',
            border: '1px solid var(--accent)',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--accent-hover)'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--accent)'}
        >
          Explore on GitHub
          <ExternalLink className="w-4 h-4" />
        </a>
      ) : (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-border)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
          }}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
