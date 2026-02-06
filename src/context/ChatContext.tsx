'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ChatContextType {
  isOpen: boolean
  isEnabled: boolean
  isLoading: boolean
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true) // Default to true while loading
  const [isLoading, setIsLoading] = useState(true)

  // Fetch chat_enabled setting from API
  const fetchChatEnabled = async () => {
    try {
      const response = await fetch('/api/configuracion?clave=chat_enabled')
      if (response.ok) {
        const data = await response.json()
        // If no config exists or value is 'true', enable chat
        setIsEnabled(data.valor === null || data.valor === 'true')
      }
    } catch (error) {
      console.error('Error fetching chat config:', error)
      // Default to enabled on error
      setIsEnabled(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchChatEnabled()
  }, [])

  // Refetch when page becomes visible (user returns from admin)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchChatEnabled()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Poll for changes every 5 seconds when page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchChatEnabled()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const openChat = () => setIsOpen(true)
  const closeChat = () => setIsOpen(false)
  const toggleChat = () => setIsOpen(prev => !prev)

  return (
    <ChatContext.Provider value={{ isOpen, isEnabled, isLoading, openChat, closeChat, toggleChat }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
