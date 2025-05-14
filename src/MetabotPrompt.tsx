import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import metabotSvg from './assets/metabot.svg'
import metabotLoadingSvg from './assets/metabot-loading.svg'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import './MetabotPrompt.css'

export type MetabotPromptHandle = {
  triggerLoading: (text: string) => void
  setInputValue: (text: string) => void
}

const MetabotPrompt = forwardRef<MetabotPromptHandle, { 
  onClose: () => void, 
  onMessageSubmit?: (content: string, isUser?: boolean) => void 
}>(
  function MetabotPrompt({ onClose, onMessageSubmit }, ref) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const [inputValue, setInputValue] = useState('')

    useImperativeHandle(ref, () => ({
      triggerLoading: (text: string) => {
        setInputValue(text)
        if (text.trim().toLowerCase() === 'customers') {
          setInputValue('')
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
          onMessageSubmit?.('customers', true)
          setLoading(true)
          setTimeout(() => {
            setLoading(false)
            setTimeout(() => {
              inputRef.current?.focus();
            }, 0);
            onMessageSubmit?.('What exactly would you like to know about customers?', false)
          }, 5000)
          return;
        }
        const isAnalyzeOrExplain = text.toLowerCase().includes('analyze') || text.toLowerCase().includes('explain')
        setLoading(true)
        setTimeout(() => {
          setLoading(false)
          setInputValue('')
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
          // Only dispatch the event if it's not an analyze/explain command
          if (!isAnalyzeOrExplain) {
            window.dispatchEvent(new Event('metabotPromptLoaded'))
          }
        }, 5000)
      },
      setInputValue: (text: string) => {
        setInputValue(text)
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0)
      }
    }))

    useEffect(() => {
      inputRef.current?.focus()
    }, [])

    // Handle Enter key to start loading
    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter' && !loading && inputValue.trim()) {
        if (inputValue.trim().toLowerCase() === 'customers') {
          setInputValue('')
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
          onMessageSubmit?.('customers', true)
          setLoading(true)
          setTimeout(() => {
            setLoading(false)
            setTimeout(() => {
              inputRef.current?.focus();
            }, 0);
            onMessageSubmit?.('What exactly would you like to know about customers?', false)
          }, 5000)
          return;
        }
        onMessageSubmit?.(inputValue.trim(), true)
        const isAnalyzeOrExplain = inputValue.toLowerCase().includes('analyze') || inputValue.toLowerCase().includes('explain')
        setInputValue('')
        setLoading(true)
        setTimeout(() => {
          setLoading(false)
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
          // Only dispatch the event if it's not an analyze/explain command
          if (!isAnalyzeOrExplain) {
            window.dispatchEvent(new Event('metabotPromptLoaded'))
          }
        }, 5000)
      }
    }

    return (
      <div
        className="relative"
        style={{
          width: 480,
          height: 48,
          borderRadius: 24,
          background: '#fff',
          boxShadow: '0px 12px 24px rgba(0,0,0,0.2), 0px 0px 0px 1px rgba(0,0,0,0.05)',
          overflow: 'visible',
        }}
      >
        {/* Static SVG border */}
        <svg
          width={480}
          height={48}
          opacity={0.5}
          viewBox="0 0 480 48"
          fill="none"
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          <rect
            x={0.5}
            y={0.5}
            width={479}
            height={47}
            rx={23}
            stroke="#E0E7EF"
          />
        </svg>
        {/* Animated SVG border */}
        <svg
          width={480}
          height={48}
          viewBox="0 0 480 48"
          fill="none"
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          <defs>
            <linearGradient id="prompt-border-gradient" x1="0" y1="24" x2="478" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2E96F1" />
              <stop offset="1" stopColor="#D932F4" />
            </linearGradient>
          </defs>
          <rect
            x={0.5}
            y={0.5}
            width={479}
            height={47}
            rx={23}
            stroke="url(#prompt-border-gradient)"
            className={loading ? 'prompt-stroke-animated' : ''}
            strokeWidth={1.5}
            fill="none"
          />
        </svg>
        {/* Icon */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 12,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
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
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Tell me to do something, or ask a question"
          className={`absolute bg-transparent outline-none border-none text-[14px] font-normal font-lato leading-6 placeholder-[#949AAB] ${inputValue ? 'text-[#182731]' : 'text-[#949AAB]'}`}
          style={{
            fontFamily: 'Lato, sans-serif',
            color: inputValue ? '#182731' : undefined,
            top: 6,
            left: 52,
            width: 300,
            height: 36,
            padding: 0,
            margin: 0,
            background: 'transparent',
          }}
          onKeyDown={handleKeyDown}
          disabled={loading}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
        {/* Close button */}
        <button
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
          onClick={onClose}
          tabIndex={0}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="#949AAB" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    )
  }
)

export default MetabotPrompt 