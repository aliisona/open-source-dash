import axios from 'axios'
import { cache } from '../lib/cache'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const BASE_URL = 'https://api.github.com'

// ---------------------------------------------------------------------------
// Axios client with GitHub auth headers
// ---------------------------------------------------------------------------

const github = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
  },
})

// ---------------------------------------------------------------------------
// Language color map
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GitHubRepo {
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

export interface Project {
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Discover — beginner-friendly repos with good first issues
// Cache TTL: 1 hour
// ---------------------------------------------------------------------------

export async function fetchDiscoverProjects(): Promise<Project[]> {
  const CACHE_KEY = 'projects:discover'
  const TTL = 3600 // 1 hour

  const cached = cache.get<Project[]>(CACHE_KEY, TTL)
  if (cached) {
    console.log('[cache hit] projects:discover')
    return cached
  }

  console.log('[cache miss] fetching discover projects from GitHub...')

  const query = 'good-first-issues:>5 stars:>500 archived:false'
  const { data } = await github.get('/search/repositories', {
    params: {
      q: query,
      sort: 'updated',
      order: 'desc',
      per_page: 36,
    },
  })

  const repos: GitHubRepo[] = data.items ?? []
  const projects = await Promise.all(repos.map(normalizeRepo))

  cache.set(CACHE_KEY, projects, TTL)
  return projects
}

// ---------------------------------------------------------------------------
// Trending — most starred repos pushed to in the last 7 days
// Cache TTL: 1 hour
// ---------------------------------------------------------------------------

export async function fetchTrendingProjects(): Promise<Project[]> {
  const CACHE_KEY = 'projects:trending'
  const TTL = 3600 // 1 hour

  const cached = cache.get<Project[]>(CACHE_KEY, TTL)
  if (cached) {
    console.log('[cache hit] projects:trending')
    return cached
  }

  console.log('[cache miss] fetching trending projects from GitHub...')

  const since = new Date()
  since.setDate(since.getDate() - 7)
  const dateStr = since.toISOString().split('T')[0]

  const query = `stars:>1000 pushed:>${dateStr} archived:false`
  const { data } = await github.get('/search/repositories', {
    params: {
      q: query,
      sort: 'stars',
      order: 'desc',
      per_page: 36,
    },
  })

  const repos: GitHubRepo[] = data.items ?? []
  const projects = await Promise.all(repos.map(normalizeRepo))

  cache.set(CACHE_KEY, projects, TTL)
  return projects
}

// ---------------------------------------------------------------------------
// Single repo details
// Cache TTL: 30 minutes
// ---------------------------------------------------------------------------

export async function fetchRepoDetails(owner: string, repo: string): Promise<Project | null> {
  const CACHE_KEY = `repo:${owner}:${repo}`
  const TTL = 1800 // 30 minutes

  const cached = cache.get<Project>(CACHE_KEY, TTL)
  if (cached) {
    console.log(`[cache hit] ${CACHE_KEY}`)
    return cached
  }

  console.log(`[cache miss] fetching repo details for ${owner}/${repo}...`)

  try {
    const { data } = await github.get<GitHubRepo>(`/repos/${owner}/${repo}`)
    const project = await normalizeRepo(data)
    cache.set(CACHE_KEY, project, TTL)
    return project
  } catch (err) {
    console.error(`Failed to fetch repo ${owner}/${repo}:`, err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Issues for a repo
// Cache TTL: 15 minutes (issues change more frequently)
// ---------------------------------------------------------------------------

export interface GitHubIssue {
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

export async function fetchRepoIssues(
  owner: string,
  repo: string,
  goodFirstOnly = false
): Promise<GitHubIssue[]> {
  const CACHE_KEY = `issues:${owner}:${repo}:${goodFirstOnly ? 'beginner' : 'all'}`
  const TTL = 900 // 15 minutes

  const cached = cache.get<GitHubIssue[]>(CACHE_KEY, TTL)
  if (cached) {
    console.log(`[cache hit] ${CACHE_KEY}`)
    return cached
  }

  console.log(`[cache miss] fetching issues for ${owner}/${repo}...`)

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
  } catch (err) {
    console.error(`Failed to fetch issues for ${owner}/${repo}:`, err)
    return []
  }
}
