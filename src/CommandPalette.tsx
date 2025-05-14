import { useEffect, useRef, useState } from 'react'

const metabotSuggestions = [
  'Customers over time',
  'Accounts in Europe',
  'Top performing products',
]

const recentItems = [
  { label: 'Metabase Home', desc: 'Our analytics' },
  { label: 'Product Design Weekly Recruiting Ops Stats', desc: 'Product Design' },
  { label: 'Issue Heat Map - Total Score by Feature Cluster & Type', desc: 'GitHub Data' },
  { label: 'New Customer Issues (p2w)', desc: 'Product Feedback' },
  { label: 'Top 50 recently upvoted GitHub Issues by upvotes', desc: 'Product Feedback' },
]

const actions = [
  { label: 'New question', icon: '✨' },
  { label: 'New SQL query', icon: '⌨️' },
  { label: 'New dashboard', icon: '📊' },
]

type PaletteItem =
  | { type: 'metabot', label: string }
  | { type: 'recent', label: string, desc: string }
  | { type: 'actions', label: string, icon: string }

function getFlatItems(query: string): PaletteItem[] {
  const q = query.toLowerCase()
  const items: PaletteItem[] = []
  // Always add the metabot ask item at the top
  const askLabel = query
    ? `Ask Metabot, "${query}"`
    : 'Ask a question, or tell me to do something'
  items.push({ type: 'metabot', label: askLabel })
  metabotSuggestions.forEach(s => {
    if (q === '' || s.toLowerCase().includes(q)) {
      items.push({ type: 'metabot', label: s })
    }
  })
  recentItems.forEach(i => {
    if (i.label.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)) {
      items.push({ type: 'recent', label: i.label, desc: i.desc })
    }
  })
  actions.forEach(a => {
    if (a.label.toLowerCase().includes(q)) {
      items.push({ type: 'actions', label: a.label, icon: a.icon })
    }
  })
  return items
}

export default function CommandPalette({ open, onClose, onMetabotAsk }: { open: boolean, onClose: () => void, onMetabotAsk?: (query: string) => void }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const items = getFlatItems(query)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        setSelected(s => Math.min(s + 1, items.length - 1))
        e.preventDefault()
      } else if (e.key === 'ArrowUp') {
        setSelected(s => Math.max(s - 1, 0))
        e.preventDefault()
      } else if (e.key === 'Enter') {
        if (items[selected]) {
          if (items[selected].type === 'metabot' && (items[selected].label.startsWith('Ask Metabot') || items[selected].label === 'Ask a question, or tell me to do something')) {
            onClose()
            onMetabotAsk && onMetabotAsk(query)
          } else {
            onClose()
          }
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, items, selected, onClose, onMetabotAsk, query])

  if (!open) return null

  // Split items for rendering sections
  const metabotAsk = items[0]
  const metabotChips = items.filter(i => i.type === 'metabot' && i.label !== metabotAsk.label)
  const recent = items.filter(i => i.type === 'recent')
  const acts = items.filter(i => i.type === 'actions')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-700 bg-opacity-60">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-auto p-0 overflow-hidden">
        <div className="p-4 border-b">
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for anything or jump somewhere..."
            className="w-full px-4 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-base"
          />
        </div>
        <div className="divide-y">
          <div className="p-4">
            <div className="text-sm text-gray-500 mb-2">Metabot</div>
            <ul>
              <li
                className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${selected === 0 ? 'bg-blue-50' : ''}`}
                tabIndex={-1}
                onClick={() => { onClose(); onMetabotAsk && onMetabotAsk(query); }}
              >
                <span className="text-blue-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#60a5fa" strokeWidth="2"/></svg>
                </span>
                <span className="text-gray-800 text-sm font-medium">{metabotAsk.label}</span>
              </li>
            </ul>
            <div className="flex items-center gap-2 mt-2 mb-2">
              {metabotChips.map((s) => (
                <span
                  key={s.label}
                  className="inline-flex items-center px-2 py-1 text-xs bg-white rounded-md border border-gray-200 text-gray-700 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setQuery(s.label)
                    setTimeout(() => inputRef.current?.focus(), 0)
                  }}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
          <div className="p-4">
            <div className="text-sm text-gray-500 mb-2">Recent items</div>
            <ul>
              {recent.map((item, idxRecent) => (
                <li
                  key={item.label}
                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${selected === idxRecent + 1 ? 'bg-blue-50' : ''}`}
                >
                  <span className="text-blue-400">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#60a5fa" strokeWidth="2"/></svg>
                  </span>
                  <span className="text-gray-800 text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-gray-400 ml-2">— {item.desc}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4">
            <div className="text-sm text-gray-500 mb-2">Actions</div>
            <ul>
              {acts.map((action, idxActs) => (
                <li
                  key={action.label}
                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${selected === idxActs + 1 + recent.length ? 'bg-blue-50' : ''}`}
                >
                  <span className="text-blue-400 text-lg">{action.icon}</span>
                  <span className="text-gray-800 text-sm font-medium">{action.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="px-4 py-2 text-xs text-gray-400 border-t">↵ Select</div>
      </div>
    </div>
  )
} 