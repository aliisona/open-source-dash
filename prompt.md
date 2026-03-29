The following is the prompt given to Zed agent using model Claude Sonnet 4.6:

Your job is to help me scaffold, structure, and iteratively improve a web app called something like “Open Source Dashboard” — a dashboard that helps good-hearted developers discover open-source GitHub projects with open issues they can contribute to.

## Product goal
Build a strong, clean skeleton of the app, not a fully finished product, but should be functional with buttons and cards.

The app should:
- Use React for the frontend
- Use Tailwind CSS for styling
- Support navigation with multiple tabs/pages
- Display open-source projects as cards in a dashboard layout
- Eventually ingest or fetch GitHub repository data and open issues
- Be designed so that issue fetching / scraping can be expanded later
- Prioritize clean architecture, maintainability, and good developer experience

## Important constraints
- Do NOT try to fully complete the entire product in one pass
- Do NOT build features I did not ask for unless they are necessary for a clean skeleton
- Focus on giving me a polished starter architecture I can build on
- Prefer simple, modern, readable code over clever code
- Leave clear TODOs where real production integrations would go

## Technical direction
Unless there is a strong reason otherwise, use:
- React
- Tailwind CSS
- TypeScript
- Vite for a lightweight frontend setup

For backend/data strategy:
- Recommend and scaffold the simplest sensible backend option for this project
- My use case is fetching GitHub repositories and their open issues
- Prefer one of:
  1. A lightweight Node/Express backend
  2. A Next.js-style API layer if you believe that is a better fit
  3. A serverless/API-wrapper approach if that is simplest
- Explain the tradeoff briefly before implementing
- Default toward the easiest architecture for a solo developer to maintain

## Product architecture expectations
Create a skeleton with:
- A top-level dashboard page
- Navigation/tabs for multiple views, such as:
  - Discover
  - Trending / Active Projects
  - Saved Projects
- Reusable React components
- A ProjectCard component
- A DashboardLayout component
- A TabNavigation component
- Mock data for initial rendering (no need for Github API yet)
- A clean folder structure
- Clear separation between:
  - UI components
  - page-level views
  - services / API utilities
  - types / interfaces
  - mock data

## UI expectations
The UI should feel:
- modern
- generous with spacing
- readable
- simple
- attractive but not flashy

Use Tailwind well:
- responsive grid layouts
- card-based design
- clear typography hierarchy
- hover states
- subtle visual polish
- support dark mode if easy, but do not let that slow down the scaffold

## Data expectations
Important: GitHub data access should be treated realistically.

Do NOT pretend to do full “web scraping” if the GitHub API is the better solution.
Instead:
- Prefer GitHub API-friendly architecture
- If scraping is a bad idea for reliability/ToS reasons, say so clearly
- Scaffold the code so that repository + issue ingestion can later come from:
  - GitHub REST API
  - GitHub GraphQL API
  - a custom ingestion script
  - a backend service that normalizes issue data

For now:
- use mock project and issue data
- create service interfaces that can later be swapped to real GitHub data
- make the app feel real even if initial data is mocked

## Output style requirements
When working, follow this process:

1. First, briefly state the implementation plan
2. Then create the file/folder structure
3. Then implement the scaffold in logical steps
4. After major steps, summarize what was created
5. If a decision is needed, choose the most practical default and proceed
6. Keep moving forward instead of stalling on minor ambiguity

## Coding standards
- Use TypeScript
- Use functional React components
- Keep components small and composable
- Avoid giant files
- Add concise comments where helpful
- Use clear naming
- Avoid unnecessary dependencies
- Prefer maintainable patterns over enterprise complexity

## What I want from you specifically
I want a strong starter project that includes:
- a nice dashboard shell
- tab navigation
- project cards
- mock GitHub-style project data
- placeholder services for repository/issue ingestion
- enough styling and structure that I can immediately keep building

I do NOT want:
- auth
- payments
- complex database setup
- production deployment work
- a giant feature set
- fake completeness

## Feature hints
A project card could include:
- repository name
- owner/org
- description
- language
- stars
- open issues count
- “good first issue” count
- tags/topics
- last updated date
- a button like “View Issues”

Potential future features should be easy to add later:
- filtering by language
- sorting by stars / activity
- saved projects
- issue detail drawer/modal
- search
- GitHub API integration

## Behavior guidelines
- Be opinionated, but practical
- If you recommend a backend, explain why in 3–6 sentences max
- Then scaffold accordingly
- If something is out of scope, say so and leave a TODO
- Assume I care about elegance, speed, and maintainability
- Optimize for a developer-friendly foundation

## First task
Start by:
1. recommending the best lightweight architecture for this project,
2. creating the initial folder structure,
3. scaffolding the React + Tailwind app shell,
4. implementing a dashboard page with tab navigation and reusable project cards using mock data.

Proceed without waiting for confirmation unless a blocker is truly critical.
