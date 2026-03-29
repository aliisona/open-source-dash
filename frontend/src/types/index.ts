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

export interface Issue {
  id: number
  number: number
  title: string
  url: string
  labels: { name: string; color: string }[]
  createdAt: string
  updatedAt: string
  author: string
  authorAvatar: string
  comments: number
  body: string | null
  isGoodFirstIssue: boolean
}

export type TabId = 'discover' | 'trending' | 'saved'

export interface Tab {
  id: TabId
  label: string
}
