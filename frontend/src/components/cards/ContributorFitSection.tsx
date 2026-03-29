import { useEffect, useState } from 'react'
import {
  GitCommit,
  BookOpen,
  Users,
  Calendar,
  Code2,
  Trophy,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { fetchContributorFit, ContributorFit } from '../../services/githubService'
import { fetchUserProfile } from '../../services/userProfileService'

interface Props {
  owner: string
  repo: string
  projectLanguage: string
}

interface Metric {
  label: string
  icon: React.ReactNode
  iconColor: string
  yours: number
  avg: number
  unit: string
  higherIsBetter: boolean
}

function scoreMetric(yours: number, avg: number, higherIsBetter: boolean): number {
  if (avg === 0) return 100
  const ratio = yours / avg
  if (higherIsBetter) {
    // Score 0–100: at avg = 50, double avg = 100, half avg = 25
    return Math.min(100, Math.round(ratio * 50))
  } else {
    // Lower is better (e.g. account age — newer devs are fine)
    return Math.min(100, Math.round((1 / Math.max(ratio, 0.01)) * 50))
  }
}

function overallScore(metrics: Metric[]): number {
  if (metrics.length === 0) return 0
  const total = metrics.reduce(
    (sum, m) => sum + scoreMetric(m.yours, m.avg, m.higherIsBetter),
    0
  )
  return Math.round(total / metrics.length)
}

function scoreColor(score: number): string {
  if (score >= 75) return '#34d399' // green
  if (score >= 45) return '#facc15' // yellow
  return '#f87171'                  // red
}

function scoreLabel(score: number): string {
  if (score >= 75) return 'Great fit'
  if (score >= 45) return 'Decent fit'
  return 'Stretch goal'
}

function MetricRow({ metric }: { metric: Metric }) {
  const score = scoreMetric(metric.yours, metric.avg, metric.higherIsBetter)
  const color = scoreColor(score)
  const barWidth = `${Math.min(100, (metric.yours / Math.max(metric.avg * 1.5, 1)) * 100)}%`
  const avgBarWidth = `${Math.min(100, (metric.avg / Math.max(metric.avg * 1.5, 1)) * 100)}%`

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
          <span style={{ color: metric.iconColor }}>{metric.icon}</span>
          {metric.label}
        </span>
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--text-muted)' }}>
            avg <strong style={{ color: 'var(--text-secondary)' }}>{metric.avg.toLocaleString()}</strong>
            {metric.unit}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            you <strong style={{ color: 'var(--text-primary)' }}>{metric.yours.toLocaleString()}</strong>
            {metric.unit}
          </span>
          <span
            className="font-semibold w-7 text-right"
            style={{ color }}
          >
            {score}
          </span>
        </div>
      </div>

      {/* Stacked bar — avg in background, yours on top */}
      <div
        className="relative h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        {/* avg marker */}
        <div
          className="absolute top-0 left-0 h-full rounded-full opacity-30"
          style={{ width: avgBarWidth, backgroundColor: 'var(--text-muted)' }}
        />
        {/* yours bar */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
          style={{ width: barWidth, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default function ContributorFitSection({ owner, repo, projectLanguage }: Props) {
  const { user } = useAuth()
  const [fit, setFit] = useState<ContributorFit | null>(null)
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const username = user?.user_metadata?.user_name as string | undefined

  useEffect(() => {
    if (!username) { setLoading(false); return }

    setLoading(true)
    setError(null)

    Promise.all([
      fetchContributorFit(owner, repo),
      fetchUserProfile(username),
    ])
      .then(([fitData, userProfile]) => {
        if (!fitData) { setError('Could not load contributor data.'); return }

        setFit(fitData)

        const accountAgeDays = userProfile.stats.createdAt
          ? Math.round((Date.now() - new Date(userProfile.stats.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0

        const builtMetrics: Metric[] = [
          {
            label: 'Repo contributions',
            icon: <GitCommit className="w-3.5 h-3.5" />,
            iconColor: '#818cf8',
            yours: userProfile.recentRepos.reduce((s, r) => s + (r.stargazers_count || 0), 0),
            avg: fitData.avgContributions || 0,
            unit: ' commits',
            higherIsBetter: true,
          },
          {
            label: 'Public repositories',
            icon: <BookOpen className="w-3.5 h-3.5" />,
            iconColor: '#34d399',
            yours: userProfile.stats.publicRepos || 0,
            avg: fitData.avgPublicRepos || 0,
            unit: ' repos',
            higherIsBetter: true,
          },
          {
            label: 'Followers',
            icon: <Users className="w-3.5 h-3.5" />,
            iconColor: '#fb923c',
            yours: userProfile.stats.followers || 0,
            avg: fitData.avgFollowers || 0,
            unit: '',
            higherIsBetter: true,
          },
          {
            label: 'Account age',
            icon: <Calendar className="w-3.5 h-3.5" />,
            iconColor: '#a78bfa',
            yours: accountAgeDays,
            avg: fitData.avgAccountAgeDays || 0,
            unit: ' days',
            higherIsBetter: true,
          },
          {
            label: 'Language match',
            icon: <Code2 className="w-3.5 h-3.5" />,
            iconColor: '#38bdf8',
            yours: userProfile.topLanguages.some(
              l => l.name.toLowerCase() === projectLanguage.toLowerCase()
            ) ? 1 : 0,
            avg: 1,
            unit: '',
            higherIsBetter: true,
          },
        ]

        setMetrics(builtMetrics)
      })
      .catch(err => setError(err.message ?? 'Failed to load fit data'))
      .finally(() => setLoading(false))
  }, [owner, repo, username, projectLanguage])

  if (!user) return (
    <div
      className="rounded-xl p-4 text-xs text-center"
      style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
    >
      Sign in with GitHub to see your contributor fit score
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center gap-2 py-6" style={{ color: 'var(--text-muted)' }}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-xs">Analysing contributor profiles...</span>
    </div>
  )

  if (error) return (
    <div
      className="rounded-xl p-4 text-xs text-center"
      style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
    >
      {error}
    </div>
  )

  const score = overallScore(metrics)
  const color = scoreColor(score)
  const label = scoreLabel(score)

  return (
    <div className="flex flex-col gap-4">
      {/* Overall score banner */}
      <div
        className="rounded-xl p-4 flex items-center justify-between"
        style={{ backgroundColor: 'var(--bg-elevated)', border: `1px solid ${color}33` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}22`, border: `2px solid ${color}` }}
          >
            <Trophy className="w-4 h-4" style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {label}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Based on top {fit?.contributorCount ?? 0} contributors
            </p>
          </div>
        </div>

        {/* Score ring */}
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ 100</span>
        </div>
      </div>

      {/* Metric rows */}
      <div className="flex flex-col gap-3">
        {metrics.map(m => (
          <MetricRow key={m.label} metric={m} />
        ))}
      </div>

      {/* Language match callout */}
      {fit && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Top contributor language:{' '}
          <span style={{ color: 'var(--text-secondary)' }}>{fit.topLanguage}</span>
          {fit.topLanguage.toLowerCase() === projectLanguage.toLowerCase()
            ? ' ✓ matches this project'
            : ` · this project uses ${projectLanguage}`}
        </p>
      )}
    </div>
  )
}
