import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import CommandPalette from './CommandPalette'
import MetabotPrompt from './MetabotPrompt'
import SidePanel from './SidePanel'
import Visualization from './Visualization'
import loadingSpinnerSvg from './assets/loading-spinner.png'
import MetabotIcon from './assets/metabot_icon.svg'
import type { MetabotPromptHandle } from './MetabotPrompt'

type PromptSource = 'palette' | 'hotkey'

function Spinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-white bg-opacity-80">
      <img src={loadingSpinnerSvg} alt="Loading..." className="w-12 h-12 animate-spin" />
    </div>
  )
}

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [promptSource, setPromptSource] = useState<PromptSource>('palette')
  const [metabotQuery, setMetabotQuery] = useState<string | null>(null)
  const metabotPromptRef = useRef<MetabotPromptHandle | null>(null)
  const [showSpinner, setShowSpinner] = useState(false)
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      console.log('keydown event:', e.key, e.metaKey, e.ctrlKey)
      // Command+B toggles side panel
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        console.log('Toggling sidePanelOpen. Current value:', sidePanelOpen)
        setSidePanelOpen(prev => {
          console.log('sidePanelOpen will become:', !prev)
          return !prev
        })
        e.preventDefault()
      }
      // Command+K toggles command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        setPaletteOpen((prev) => !prev)
        e.preventDefault()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // When metabotQuery is set, show the side panel and trigger the prompt
  useEffect(() => {
    if (metabotQuery !== null) {
      setSidePanelOpen(true)
      setPaletteOpen(false)
      // Wait for the side panel to open before triggering the prompt
      setTimeout(() => {
        metabotPromptRef.current?.triggerLoading(metabotQuery)
      }, 100)
    }
  }, [metabotQuery])

  // Listen for MetabotPrompt loading finish
  useEffect(() => {
    // We'll use a custom event to signal loading finished from MetabotPrompt
    function onPromptLoaded() {
      setShowSpinner(true)
      setTimeout(() => {
        setShowSpinner(false)
        setShowVisualization(true)
      }, 3000)
    }
    window.addEventListener('metabotPromptLoaded', onPromptLoaded)
    return () => window.removeEventListener('metabotPromptLoaded', onPromptLoaded)
  }, [])

  const handleClick = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  // Move this log outside of the return
  console.log('Rendering App. sidePanelOpen:', sidePanelOpen)

  return (
    <div className="min-h-screen bg-white relative">
      <header className="w-full bg-gray-200 h-12 flex items-center px-0 sm:px-8 relative z-10">
        <div className="flex-1" />
        <div className="flex items-center justify-end w-full">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <img
                src={MetabotIcon}
                alt="Metabot"
                width={18}
                height={18}
                className="cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  setSidePanelOpen(prev => !prev)
                }}
                tabIndex={0}
                role="button"
              />
            </span>
            <input
              type="text"
              placeholder="Ask Metabot or search"
              className="pl-10 pr-4 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm w-64 shadow-sm"
              onFocus={() => setPaletteOpen(true)}
              onClick={() => setPaletteOpen(true)}
              readOnly
            />
          </div>
        </div>
      </header>
      <div className="flex h-[calc(100vh-3rem)] w-screen max-w-screen overflow-hidden">
        <main className="flex-1 relative z-10">
          {showSpinner && <Spinner />}
          {showVisualization ? (
            <Visualization sidePanelOpen={sidePanelOpen} />
          ) : (
            <div className="p-8">
              <div className="max-w-3xl mx-auto mt-16">
                <h2 className="text-4xl font-semibold text-gray-700 mb-4">How's it going, Maz?</h2>
                <p className="text-lg text-gray-600">Ask me anything about your data or use the search bar above to get started.</p>
              </div>
            </div>
          )}
        </main>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: sidePanelOpen ? 500 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="h-full overflow-hidden"
        >
          <SidePanel
            isOpen={sidePanelOpen}
            onClose={() => setSidePanelOpen(false)}
            initialQuery={metabotQuery || undefined}
          />
        </motion.div>
      </div>
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onMetabotAsk={(query?: string) => {
          setMetabotQuery(query || '')
        }}
      />
      {showPrompt && (
        <MetabotPrompt
          ref={metabotPromptRef}
          onClose={() => setShowPrompt(false)}
          source={promptSource}
        />
      )}
    </div>
  )
}

export default App 