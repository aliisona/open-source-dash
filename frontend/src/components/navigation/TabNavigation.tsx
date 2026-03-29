import { Tab, TabId } from '../../types'

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: TabId
  onTabChange: (id: TabId) => void
}

export default function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav
      className="flex gap-1 rounded-xl p-1 w-fit mb-8"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150"
          style={
            activeTab === tab.id
              ? {
                  background: 'var(--accent)',
                  color: 'var(--accent-fg)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }
              : {
                  color: 'var(--text-secondary)',
                }
          }
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
            }
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
