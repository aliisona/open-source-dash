import { Project } from '../types'
import { mockProjects, trendingProjects, savedProjects } from '../data/mockProjects'

// TODO: Replace mock data with real GitHub API calls.
// Options:
//   1. GitHub REST API:    https://api.github.com/repos/{owner}/{repo}
//   2. GitHub GraphQL API: https://api.github.com/graphql
//   3. A lightweight Express backend that normalizes and caches responses
//
// NOTE: Direct client-side GitHub API calls work for public repos but are
// rate-limited to 60 req/hour unauthenticated. For production, proxy through
// a backend with a stored GitHub token.

export async function fetchDiscoverProjects(): Promise<Project[]> {
  // TODO: fetch from GitHub API or backend service
  return Promise.resolve(mockProjects)
}

export async function fetchTrendingProjects(): Promise<Project[]> {
  // TODO: query GitHub trending or sort by recent star activity
  return Promise.resolve(trendingProjects)
}

export async function fetchSavedProjects(): Promise<Project[]> {
  // TODO: load from user's saved list (localStorage or backend)
  return Promise.resolve(savedProjects)
}
