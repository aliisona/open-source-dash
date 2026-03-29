import { Project } from '../types'

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

export async function fetchRepoIssues(
  owner: string,
  repo: string,
  goodFirstOnly = false
): Promise<unknown[]> {
  try {
    const query = goodFirstOnly ? '?beginner=true' : ''
    return await apiFetch<unknown[]>(`/api/projects/${owner}/${repo}/issues${query}`)
  } catch (err) {
    console.error(`fetchRepoIssues failed for ${owner}/${repo}:`, err)
    return []
  }
}

// Saved projects are handled by savedProjectsService via Supabase
export async function fetchSavedProjects(): Promise<Project[]> {
  return []
}