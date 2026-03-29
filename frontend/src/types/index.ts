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

export type TabId = 'discover' | 'trending' | 'saved'

export interface Tab {
  id: TabId
  label: string
}
