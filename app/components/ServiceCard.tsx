type ServiceCardProps = {
  title: string
  description: string
  duration: string
  price: string
  badge?: string
}

export default function ServiceCard({
  title,
  description,
  duration,
  price,
  badge,
}: ServiceCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 flex flex-col gap-4 relative">
      {badge && (
        <span className="absolute top-4 right-4 text-xs font-medium bg-gray-900 text-white px-2 py-1 rounded">
          {badge}
        </span>
      )}
      <h3 className="text-lg font-semibold pr-16">{title}</h3>
      <p className="text-gray-600 text-sm flex-1">{description}</p>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">{duration}</span>
        <span className="font-semibold text-gray-900">{price}</span>
      </div>
      <a
        href="#booking"
        className="block text-center border border-gray-900 text-gray-900 py-2 rounded text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors"
      >
        Book This
      </a>
    </div>
  )
}
