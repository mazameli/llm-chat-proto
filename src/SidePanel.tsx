import { useState, useRef, useEffect } from 'react'
import MetabotPrompt, { MetabotPromptHandle } from './MetabotPrompt'
import ReactMarkdown from 'react-markdown'
import trashPng from './assets/trash.png'
import copySvg from './assets/copy.svg'

type Message = {
  id: string
  content: string
  isUser: boolean
  isMarkdown?: boolean
}

const ANALYSIS_RESPONSE = `# Analysis of the Chart

## Overall Trend
The data shows significant variability, with frequent spikes and dips in the count over time. There is no clear long-term upward or downward trend.

## Notable Peaks
- **Early February 2025**: A high count (~40) is observed, followed by a sharp decline.
- **Mid-March 2025**: Another spike (~30) occurs, followed by a drop.
- **Mid-April 2025**: The highest peak (~50) is recorded, followed by a steep decline.

## Correlation with Events
- The early February spike could be linked to the "Metabase 53 announcement" (Feb 11) or other February events, though the exact cause is unclear.
- The mid-March spike aligns with the "Checkout refactoring (anti-spam)" (March 25) and "53.8.3 Cloud default" (March 26). These updates may have driven activity.
- The mid-April peak coincides with the "Product Hunt launch" (April 7) and "Storage addition on checkout" (April 9). These events likely contributed to the surge.

## Post-Peak Declines
Each spike is followed by a sharp drop, suggesting these increases are event-driven rather than sustained growth.

## Periodic Patterns
There is no clear cyclical pattern (e.g., weekly or monthly), but spikes often align with significant events.

## Impact of Benchmark Cleanups
The benchmark cleanups (April 4 and April 14) may have influenced the mid-April spike, as they improved performance and expectations.

## Summary
The spikes in activity are closely tied to significant events like product launches, updates, and cleanups. Sustained growth may require strategies to maintain engagement post-event.`

const metabotSuggestions = [
  'Customers over time',
  'Accounts in Europe',
  'Top performing products',
]

export default function SidePanel({ 
  isOpen, 
  onClose, 
  initialQuery 
}: { 
  isOpen: boolean
  onClose: () => void
  initialQuery?: string 
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [showLongChatWarning, setShowLongChatWarning] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const promptRef = useRef<MetabotPromptHandle>(null)

  useEffect(() => {
    if (initialQuery) {
      setMessages([{ id: '1', content: initialQuery, isUser: true }])
      setTimeout(() => {
        promptRef.current?.triggerLoading(initialQuery)
      }, 0)
    }
  }, [initialQuery])

  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      setShowLongChatWarning(scrollHeight > clientHeight)
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Listen for MetabotPrompt loading finish
  useEffect(() => {
    function onPromptLoaded() {
      // Only add the response message if the last message doesn't contain analyze/explain
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && !lastMessage.content.toLowerCase().includes('analyze') && !lastMessage.content.toLowerCase().includes('explain')) {
        const newMessage: Message = {
          id: Date.now().toString(),
          content: "Here's the count of Customers by Created At in the last 3 months.",
          isUser: false
        }
        setMessages(prev => [...prev, newMessage])
      }
    }
    window.addEventListener('metabotPromptLoaded', onPromptLoaded)
    return () => window.removeEventListener('metabotPromptLoaded', onPromptLoaded)
  }, [messages])

  const clearChat = () => {
    setMessages([])
  }

  const addMessage = (content: string, isUser: boolean = true) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser
    }
    setMessages(prev => [...prev, newMessage])

    // Only check for analyze/explain if this is a user message
    if (isUser && (content.toLowerCase().includes('analyze') || content.toLowerCase().includes('explain'))) {
      // Add the analysis response after a delay
      setTimeout(() => {
        const analysisMessage: Message = {
          id: Date.now().toString(),
          content: ANALYSIS_RESPONSE,
          isUser: false,
          isMarkdown: true
        }
        setMessages(prev => [...prev, analysisMessage])
      }, 5000) // Match the loading delay
    }
  }

  return (
    <div className="h-full w-[480px] border-l border-gray-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <h2 className="text-lg font-medium">Metabot Chat</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Clear chat"
          >
            <img src={trashPng} alt="Clear chat" width={20} height={20} />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Close panel"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E1 transparent'
        }}
      >
        <div className="flex-1" />
        {messages.length === 0 ? (
          <div className="flex items-center justify-center flex-1 flex-col">
            <span className="text-gray-400 text-sm text-center max-w-sm mb-6">
              Try asking a question about a model or a metric, like<br />
              <span className="italic">"how many customers do we have in the pacific northwest?"</span>
            </span>
            <div className="flex flex-row gap-2 mt-auto">
              {metabotSuggestions.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center px-2 py-1 text-xs bg-white rounded-md border border-gray-200 text-gray-700 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => promptRef.current?.setInputValue(s)}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  } ${message.isMarkdown ? 'prose prose-sm max-w-none' : ''}`}
                >
                  {message.isMarkdown ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    message.content
                  )}
                  {/* Copy icon for non-user messages */}
                  {!message.isUser && (
                    <CopyButton content={message.content} />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Warning message */}
      {showLongChatWarning && (
        <div className="px-4 py-2 text-sm text-gray-500 text-center shrink-0">
          This chat is getting long.{' '} You can {' '}
          <button
            onClick={clearChat}
            className="text-blue-500 hover:text-blue-600 underline"
          >
            clear it
          </button>.
        </div>
      )}

      {/* Prompt */}
      <div className="p-4 shrink-0">
        <MetabotPrompt ref={promptRef} onClose={onClose} source="palette" onMessageSubmit={addMessage} />
      </div>
    </div>
  )
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (e) {
      // fallback or error
    }
  }
  return (
    <div className="flex justify-end mt-2">
      <button
        onClick={handleCopy}
        className="p-1 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
        title="Copy to clipboard"
        style={{ lineHeight: 0 }}
      >
        <img src={copySvg} alt="Copy" width={16} height={16} />
        {copied && <span className="text-xs text-gray-500 ml-1">Copied!</span>}
      </button>
    </div>
  )
} 