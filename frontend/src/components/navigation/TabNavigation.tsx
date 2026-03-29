import { Tab, TabId } from '../../types'

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: TabId
  onTabChange: (id: TabId) => void
}

export default function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
            activeTab === tab.id
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
