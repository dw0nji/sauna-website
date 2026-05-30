type SectionWrapperProps = {
  id?: string
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export default function SectionWrapper({
  id,
  title,
  subtitle,
  children,
  className = '',
}: SectionWrapperProps) {
  return (
    <section id={id} className={`py-20 ${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">{title}</h2>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
