import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  href?: string
  className?: string
  textColor?: 'dark' | 'light'
}

const sizeConfig = {
  sm: { image: 32, text: 'text-lg' },
  md: { image: 40, text: 'text-xl' },
  lg: { image: 48, text: 'text-2xl' },
  xl: { image: 56, text: 'text-3xl' },
}

export function Logo({
  size = 'md',
  showText = true,
  href = '/',
  className = '',
  textColor = 'dark',
}: LogoProps) {
  const config = sizeConfig[size]

  const textColorClass = textColor === 'light'
    ? 'text-white'
    : 'text-primary-600'

  const secondaryTextClass = textColor === 'light'
    ? 'text-primary-300'
    : 'text-primary-800'

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo-sphera.webp"
        alt="SPHERA TILE"
        width={config.image}
        height={config.image}
        className="object-contain"
        priority
      />
      {showText && (
        <span className={`font-bold ${config.text} tracking-tight ${textColorClass}`}>
          SPHERA<span className={secondaryTextClass}>TILE</span>
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    )
  }

  return content
}
