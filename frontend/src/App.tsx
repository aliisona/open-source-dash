import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import DashboardLayout from './components/layout/DashboardLayout'
import TabNavigation from './components/navigation/TabNavigation'
import DiscoverPage from './pages/DiscoverPage'
import TrendingPage from './pages/TrendingPage'
import SavedPage from './pages/SavedPage'
import { Tab, TabId } from './types'

const TABS: Tab[] = [
  { id: 'discover', label: 'Discover' },
  { id: 'trending', label: 'Trending' },
  { id: 'saved', label: 'Saved' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('discover')
  const [savedKey, setSavedKey] = useState(0)

  const handleTabChange = (id: TabId) => {
    // Force SavedPage to remount every time user navigates to it
    // so it always fetches fresh data from Supabase
    if (id === 'saved') setSavedKey((k) => k + 1)
    setActiveTab(id)
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'discover': return <DiscoverPage />
      case 'trending': return <TrendingPage />
      case 'saved':    return <SavedPage key={savedKey} />
    }
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <DashboardLayout>
          <TabNavigation tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
          {renderPage()}
        </DashboardLayout>
      </AuthProvider>
    </ThemeProvider>
  )
}