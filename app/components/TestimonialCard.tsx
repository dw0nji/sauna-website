type TestimonialCardProps = {
  name: string
  text: string
  rating: number
}

export default function TestimonialCard({ name, text, rating }: TestimonialCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col gap-4">
      <div className="flex gap-0.5 text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < rating ? 'opacity-100' : 'opacity-20'}>
            ★
          </span>
        ))}
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed flex-1">"{text}"</p>
      <span className="text-sm font-medium text-gray-900 dark:text-white">- {name}</span>
    </div>
  )
}
