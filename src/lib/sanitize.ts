/**
 * Sanitization utilities to prevent XSS attacks
 */

/**
 * Basic HTML sanitization - removes potentially dangerous HTML tags and attributes
 * For production, consider using a library like DOMPurify
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove dangerous event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')

  // Remove data URLs except images
  sanitized = sanitized.replace(/data:(?!image\/(png|jpeg|gif|webp));/gi, '')

  return sanitized
}

/**
 * Sanitize user input for text content (not HTML)
 */
export function sanitizeText(text: string): string {
  if (!text) return ''

  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Safe markdown-like formatting (basic implementation)
 * This is a simplified version - for production use a proper markdown library
 */
export function formatMessageSafely(content: string): string {
  if (!content) return ''

  let formatted = sanitizeText(content)

  // Allow bold (**text**)
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Allow italic (*text*)
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Allow code (`text`)
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>')

  return formatted
}

/**
 * Validate URL to prevent javascript: and other dangerous protocols
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false

  try {
    const parsed = new URL(url)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return ''

  // Remove path separators and dangerous characters
  return filename
    .replace(/[\/\\]/g, '') // Remove path separators
    .replace(/\.\./g, '') // Remove double dots (path traversal)
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .substring(0, 255) // Limit length
}
