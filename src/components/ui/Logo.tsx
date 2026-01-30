import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  href?: string
  className?: string
}

const sizeConfig = {
  sm: { width: 120, height: 32 },
  md: { width: 150, height: 40 },
  lg: { width: 180, height: 48 },
  xl: { width: 220, height: 56 },
}

export function Logo({
  size = 'md',
  href = '/',
  className = '',
}: LogoProps) {
  const config = sizeConfig[size]

  const content = (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo-sphera.webp"
        alt="SPHERA TILE"
        width={config.width}
        height={config.height}
        className="object-contain"
        priority
      />
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
