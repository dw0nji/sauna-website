import SectionWrapper from './SectionWrapper'
import TestimonialCard from './TestimonialCard'

const TESTIMONIALS = [
  {
    name: 'Erin C.',
    text: "Hiked up Ben Nevis and went for the best sauna afterwards, perfect evening to complete the day.",
    rating: 5,
  },
  {
    name: 'Jonathan E',
    text: "Went with with my family and had a great experience. Great value for money.",
    rating: 5,
  },
  {
    name: 'Priya K.',
    text: "The team was friendly and the online booking process was super easy.",
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <SectionWrapper
      id="testimonials"
      title="What Our Guests Say"
      subtitle="Real reviews from real guests."
      className="bg-gray-50"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t) => (
          <TestimonialCard key={t.name} {...t} />
        ))}
      </div>
    </SectionWrapper>
  )
}
