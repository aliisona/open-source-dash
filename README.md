# Open Source Dashboard

A dashboard for discovering open-source GitHub projects with open issues you can contribute to.

## Project Structure

```
open-source-dash/
├── frontend/        # React + TypeScript + Vite + Tailwind CSS
├── backend/         # Node/Express API (stub — ready to wire up GitHub API)
└── README.md
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on [http://localhost:3001](http://localhost:3001) by default.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS |
| Icons     | lucide-react                        |
| Backend   | Node.js, Express (stub)             |
| Data      | Mock data (GitHub API integration ready) |

## Frontend Structure

```
frontend/src/
├── types/           # TypeScript interfaces (Project, Tab, TabId)
├── data/            # Mock project data
├── services/        # API service layer (swap mocks for real GitHub API here)
├── components/
│   ├── layout/      # DashboardLayout — sticky header, page wrapper
│   ├── navigation/  # TabNavigation — pill-style tab switcher
│   └── cards/       # ProjectCard — stars, language, issues, topics
└── pages/
    ├── DiscoverPage.tsx
    ├── TrendingPage.tsx
    └── SavedPage.tsx
```

## Backend Structure

```
backend/src/
├── routes/          # Express route handlers
├── services/        # GitHub API service layer (TODO)
└── index.ts         # Express server entry point
```

## Roadmap / TODOs

- [ ] Wire up GitHub REST or GraphQL API in `backend/src/services/`
- [ ] Replace mock data in `frontend/src/services/githubService.ts` with real API calls
- [ ] Add language/topic filtering on Discover page
- [ ] Add sorting by stars / recent activity on Trending page
- [ ] Persist saved projects (localStorage or backend)
- [ ] Issue detail drawer/modal on ProjectCard
- [ ] Search bar
- [ ] GitHub OAuth for higher API rate limits

# Acknowledgement

Idea inspired from my current Tech for Social Good Project: Social Good Marketplace for non-profit organizations to post for developers. Code is completely new from previous work and this project is meant as an learning experience for me to use Zed and try out GitHub API.
