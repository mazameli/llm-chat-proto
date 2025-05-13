import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MetabotPrompt from './MetabotPrompt'

type Message = {
  id: string
  content: string
  isUser: boolean
}

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

  useEffect(() => {
    if (initialQuery) {
      setMessages([{ id: '1', content: initialQuery, isUser: true }])
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

  const clearChat = () => {
    setMessages([])
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-medium">Metabot Chat</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Clear chat"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M13.3333 5L5 13.3333M5 5L13.3333 13.3333" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
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
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
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
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Warning message */}
          {showLongChatWarning && (
            <div className="px-4 py-2 text-sm text-gray-500 text-center">
              This chat is getting long.{' '}
              <button
                onClick={clearChat}
                className="text-blue-500 hover:text-blue-600 underline"
              >
                Clear it
              </button>
            </div>
          )}

          {/* Prompt */}
          <div className="p-4 border-t">
            <MetabotPrompt onClose={onClose} source="palette" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 