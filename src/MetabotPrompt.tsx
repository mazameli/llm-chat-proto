import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import metabotSvg from './assets/metabot.svg'
import metabotLoadingSvg from './assets/metabot-loading.svg'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import './MetabotPrompt.css'

export type MetabotPromptHandle = {
  triggerLoading: (text: string) => void
}

const MetabotPrompt = forwardRef<MetabotPromptHandle, { onClose: () => void, source: 'palette' | 'hotkey' }>(
  function MetabotPrompt({ onClose, source }, ref) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [fadeResult, setFadeResult] = useState(false)
    const [inputValue, setInputValue] = useState('')

    useImperativeHandle(ref, () => ({
      triggerLoading: (text: string) => {
        setInputValue(text)
        setLoading(true)
        setShowResult(false)
        setFadeResult(false)
        setTimeout(() => {
          setLoading(false)
          setShowResult(true)
          setFadeResult(false)
          setInputValue('')
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
          setTimeout(() => setFadeResult(true), 5000)
          setTimeout(() => setShowResult(false), 6000)
          // Dispatch event to signal loading finished
          window.dispatchEvent(new Event('metabotPromptLoaded'))
        }, 5000)
      }
    }))

    useEffect(() => {
      inputRef.current?.focus()
    }, [])

    // Handle Enter key to start loading
    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter' && !loading) {
        setLoading(true)
        setShowResult(false)
        setFadeResult(false)
        setTimeout(() => {
          setLoading(false)
          setShowResult(true)
          setFadeResult(false)
          setInputValue('')
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
          setTimeout(() => setFadeResult(true), 5000)
          setTimeout(() => setShowResult(false), 6000)
          // Dispatch event to signal loading finished
          window.dispatchEvent(new Event('metabotPromptLoaded'))
        }, 5000)
      }
    }

    // SVG border dimensions
    const width = 480
    const height = 48
    const radius = 22.5
    const strokeWidth = 2
    const rectWidth = width - strokeWidth
    const rectHeight = height - strokeWidth

    return (
      <>
        {/* Result message above the prompt */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: fadeResult ? 0 : 1, y: fadeResult ? 20 : 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="absolute left-0 w-full flex justify-center z-[100] pointer-events-none"
              style={{ bottom: height + 40 }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: width,
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 4,
                  paddingBottom: 4,
                  background: '#509EE3',
                  borderRadius: 62,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 8,
                  display: 'inline-flex',
                  pointerEvents: 'auto',
                }}
              >
                <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex' }}>
                  <div style={{ color: 'white', fontSize: 14, fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px', wordWrap: 'break-word' }}>
                    Here's the count of Customers by Created At in the last 3 months.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Prompt */}
        <div className="relative flex items-center justify-center">
          {/* SVG border animation */}
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            className="absolute left-0 top-0"
            style={{ zIndex: 2, pointerEvents: 'none' }}
          >
            <defs>
              <linearGradient id="prompt-border-gradient" x1="0" y1={height/2} x2={width} y2={height/2} gradientUnits="userSpaceOnUse">
                <stop stopColor="#2E96F1" />
                <stop offset="1" stopColor="#D932F4" />
              </linearGradient>
            </defs>
            {/* Static border */}
            <rect
              x={strokeWidth/2}
              y={strokeWidth/2}
              width={rectWidth}
              height={rectHeight}
              rx={radius}
              stroke="#E0E7EF"
              strokeWidth={strokeWidth}
              fill="none"
              opacity={0.5}
            />
            {/* Animated border */}
            <rect
              x={strokeWidth/2}
              y={strokeWidth/2}
              width={rectWidth}
              height={rectHeight}
              rx={radius}
              stroke="url(#prompt-border-gradient)"
              strokeWidth={strokeWidth}
              fill="none"
              className={loading ? 'prompt-stroke-animated' : ''}
            />
          </svg>
          {/* Inner prompt content (stationary, above border) */}
          <div
            className="relative flex items-center justify-between bg-white shadow-[0px_2px_13.8px_-1px_rgba(24,113,191,0.32)] rounded-full px-4 py-2 gap-4"
            style={{ maxWidth: width - 4, minWidth: width - 4, height: height - 4, zIndex: 3 }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0 relative">
              {/* SVG and Lottie overlay */}
              <div className="relative" style={{ width: 32, height: 24 }}>
                <img
                  src={loading ? metabotLoadingSvg : metabotSvg}
                  alt="Metabot"
                  style={{ width: 32, height: 24, display: 'block' }}
                />
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
                    <DotLottieReact
                      src="https://lottie.host/c63e8f0b-8e11-4788-9a34-a936a0930125/Wl1PMub97G.lottie"
                      loop
                      autoplay
                      style={{ width: 32, height: 24 }}
                    />
                  </div>
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Tell me to do something, or ask a question"
                className={`flex-1 bg-transparent outline-none border-none text-[14px] font-normal font-lato leading-6 placeholder-[#949AAB] min-w-0 ${inputValue ? 'text-[#182731]' : 'text-[#949AAB]'}`}
                style={{ fontFamily: 'Lato, sans-serif', color: inputValue ? '#182731' : undefined }}
                onKeyDown={handleKeyDown}
                disabled={loading}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
              />
            </div>
            <button
              className="ml-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              style={{ minWidth: 24, minHeight: 24 }}
              onClick={onClose}
              tabIndex={0}
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="#949AAB" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </>
    )
  }
)

export default MetabotPrompt 