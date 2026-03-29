import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-secondary)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-border)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)'
      }}
    >
      {isDark ? (
        <Moon className="w-4 h-4" fill="currentColor" />
      ) : (
        <Sun className="w-4 h-4" fill="currentColor" />
      )}
    </button>
  )
}
