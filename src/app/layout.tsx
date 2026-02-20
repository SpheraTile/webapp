import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { CestaProvider } from '@/context/CestaContext'
import { ChatProvider } from '@/context/ChatContext'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { AddToHomeScreen } from '@/components/ui/AddToHomeScreen'
import Chatbot from '@/components/chat/Chatbot'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SPHERA TILE - Catálogo de Cerámica',
  description:
    'Catálogo profesional de cerámica para distribuidores y profesionales. Explora nuestro amplio catálogo de porcelánico, gres y azulejos.',
  keywords: [
    'cerámica',
    'porcelánico',
    'azulejos',
    'gres',
    'catálogo',
    'B2B',
    'distribuidores',
  ],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1b5e20',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} bg-white`} suppressHydrationWarning>
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <CestaProvider>
              <ChatProvider>
                <main className="min-h-screen pb-20 lg:pb-0 lg:pt-0">{children}</main>
                <BottomNavigation />
                <Chatbot />
                <AddToHomeScreen />
              </ChatProvider>
            </CestaProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
