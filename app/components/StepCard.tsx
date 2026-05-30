type StepCardProps = {
  step: string
  title: string
  description: string
}

export default function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="text-center px-4">
      <div className="text-5xl font-bold text-gray-200 mb-3">{step}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
