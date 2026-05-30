import SectionWrapper from './SectionWrapper'
import TestimonialCard from './TestimonialCard'

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    text: "The best sauna experience I've had. Spotless facility, peaceful atmosphere, and totally rejuvenating.",
    rating: 5,
  },
  {
    name: 'James T.',
    text: "Booked the couples package for our anniversary. Perfect evening from start to finish. Highly recommend!",
    rating: 5,
  },
  {
    name: 'Priya K.',
    text: "Great value for money. The team was friendly and the online booking process was super easy.",
    rating: 4,
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
