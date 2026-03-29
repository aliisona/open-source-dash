import { supabase } from '../lib/supabase'
import { Project } from '../types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toRow(project: Project, userId: string) {
  return {
    user_id: userId,
    repo_id: project.id,
    name: project.name,
    owner: project.owner,
    description: project.description,
    language: project.language,
    language_color: project.languageColor,
    stars: project.stars,
    open_issues: project.openIssues,
    good_first_issues: project.goodFirstIssues,
    topics: project.topics,
    last_updated: project.lastUpdated,
    repo_url: project.repoUrl,
  }
}

function fromRow(row: Record<string, unknown>): Project {
  return {
    id: row.repo_id as string,
    name: row.name as string,
    owner: row.owner as string,
    description: (row.description as string) ?? '',
    language: (row.language as string) ?? '',
    languageColor: (row.language_color as string) ?? '#888888',
    stars: (row.stars as number) ?? 0,
    openIssues: (row.open_issues as number) ?? 0,
    goodFirstIssues: (row.good_first_issues as number) ?? 0,
    topics: (row.topics as string[]) ?? [],
    lastUpdated: (row.last_updated as string) ?? '',
    repoUrl: (row.repo_url as string) ?? '',
  }
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Fetch all saved projects for the currently signed-in user.
 * Explicitly verifies session first to avoid RLS silent failures.
 */
export async function getSavedProjects(): Promise<Project[]> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) throw new Error(sessionError.message)
  if (!session) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('saved_projects')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(fromRow)
}

/**
 * Save a project for the currently signed-in user.
 * Uses upsert so calling it twice on the same project is safe.
 */
export async function saveProject(project: Project, userId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_projects')
    .upsert(toRow(project, userId), { onConflict: 'user_id,repo_id' })

  if (error) throw new Error(error.message)
}

/**
 * Remove a saved project for the currently signed-in user.
 */
export async function unsaveProject(projectId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_projects')
    .delete()
    .eq('user_id', userId)
    .eq('repo_id', projectId)

  if (error) throw new Error(error.message)
}

/**
 * Check whether a specific project is already saved by the current user.
 */
export async function isProjectSaved(projectId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('saved_projects')
    .select('repo_id')
    .eq('user_id', userId)
    .eq('repo_id', projectId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data !== null
}
