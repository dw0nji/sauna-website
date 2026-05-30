type ButtonProps = {
  href?: string
  children: React.ReactNode
  className?: string
}

export default function Button({ href, children, className = '' }: ButtonProps) {
  const base = `inline-block border border-white text-white px-8 py-3 rounded font-medium hover:bg-gray-300/50 transition-colors ${className}`
  if (href) return <a href={href} className={base}>{children}</a>
  return <button type="button" className={base}>{children}</button>
}
