import axios from 'axios'
import { cache } from '../lib/cache'

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
// Contributor fit types
// ---------------------------------------------------------------------------

export interface ContributorFit {
  avgContributions: number      // avg commits to this repo among top contributors
  avgPublicRepos: number        // avg number of public repos
  avgFollowers: number          // avg followers
  avgAccountAgeDays: number     // avg account age in days
  topLanguage: string           // most common primary language among top contributors
  contributorCount: number      // how many contributors were sampled
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
// Discover
// ---------------------------------------------------------------------------

export async function fetchDiscoverProjects(): Promise<Project[]> {
  const CACHE_KEY = 'projects:discover'
  const TTL = 3600

  const cached = cache.get<Project[]>(CACHE_KEY, TTL)
  if (cached) { console.log('[cache hit] projects:discover'); return cached }

  console.log('[cache miss] fetching discover projects from GitHub...')

  const query = 'good-first-issues:>5 stars:>500 archived:false'
  const { data } = await github.get('/search/repositories', {
    params: { q: query, sort: 'updated', order: 'desc', per_page: 36 },
  })

  const repos: GitHubRepo[] = data.items ?? []
  const projects = await Promise.all(repos.map(normalizeRepo))
  cache.set(CACHE_KEY, projects, TTL)
  return projects
}

// ---------------------------------------------------------------------------
// Trending
// ---------------------------------------------------------------------------

export async function fetchTrendingProjects(): Promise<Project[]> {
  const CACHE_KEY = 'projects:trending'
  const TTL = 3600

  const cached = cache.get<Project[]>(CACHE_KEY, TTL)
  if (cached) { console.log('[cache hit] projects:trending'); return cached }

  console.log('[cache miss] fetching trending projects from GitHub...')

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

// ---------------------------------------------------------------------------
// Single repo details
// ---------------------------------------------------------------------------

export async function fetchRepoDetails(owner: string, repo: string): Promise<Project | null> {
  const CACHE_KEY = `repo:${owner}:${repo}`
  const TTL = 1800

  const cached = cache.get<Project>(CACHE_KEY, TTL)
  if (cached) { console.log(`[cache hit] ${CACHE_KEY}`); return cached }

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
// Issues
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
  const TTL = 900

  const cached = cache.get<GitHubIssue[]>(CACHE_KEY, TTL)
  if (cached) { console.log(`[cache hit] ${CACHE_KEY}`); return cached }

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

// ---------------------------------------------------------------------------
// Contributor Fit
// Fetches top 30 contributors by commit count, takes top 25th percentile,
// averages their public repos, followers, account age, primary language.
// Cache TTL: 2 hours (expensive call)
// ---------------------------------------------------------------------------

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

export async function fetchContributorFit(owner: string, repo: string): Promise<ContributorFit> {
  const CACHE_KEY = `contributor-fit:${owner}:${repo}`
  const TTL = 7200 // 2 hours

  const cached = cache.get<ContributorFit>(CACHE_KEY, TTL)
  if (cached) { console.log(`[cache hit] ${CACHE_KEY}`); return cached }

  console.log(`[cache miss] fetching contributor fit for ${owner}/${repo}...`)

  // Step 1: Get top 30 contributors sorted by contributions descending
  const { data: contributors } = await github.get<RawContributor[]>(
    `/repos/${owner}/${repo}/contributors`,
    { params: { per_page: 30, anon: false } }
  )

  if (!contributors || contributors.length === 0) {
    return {
      avgContributions: 0,
      avgPublicRepos: 0,
      avgFollowers: 0,
      avgAccountAgeDays: 0,
      topLanguage: 'Unknown',
      contributorCount: 0,
    }
  }

  // Step 2: Take top 25th percentile by contribution count
  const sorted = [...contributors].sort((a, b) => b.contributions - a.contributions)
  const topN = Math.max(1, Math.ceil(sorted.length * 0.25))
  const topContributors = sorted.slice(0, topN)

  // Step 3: Fetch each user's profile (rate-limit friendly: cap at 10)
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
      avgPublicRepos: 0,
      avgFollowers: 0,
      avgAccountAgeDays: 0,
      topLanguage: 'Unknown',
      contributorCount: topContributors.length,
    }
  }

  // Step 4: Compute averages
  const now = Date.now()

  const avgContributions = Math.round(
    capped.reduce((s, c) => s + c.contributions, 0) / capped.length
  )
  const avgPublicRepos = Math.round(
    validProfiles.reduce((s, u) => s + u.public_repos, 0) / validProfiles.length
  )
  const avgFollowers = Math.round(
    validProfiles.reduce((s, u) => s + u.followers, 0) / validProfiles.length
  )
  const avgAccountAgeDays = Math.round(
    validProfiles.reduce((s, u) => s + (now - new Date(u.created_at).getTime()), 0) /
    validProfiles.length / (1000 * 60 * 60 * 24)
  )

  // Step 5: Find most common primary language across their repos (sample first user only to save quota)
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
    const sorted = Object.entries(langCount).sort(([, a], [, b]) => b - a)
    if (sorted.length > 0) topLanguage = sorted[0][0]
  } catch {
    // silently ignore
  }

  const result: ContributorFit = {
    avgContributions,
    avgPublicRepos,
    avgFollowers,
    avgAccountAgeDays,
    topLanguage,
    contributorCount: topContributors.length,
  }

  cache.set(CACHE_KEY, result, TTL)
  return result
}
