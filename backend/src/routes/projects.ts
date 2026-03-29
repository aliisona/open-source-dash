import { Router, Request, Response } from 'express'

// TODO: Import real GitHub service once implemented
// import { fetchProjects, fetchTrending } from '../services/githubService'

const router = Router()

/**
 * GET /api/projects
 * Returns a list of discoverable open-source projects.
 * TODO: Replace mock data with real GitHub API calls.
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    data: [],
    message: 'TODO: wire up GitHub API in src/services/githubService.ts',
  })
})

/**
 * GET /api/projects/trending
 * Returns trending projects sorted by star activity.
 * TODO: Query GitHub trending or sort by recent star velocity.
 */
router.get('/trending', (_req: Request, res: Response) => {
  res.json({
    data: [],
    message: 'TODO: implement trending query',
  })
})

/**
 * GET /api/projects/:owner/:repo
 * Returns details for a single repository including open issues.
 * TODO: Proxy to GitHub REST API — GET /repos/{owner}/{repo}
 */
router.get('/:owner/:repo', (req: Request, res: Response) => {
  const { owner, repo } = req.params
  res.json({
    data: null,
    message: `TODO: fetch https://api.github.com/repos/${owner}/${repo}`,
  })
})

/**
 * GET /api/projects/:owner/:repo/issues
 * Returns open issues for a repository.
 * TODO: Proxy to GitHub REST API — GET /repos/{owner}/{repo}/issues
 *       Filter by label "good first issue" when query param ?beginner=true
 */
router.get('/:owner/:repo/issues', (req: Request, res: Response) => {
  const { owner, repo } = req.params
  const { beginner } = req.query
  res.json({
    data: [],
    message: `TODO: fetch https://api.github.com/repos/${owner}/${repo}/issues${
      beginner === 'true' ? '?labels=good+first+issue' : ''
    }`,
  })
})

export default router
