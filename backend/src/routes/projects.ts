import { Router, Request, Response } from 'express'
import {
  fetchDiscoverProjects,
  fetchTrendingProjects,
  fetchRepoDetails,
  fetchRepoIssues,
} from '../services/githubService'

const router = Router()

/**
 * GET /api/projects
 * Returns beginner-friendly projects with good first issues.
 * Cached for 1 hour.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const projects = await fetchDiscoverProjects()
    res.json({ data: projects })
  } catch (err) {
    console.error('GET /api/projects failed:', err)
    res.status(500).json({ error: 'Failed to fetch projects from GitHub' })
  }
})

/**
 * GET /api/projects/trending
 * Returns trending projects sorted by stars, pushed in last 7 days.
 * Cached for 1 hour.
 */
router.get('/trending', async (_req: Request, res: Response) => {
  try {
    const projects = await fetchTrendingProjects()
    res.json({ data: projects })
  } catch (err) {
    console.error('GET /api/projects/trending failed:', err)
    res.status(500).json({ error: 'Failed to fetch trending projects from GitHub' })
  }
})

/**
 * GET /api/projects/:owner/:repo
 * Returns details for a single repository.
 * Cached for 30 minutes.
 */
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

/**
 * GET /api/projects/:owner/:repo/issues
 * Returns open issues for a repository.
 * Add ?beginner=true to filter by "good first issue" label.
 * Cached for 15 minutes.
 */
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

export default router
