'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { Send, X, MessageCircle, Loader2, Bot, User, Package, ShoppingCart, Phone } from 'lucide-react'
import { useChat } from '@/context/ChatContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// Contact info - customize as needed
const CONTACT_PHONE = '+34633909095'
const CONTACT_WHATSAPP = '34633909095'

export default function Chatbot() {
  const { isOpen, toggleChat, closeChat, isEnabled } = useChat()
  const { data: session } = useSession()
  const t = useTranslations('chat')

  // All hooks must be declared before any conditional returns
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showContactOptions, setShowContactOptions] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get user's first name for personalized greeting
  const userName = session?.user?.name?.split(' ')[0] || null

  // Get welcome message content from translations
  const baseWelcomeMessage = t('welcomeMessage')
  const welcomeMessage = userName
    ? `¡Hola ${userName}! ${baseWelcomeMessage.replace(/^¡Hola!?\s*/i, '')}`
    : baseWelcomeMessage

  // Initialize messages with translated welcome message
  useEffect(() => {
    if (!initialized) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessage,
      }])
      setInitialized(true)
    }
  }, [initialized, welcomeMessage])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Don't render if chat is disabled (must be after all hooks)
  if (!isEnabled) {
    return null
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    setError(null)
    setIsLoading(true)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const serverError = errorData?.error || response.statusText
        console.error('Chat API error:', response.status, serverError)
        throw new Error(serverError || t('errorSending'))
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let assistantContent = ''
      const assistantId = (Date.now() + 1).toString()

      // Add empty assistant message
      setMessages([...updatedMessages, { id: assistantId, role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk

        // Update assistant message with new content
        setMessages([
          ...updatedMessages,
          { id: assistantId, role: 'assistant', content: assistantContent }
        ])
      }
    } catch (err) {
      console.error('Chat error:', err)
      setError(t('errorOccurred'))
      setMessages([
        ...updatedMessages,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: t('errorMessage') }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const message = inputValue.trim()
    setInputValue('')
    await sendMessage(message)
  }

  const handleQuickAction = async (text: string) => {
    setInputValue('')
    await sendMessage(text)
  }

  const handleContactHuman = () => {
    setShowContactOptions(!showContactOptions)
  }

  // Format message content with markdown-like parsing
  const formatMessage = (content: string) => {
    const lines = content.split('\n')
    return lines.map((line, i) => {
      // Handle bullet points
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <li key={i} className="ml-4 list-disc">
            {line.substring(2)}
          </li>
        )
      }
      // Handle bold text
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i} className="mb-1">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </p>
        )
      }
      // Regular line
      if (line.trim()) {
        return <p key={i} className="mb-1">{line}</p>
      }
      return <br key={i} />
    })
  }

  return (
    <>
      {/* Chat toggle button - only visible on desktop */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-4 z-50 p-4 rounded-full shadow-lg transition-all duration-300 hidden lg:block ${
          isOpen
            ? 'bg-neutral-600 hover:bg-neutral-700'
            : 'bg-primary-600 hover:bg-primary-700'
        }`}
        aria-label={isOpen ? t('closeChat') : t('openChat')}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-20 lg:bottom-24 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-neutral-200 transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{t('assistantName')}</h3>
              <p className="text-xs text-primary-100">{t('assistantSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Contact human button */}
            <button
              onClick={handleContactHuman}
              className={`p-2 rounded-full transition-colors ${
                showContactOptions
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              title={t('contactHuman')}
            >
              {showContactOptions ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Phone className="w-5 h-5 text-white" />
              )}
            </button>
            {/* Close button - visible on mobile */}
            <button
              onClick={closeChat}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors lg:hidden"
              aria-label={t('closeChat')}
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Contact options dropdown */}
        {showContactOptions && (
          <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg border border-neutral-200 p-3 z-10 min-w-[200px]">
            <p className="text-sm font-medium text-neutral-700 mb-2">{t('contactUs')}:</p>
            <a
              href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors text-sm text-neutral-700"
            >
              <Phone className="w-4 h-4 text-primary-600" />
              {t('call')}: {CONTACT_PHONE}
            </a>
            <a
              href={`https://wa.me/${CONTACT_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors text-sm text-neutral-700"
            >
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href="mailto:info@spheratile.com"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors text-sm text-neutral-700"
            >
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          </div>
        )}

        {/* Messages */}
        <div className="h-[350px] overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-primary-100'
                    : 'bg-neutral-100'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-primary-600" />
                ) : (
                  <Bot className="w-4 h-4 text-neutral-600" />
                )}
              </div>
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-md'
                    : 'bg-neutral-100 text-neutral-800 rounded-tl-md'
                }`}
              >
                <div className="text-sm">
                  {formatMessage(message.content)}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-neutral-600" />
              </div>
              <div className="bg-neutral-100 rounded-2xl rounded-tl-md p-3">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{t('typing')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick actions */}
        <div className="px-3 py-1.5 border-t border-neutral-100">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button
              type="button"
              onClick={() => handleQuickAction(t('quickActionWood'))}
              disabled={isLoading}
              className="flex-shrink-0 px-2 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 rounded-full transition-colors"
            >
              <Package className="w-3 h-3 inline mr-0.5" />
              {t('wood')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickAction(t('quickActionNonSlip'))}
              disabled={isLoading}
              className="flex-shrink-0 px-2 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 rounded-full transition-colors"
            >
              {t('nonSlip')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickAction(t('quickActionRecommended'))}
              disabled={isLoading}
              className="flex-shrink-0 px-2 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 rounded-full transition-colors"
            >
              <ShoppingCart className="w-3 h-3 inline mr-0.5" />
              {t('recommended')}
            </button>
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('inputPlaceholder')}
              className="flex-1 px-4 py-2.5 bg-neutral-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed rounded-full transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
