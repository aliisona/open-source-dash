import type { VercelRequest, VercelResponse } from '@vercel/node'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Router, Request, Response } from 'express'
import axios from 'axios'

dotenv.config()

// ─── In-memory cache ────────────────────────────────────────────────────────

interface CacheEntry<T> {
  value: T
  storedAt: number
}

class Cache {
  private store = new Map<string, CacheEntry<unknown>>()

  get<T>(key: string, ttlSeconds: number): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    if ((Date.now() - entry.storedAt) / 1000 > ttlSeconds) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  set<T>(key: string, value: T, _ttlSeconds: number): void {
    this.store.set(key, { value, storedAt: Date.now() })
  }
}

const cache = new Cache()

// ─── GitHub client ───────────────────────────────────────────────────────────

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const BASE_URL = 'https://api.github.com'

const github = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
  },
})

// ─── Types ───────────────────────────────────────────────────────────────────

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  CSS: '#38bdf8',
  HTML: '#e34c26',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  'C++': '#f34b7d',
  C: '#555555',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Vue: '#41b883',
  Svelte: '#ff3e00',
}

function getLanguageColor(language: string | null): string {
  if (!language) return '#888888'
  return LANGUAGE_COLORS[language] ?? '#888888'
}

interface GitHubRepo {
  id: number
  name: string
  owner: { login: string }
  description: string | null
  language: string | null
  stargazers_count: number
  open_issues_count: number
  topics: string[]
  updated_at: string
  html_url: string
}

interface Project {
  id: string
  name: string
  owner: string
  description: string
  language: string
  languageColor: string
  stars: number
  openIssues: number
  goodFirstIssues: number
  topics: string[]
  lastUpdated: string
  repoUrl: string
}

interface ContributorFit {
  avgContributions: number
  avgPublicRepos: number
  avgFollowers: number
  avgAccountAgeDays: number
  topLanguage: string
  contributorCount: number
}

interface GitHubIssue {
  id: number
  number: number
  title: string
  html_url: string
  labels: { name: string; color: string }[]
  created_at: string
  updated_at: string
  user: { login: string; avatar_url: string }
  comments: number
  body: string | null
}

interface RawContributor {
  login: string
  contributions: number
}

interface GitHubUser {
  login: string
  public_repos: number
  followers: number
  created_at: string
}

interface GitHubUserRepo {
  language: string | null
}

// ─── GitHub service helpers ──────────────────────────────────────────────────

async function getGoodFirstIssueCount(owner: string, repo: string): Promise<number> {
  try {
    const { data } = await github.get('/search/issues', {
      params: {
        q: `repo:${owner}/${repo} label:"good first issue" state:open`,
        per_page: 1,
      },
    })
    return data.total_count ?? 0
  } catch {
    return 0
  }
}

async function normalizeRepo(repo: GitHubRepo): Promise<Project> {
  const goodFirstIssues = await getGoodFirstIssueCount(repo.owner.login, repo.name)
  return {
    id: String(repo.id),
    name: repo.name,
    owner: repo.owner.login,
    description: repo.description ?? '',
    language: repo.language ?? 'Unknown',
    languageColor: getLanguageColor(repo.language),
    stars: repo.stargazers_count,
    openIssues: repo.open_issues_count,
    goodFirstIssues,
    topics: repo.topics ?? [],
    lastUpdated: repo.updated_at.split('T')[0],
    repoUrl: repo.html_url,
  }
}

async function fetchDiscoverProjects(): Promise<Project[]> {
  const CACHE_KEY = 'projects:discover'
  const TTL = 3600
  const cached = cache.get<Project[]>(CACHE_KEY, TTL)
  if (cached) return cached

  const query = 'good-first-issues:>5 stars:>500 archived:false'
  const { data } = await github.get('/search/repositories', {
    params: { q: query, sort: 'updated', order: 'desc', per_page: 36 },
  })
  const repos: GitHubRepo[] = data.items ?? []
  const projects = await Promise.all(repos.map(normalizeRepo))
  cache.set(CACHE_KEY, projects, TTL)
  return projects
}

async function fetchTrendingProjects(): Promise<Project[]> {
  const CACHE_KEY = 'projects:trending'
  const TTL = 3600
  const cached = cache.get<Project[]>(CACHE_KEY, TTL)
  if (cached) return cached

  const since = new Date()
  since.setDate(since.getDate() - 7)
  const dateStr = since.toISOString().split('T')[0]
  const query = `stars:>1000 pushed:>${dateStr} archived:false`
  const { data } = await github.get('/search/repositories', {
    params: { q: query, sort: 'stars', order: 'desc', per_page: 36 },
  })
  const repos: GitHubRepo[] = data.items ?? []
  const projects = await Promise.all(repos.map(normalizeRepo))
  cache.set(CACHE_KEY, projects, TTL)
  return projects
}

async function fetchRepoDetails(owner: string, repo: string): Promise<Project | null> {
  const CACHE_KEY = `repo:${owner}:${repo}`
  const TTL = 1800
  const cached = cache.get<Project>(CACHE_KEY, TTL)
  if (cached) return cached

  try {
    const { data } = await github.get<GitHubRepo>(`/repos/${owner}/${repo}`)
    const project = await normalizeRepo(data)
    cache.set(CACHE_KEY, project, TTL)
    return project
  } catch {
    return null
  }
}

