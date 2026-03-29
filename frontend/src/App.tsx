import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
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

  const renderPage = () => {
    switch (activeTab) {
      case 'discover': return <DiscoverPage />
      case 'trending': return <TrendingPage />
      case 'saved':    return <SavedPage />
    }
  }

  return (
    <AuthProvider>
      <DashboardLayout>
        <TabNavigation tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        {renderPage()}
      </DashboardLayout>
    </AuthProvider>
  )
}
