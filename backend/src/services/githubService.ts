import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

// TODO: Set GITHUB_TOKEN in your .env file to raise rate limits from
//       60 req/hour (unauthenticated) to 5,000 req/hour (authenticated).
//       Never commit your token to source control.
const GITHUB_API = 'https://api.github.com'

const githubClient = axios.create({
  baseURL: GITHUB_API,
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  },
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GithubRepo {
  id: number
  name: string
  full_name: string
  owner: { login: string }
  description: string | null
  language: string | null
  stargazers_count: number
  open_issues_count: number
  topics: string[]
  updated_at: string
  html_url: string
}

export interface GithubIssue {
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

// ---------------------------------------------------------------------------
// Repository helpers
// ---------------------------------------------------------------------------

/**
 * Fetch a single repository by owner + repo name.
 * TODO: Call this from the /api/projects/:owner/:repo route.
 */
export async function getRepo(owner: string, repo: string): Promise<GithubRepo> {
  const { data } = await githubClient.get<GithubRepo>(`/repos/${owner}/${repo}`)
  return data
}

/**
 * Search repositories using the GitHub search API.
 * @param query  GitHub search query string, e.g. "topic:react stars:>1000"
 * @param page   Page number (1-based)
 * @param perPage Results per page (max 100)
 *
 * TODO: Wire this up to the GET /api/projects route for real discovery data.
 * Example queries:
 *   - "good-first-issues:>5 stars:>500 language:typescript"
 *   - "topic:hacktoberfest is:public archived:false"
 */
export async function searchRepos(
  query: string,
  page = 1,
  perPage = 30
): Promise<{ items: GithubRepo[]; total_count: number }> {
  const { data } = await githubClient.get('/search/repositories', {
    params: { q: query, sort: 'stars', order: 'desc', page, per_page: perPage },
  })
  return data
}

/**
 * Fetch trending repositories by proxying a search for recently active repos.
 * GitHub does not have an official "trending" endpoint, so we approximate it
 * by searching for repos pushed to recently with a high star count.
 *
 * TODO: Optionally cache results in Redis or a simple in-memory store to avoid
 *       burning rate-limit quota on every request.
 */
export async function getTrendingRepos(language?: string): Promise<GithubRepo[]> {
  const since = new Date()
  since.setDate(since.getDate() - 7)
  const dateStr = since.toISOString().split('T')[0]

  const langFilter = language ? ` language:${language}` : ''
  const query = `stars:>500 pushed:>${dateStr}${langFilter}`

  const { items } = await searchRepos(query, 1, 20)
  return items
}

// ---------------------------------------------------------------------------
// Issue helpers
// ---------------------------------------------------------------------------

/**
 * Fetch open issues for a repository.
 * @param owner      Repository owner
 * @param repo       Repository name
 * @param labelFilter Optional label to filter by, e.g. "good first issue"
 * @param page       Page number (1-based)
 * @param perPage    Results per page (max 100)
 *
 * TODO: Wire this up to the GET /api/projects/:owner/:repo/issues route.
 */
export async function getIssues(
  owner: string,
  repo: string,
  labelFilter?: string,
  page = 1,
  perPage = 30
): Promise<GithubIssue[]> {
  const { data } = await githubClient.get<GithubIssue[]>(
    `/repos/${owner}/${repo}/issues`,
    {
      params: {
        state: 'open',
        ...(labelFilter ? { labels: labelFilter } : {}),
        page,
        per_page: perPage,
        sort: 'updated',
        direction: 'desc',
      },
    }
  )
  return data
}

/**
 * Fetch only "good first issue" labeled issues for a repository.
 * Convenience wrapper around getIssues.
 */
export async function getGoodFirstIssues(
  owner: string,
  repo: string
): Promise<GithubIssue[]> {
  return getIssues(owner, repo, 'good first issue')
}
