import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import CommandPalette from './CommandPalette'
import MetabotPrompt from './MetabotPrompt'
import SidePanel from './SidePanel'
import bgInitialImage from './assets/bg-initial.png'
import bgImage from './assets/bg.png'
import loadingSpinnerSvg from './assets/loading-spinner.png'

type PromptSource = 'palette' | 'hotkey'

function Spinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-80">
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
  const metabotPromptRef = useRef<{ triggerLoading: (text: string) => void } | null>(null)
  const [showBg, setShowBg] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)
  const [sidePanelOpen, setSidePanelOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Command+B toggles prompt
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        setShowPrompt((prev) => !prev)
        setPromptSource('hotkey')
        e.preventDefault()
      }
      // Command+K toggles command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        setPaletteOpen((prev) => !prev)
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // When metabotQuery is set, show the side panel
  useEffect(() => {
    if (metabotQuery !== null) {
      setSidePanelOpen(true)
      setPaletteOpen(false)
      setMetabotQuery(null)
    }
  }, [metabotQuery])

  // Listen for MetabotPrompt loading finish
  useEffect(() => {
    // We'll use a custom event to signal loading finished from MetabotPrompt
    function onPromptLoaded() {
      setShowSpinner(true)
      setTimeout(() => {
        setShowSpinner(false)
        setShowBg(true)
      }, 3000)
    }
    window.addEventListener('metabotPromptLoaded', onPromptLoaded)
    return () => window.removeEventListener('metabotPromptLoaded', onPromptLoaded)
  }, [])

  const handleClick = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Fixed background image at actual size, bottom center */}
      <img
        src={showBg ? bgImage : bgInitialImage}
        alt="background"
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 0,
          transform: 'translateX(-50%)',
          zIndex: 0,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        draggable={false}
      />
      {showSpinner && <Spinner />}
      <header className="w-full bg-gray-200 h-12 flex items-center px-0 sm:px-8 relative z-10">
        <div className="flex-1" />
        <div className="flex items-center justify-end w-full">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z"/></svg>
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
      <main className="p-8 relative z-10"></main>
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
      <SidePanel
        isOpen={sidePanelOpen}
        onClose={() => setSidePanelOpen(false)}
        initialQuery={metabotQuery || undefined}
      />
    </div>
  )
}

export default App 