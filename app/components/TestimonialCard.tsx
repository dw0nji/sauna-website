type TestimonialCardProps = {
  name: string
  text: string
  rating: number
}

export default function TestimonialCard({ name, text, rating }: TestimonialCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
      <div className="flex gap-0.5 text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < rating ? 'opacity-100' : 'opacity-20'}>
            ★
          </span>
        ))}
      </div>
      <p className="text-gray-700 text-sm leading-relaxed flex-1">"{text}"</p>
      <span className="text-sm font-medium text-gray-900">- {name}</span>
    </div>
  )
}
