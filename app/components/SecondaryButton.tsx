type SecondaryButtonProps = {
  href?: string
  children: React.ReactNode
  className?: string
}

export default function SecondaryButton({ href, children, className = '' }: SecondaryButtonProps) {
  const base = `inline-block bg-gray-50 text-gray-700 px-8 py-3 rounded font-medium hover:bg-gray-300 transition-colors ${className}`
  if (href) return <a href={href} className={base}>{children}</a>
  return <button type="button" className={base}>{children}</button>
}