async function fetchRepoIssues(
  owner: string,
  repo: string,
  goodFirstOnly = false
): Promise<GitHubIssue[]> {
  const CACHE_KEY = `issues:${owner}:${repo}:${goodFirstOnly ? 'beginner' : 'all'}`
  const TTL = 900
  const cached = cache.get<GitHubIssue[]>(CACHE_KEY, TTL)
  if (cached) return cached

  try {
    const { data } = await github.get<GitHubIssue[]>(`/repos/${owner}/${repo}/issues`, {
      params: {
        state: 'open',
        sort: 'updated',
        direction: 'desc',
        per_page: 20,
        ...(goodFirstOnly ? { labels: 'good first issue' } : {}),
      },
    })
    cache.set(CACHE_KEY, data, TTL)
    return data
  } catch {
    return []
  }
}

async function fetchContributorFit(owner: string, repo: string): Promise<ContributorFit> {
  const CACHE_KEY = `contributor-fit:${owner}:${repo}`
  const TTL = 7200
  const cached = cache.get<ContributorFit>(CACHE_KEY, TTL)
  if (cached) return cached

  const { data: contributors } = await github.get<RawContributor[]>(
    `/repos/${owner}/${repo}/contributors`,
    { params: { per_page: 30, anon: false } }
  )

  if (!contributors || contributors.length === 0) {
    return { avgContributions: 0, avgPublicRepos: 0, avgFollowers: 0, avgAccountAgeDays: 0, topLanguage: 'Unknown', contributorCount: 0 }
  }

  const sorted = [...contributors].sort((a, b) => b.contributions - a.contributions)
  const topN = Math.max(1, Math.ceil(sorted.length * 0.25))
  const topContributors = sorted.slice(0, topN)
  const capped = topContributors.slice(0, 10)

  const userProfiles = await Promise.allSettled(
    capped.map(c => github.get<GitHubUser>(`/users/${c.login}`))
  )
  const validProfiles: GitHubUser[] = userProfiles
    .filter((r): r is PromiseFulfilledResult<{ data: GitHubUser }> => r.status === 'fulfilled')
    .map(r => r.value.data)

  if (validProfiles.length === 0) {
    return {
      avgContributions: Math.round(capped.reduce((s, c) => s + c.contributions, 0) / capped.length),
      avgPublicRepos: 0, avgFollowers: 0, avgAccountAgeDays: 0, topLanguage: 'Unknown',
      contributorCount: topContributors.length,
    }
  }

  const now = Date.now()
  const avgContributions = Math.round(capped.reduce((s, c) => s + c.contributions, 0) / capped.length)
  const avgPublicRepos = Math.round(validProfiles.reduce((s, u) => s + u.public_repos, 0) / validProfiles.length)
  const avgFollowers = Math.round(validProfiles.reduce((s, u) => s + u.followers, 0) / validProfiles.length)
  const avgAccountAgeDays = Math.round(
    validProfiles.reduce((s, u) => s + (now - new Date(u.created_at).getTime()), 0) /
    validProfiles.length / (1000 * 60 * 60 * 24)
  )

  let topLanguage = 'Unknown'
  try {
    const { data: repos } = await github.get<GitHubUserRepo[]>(
      `/users/${validProfiles[0].login}/repos`,
      { params: { per_page: 30, sort: 'updated' } }
    )
    const langCount: Record<string, number> = {}
    for (const r of repos) {
      if (r.language) langCount[r.language] = (langCount[r.language] ?? 0) + 1
    }
    const sortedLangs = Object.entries(langCount).sort(([, a], [, b]) => b - a)
    if (sortedLangs.length > 0) topLanguage = sortedLangs[0][0]
  } catch { /* ignore */ }

  const result: ContributorFit = { avgContributions, avgPublicRepos, avgFollowers, avgAccountAgeDays, topLanguage, contributorCount: topContributors.length }
  cache.set(CACHE_KEY, result, TTL)
  return result
}

// ─── Express app ─────────────────────────────────────────────────────────────

const app = express()

app.use(cors())
app.use(express.json())

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const projects = await fetchDiscoverProjects()
    res.json({ data: projects })
  } catch (err) {
    console.error('GET /api/projects failed:', err)
    res.status(500).json({ error: 'Failed to fetch projects from GitHub' })
  }
})

router.get('/trending', async (_req: Request, res: Response) => {
  try {
    const projects = await fetchTrendingProjects()
    res.json({ data: projects })
  } catch (err) {
    console.error('GET /api/projects/trending failed:', err)
    res.status(500).json({ error: 'Failed to fetch trending projects from GitHub' })
  }
})

router.get('/:owner/:repo/contributor-fit', async (req: Request, res: Response) => {
  const { owner, repo } = req.params
  try {
    const fit = await fetchContributorFit(owner, repo)
    res.json({ data: fit })
  } catch (err) {
    console.error(`GET /api/projects/${owner}/${repo}/contributor-fit failed:`, err)
    res.status(500).json({ error: 'Failed to fetch contributor fit' })
  }
})

router.get('/:owner/:repo/issues', async (req: Request, res: Response) => {
  const { owner, repo } = req.params
  const goodFirstOnly = req.query.beginner === 'true'
  try {
    const issues = await fetchRepoIssues(owner, repo, goodFirstOnly)
    res.json({ data: issues })
  } catch (err) {
    console.error(`GET /api/projects/${owner}/${repo}/issues failed:`, err)
    res.status(500).json({ error: 'Failed to fetch issues from GitHub' })
  }
})

router.get('/:owner/:repo', async (req: Request, res: Response) => {
  const { owner, repo } = req.params
  try {
    const project = await fetchRepoDetails(owner, repo)
    if (!project) {
      res.status(404).json({ error: `Repo ${owner}/${repo} not found` })
      return
    }
    res.json({ data: project })
  } catch (err) {
    console.error(`GET /api/projects/${owner}/${repo} failed:`, err)
    res.status(500).json({ error: 'Failed to fetch repo details from GitHub' })
  }
})

app.use('/api/projects', router)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Vercel handler ───────────────────────────────────────────────────────────

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any)
}
