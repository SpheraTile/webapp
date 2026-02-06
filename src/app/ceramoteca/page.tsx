'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Camera } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { IconQR } from '@/components/ui/Icons'
import { QRCode } from '@/components/ui/QRCode'
import { QRScanner } from '@/components/ui/QRScanner'

export default function CeramotecaPage() {
  const t = useTranslations('ceramoteca')
  const [showScanner, setShowScanner] = useState(false)

  // URL del showroom/exposición en Google Maps
  const showroomUrl = 'https://maps.google.com/?q=Avenida+Del+Mediterráneo+113,+12200+Onda,+Castellón,+Spain'

  return (
    <div className="min-h-screen bg-white lg:bg-neutral-50">
      {/* QR Scanner Modal */}
      <QRScanner isOpen={showScanner} onClose={() => setShowScanner(false)} />

      <DesktopNav />
      <div className="lg:hidden">
        <Header titulo={t('title')} />
      </div>

      {/* Hero Desktop */}
      <div className="hidden lg:block relative h-[400px] bg-neutral-900 pt-20">
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
          alt="Ceramoteca"
          fill
          className="object-cover opacity-50"
        />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-6">
          <h1 className="text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-white/80 max-w-2xl">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Contenido mobile */}
      <div className="lg:hidden px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconQR size={40} className="text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            {t('title')}
          </h2>
          <p className="text-neutral-600 text-sm mb-6">
            {t('mobileSubtitle')}
          </p>

          {/* Scan button */}
          <button
            onClick={() => setShowScanner(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 active:scale-95 transition-all"
          >
            <Camera className="w-5 h-5" />
            {t('scanButton')}
          </button>
        </div>

        {/* Steps mobile */}
        <div className="space-y-4 mb-8">
          <StepCard
            number={1}
            title={t('step1TitleMobile')}
            description={t('step1DescMobile')}
          />
          <StepCard
            number={2}
            title={t('step2TitleMobile')}
            description={t('step2DescMobile')}
          />
          <StepCard
            number={3}
            title={t('step3TitleMobile')}
            description={t('step3DescMobile')}
          />
          <StepCard
            number={4}
            title={t('step4TitleMobile')}
            description={t('step4DescMobile')}
          />
        </div>

        {/* Example QR mobile - Showroom */}
        <div className="bg-neutral-50 rounded-xl p-6 text-center">
          <p className="text-sm text-neutral-500 mb-4">{t('showroom')}</p>
          <div className="inline-block bg-white p-4 rounded-lg shadow-sm">
            <QRCode value={showroomUrl} size={120} />
          </div>
          <p className="text-xs text-neutral-400 mt-3">
            {t('scanExample')}
          </p>
          <p className="text-xs font-medium text-primary-600 mt-1">
            {t('showroomName')}
          </p>
        </div>
      </div>

      {/* Contenido desktop */}
      <div className="hidden lg:block lg:max-w-6xl lg:mx-auto lg:px-6 lg:py-16">
        {/* Cómo funciona */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            {t('howItWorks')}
          </h2>
          <div className="grid grid-cols-4 gap-6">
            <StepCardDesktop
              number={1}
              title={t('step1Title')}
              description={t('step1Desc')}
              icon={
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
            />
            <StepCardDesktop
              number={2}
              title={t('step2Title')}
              description={t('step2Desc')}
              icon={
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                </svg>
              }
            />
            <StepCardDesktop
              number={3}
              title={t('step3Title')}
              description={t('step3Desc')}
              icon={
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              }
            />
            <StepCardDesktop
              number={4}
              title={t('step4Title')}
              description={t('step4Desc')}
              icon={
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Demo section - Showroom */}
        <div className="grid grid-cols-2 gap-12 items-center bg-white rounded-2xl shadow-sm p-12">
          <div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              {t('exampleQR')}
            </h3>
            <p className="text-neutral-600 mb-6">
              {t('exampleQRDesc')}
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-neutral-700">{t('feature1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-neutral-700">{t('feature2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-neutral-700">{t('feature3')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-neutral-700">{t('feature4')}</span>
              </li>
            </ul>
            <p className="text-sm text-neutral-500">
              {t('tryScan')}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-neutral-50 p-8 rounded-2xl">
              <QRCode value={showroomUrl} size={200} />
            </div>
            <p className="text-sm text-neutral-500 mt-4 text-center">
              {t('qrLeadsTo')}<br />
              <span className="font-mono text-xs text-primary-600">{t('showroomName')}</span>
            </p>
          </div>
        </div>

        {/* Dónde encontrar los QR */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            {t('whereToFind')}
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <DocumentCard
              title={t('ordersTitle')}
              description={t('ordersDesc')}
              icon={
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              }
            />
            <DocumentCard
              title={t('deliveryNotesTitle')}
              description={t('deliveryNotesDesc')}
              icon={
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              }
            />
            <DocumentCard
              title={t('invoicesTitle')}
              description={t('invoicesDesc')}
              icon={
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 11.625h4.5m-4.5 2.25h4.5m2.121 1.527c-1.171 1.464-3.07 1.464-4.242 0-1.172-1.465-1.172-3.84 0-5.304 1.171-1.464 3.07-1.464 4.242 0M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
      <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
        {number}
      </span>
      <div>
        <h3 className="font-medium text-neutral-900 mb-0.5">{title}</h3>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
    </div>
  )
}

function StepCardDesktop({
  number,
  title,
  description,
  icon,
}: {
  number: number
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="text-center">
      <div className="relative">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
          {icon}
        </div>
        <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
          {number}
        </span>
      </div>
      <h3 className="font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-neutral-600">{description}</p>
    </div>
  )
}

function DocumentCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
      <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600">{description}</p>
    </div>
  )
}
