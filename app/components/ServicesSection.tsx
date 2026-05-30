import SectionWrapper from './SectionWrapper'
import ServiceCard from './ServiceCard'

const SERVICES = [
  {
    title: 'Classic Finnish Sauna',
    description:
      'Traditional dry heat experience in our authentic wood-panelled sauna. Perfect for deep muscle relaxation and detox.',
    duration: '60 min',
    price: '$45',
  },
  {
    title: 'Steam Room Session',
    description:
      'Moist heat therapy that opens pores, soothes respiratory passages, and leaves your skin glowing.',
    duration: '45 min',
    price: '$35',
  },
  {
    title: 'Private Couples Package',
    description:
      'A romantic shared sauna experience for two, including complimentary herbal tea and towels.',
    duration: '90 min',
    price: '$80',
    badge: 'Popular',
  },
]

export default function ServicesSection() {
  return (
    <SectionWrapper
      id="services"
      title="Our Services"
      subtitle="Choose the experience that suits you best."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SERVICES.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>
    </SectionWrapper>
  )
}
