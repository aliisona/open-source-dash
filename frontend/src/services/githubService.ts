import { Project, Issue } from '../types'

export interface ContributorFit {
  avgContributions: number
  avgPublicRepos: number
  avgFollowers: number
  avgAccountAgeDays: number
  topLanguage: string
  contributorCount: number
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)
  const json = await res.json()
  return json.data
}

export async function fetchDiscoverProjects(): Promise<Project[]> {
  try {
    return await apiFetch<Project[]>('/api/projects')
  } catch (err) {
    console.error('fetchDiscoverProjects failed:', err)
    return []
  }
}

export async function fetchTrendingProjects(): Promise<Project[]> {
  try {
    return await apiFetch<Project[]>('/api/projects/trending')
  } catch (err) {
    console.error('fetchTrendingProjects failed:', err)
    return []
  }
}

// ---------------------------------------------------------------------------
// Raw shape returned by the backend (mirrors GitHub REST API)
// ---------------------------------------------------------------------------

interface RawIssue {
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

function normalizeIssue(raw: RawIssue): Issue {
  return {
    id: raw.id,
    number: raw.number,
    title: raw.title,
    url: raw.html_url,
    labels: raw.labels ?? [],
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    author: raw.user?.login ?? 'unknown',
    authorAvatar: raw.user?.avatar_url ?? '',
    comments: raw.comments ?? 0,
    body: raw.body,
    isGoodFirstIssue: (raw.labels ?? []).some(
      (l) => l.name.toLowerCase() === 'good first issue'
    ),
  }
}

export async function fetchRepoIssues(
  owner: string,
  repo: string,
  goodFirstOnly = false
): Promise<Issue[]> {
  try {
    const query = goodFirstOnly ? '?beginner=true' : ''
    const raw = await apiFetch<RawIssue[]>(
      `/api/projects/${owner}/${repo}/issues${query}`
    )
    return (raw ?? []).map(normalizeIssue)
  } catch (err) {
    console.error(`fetchRepoIssues failed for ${owner}/${repo}:`, err)
    return []
  }
}

export async function fetchContributorFit(owner: string, repo: string): Promise<ContributorFit | null> {
  try {
    return await apiFetch<ContributorFit>(`/api/projects/${owner}/${repo}/contributor-fit`)
  } catch (err) {
    console.error(`fetchContributorFit failed for ${owner}/${repo}:`, err)
    return null
  }
}

// Saved projects are handled by savedProjectsService via Supabase
export async function fetchSavedProjects(): Promise<Project[]> {
  return []
}
