import { supabase } from '../lib/supabase'

const GITHUB_API = 'https://api.github.com'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GitHubUserStats {
  login: string
  name: string | null
  avatarUrl: string
  bio: string | null
  publicRepos: number
  followers: number
  following: number
  company: string | null
  location: string | null
  profileUrl: string
}

export interface GitHubRepo {
  id: number
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  html_url: string
  topics: string[]
  updated_at: string
}

export interface TopLanguage {
  name: string
  count: number
  percentage: number
}

export interface UserProfile {
  stats: GitHubUserStats
  topLanguages: TopLanguage[]
  pinnedRepos: GitHubRepo[]
  recentRepos: GitHubRepo[]
  totalStars: number
}

// ---------------------------------------------------------------------------
// Core fetch helper — uses the GitHub OAuth token from the Supabase session
// ---------------------------------------------------------------------------

async function githubFetch<T>(path: string): Promise<T> {
  // Get the provider_token (GitHub OAuth token) from the active Supabase session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const token = session?.provider_token

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${GITHUB_API}${path}`, { headers })

  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Fetch basic user stats
// ---------------------------------------------------------------------------

export async function fetchUserStats(username: string): Promise<GitHubUserStats> {
  const data = await githubFetch<{
    login: string
    name: string | null
    avatar_url: string
    bio: string | null
    public_repos: number
    followers: number
    following: number
    company: string | null
    location: string | null
    html_url: string
  }>(`/users/${username}`)

  return {
    login: data.login,
    name: data.name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    publicRepos: data.public_repos,
    followers: data.followers,
    following: data.following,
    company: data.company,
    location: data.location,
    profileUrl: data.html_url,
  }
}

// ---------------------------------------------------------------------------
// Fetch user's repos and compute top languages + total stars
// ---------------------------------------------------------------------------

export async function fetchUserRepos(username: string): Promise<{
  repos: GitHubRepo[]
  topLanguages: TopLanguage[]
  totalStars: number
}> {
  // Fetch up to 100 most recently updated repos
  const repos = await githubFetch<GitHubRepo[]>(
    `/users/${username}/repos?sort=updated&direction=desc&per_page=100`
  )

  // Count language usage across all repos
  const langCount: Record<string, number> = {}
  let totalStars = 0

  for (const repo of repos) {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] ?? 0) + 1
    }
    totalStars += repo.stargazers_count
  }

  const totalWithLang = Object.values(langCount).reduce((a, b) => a + b, 0)

  const topLanguages: TopLanguage[] = Object.entries(langCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalWithLang) * 100),
    }))

  // Recent 6 repos for display
  const recentRepos = repos.slice(0, 6)

  return { repos: recentRepos, topLanguages, totalStars }
}

// ---------------------------------------------------------------------------
// Combine everything into a full UserProfile
// ---------------------------------------------------------------------------

export async function fetchUserProfile(username: string): Promise<UserProfile> {
  const [stats, { repos, topLanguages, totalStars }] = await Promise.all([
    fetchUserStats(username),
    fetchUserRepos(username),
  ])

  return {
    stats,
    topLanguages,
    pinnedRepos: [], // TODO: pinned repos require GitHub GraphQL API — wire up later
    recentRepos: repos,
    totalStars,
  }
}
