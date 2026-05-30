import SectionWrapper from './SectionWrapper'
import AmenityCard from './AmenityCard'

const AMENITIES = [
  {
    name: 'Finnish Sauna',
    url: '/sauna_inside.jpeg',
    description:
      'A classic wood-lined Finnish sauna that reaches up to 90°C. Bench seating for up to six guests, built from kiln-dried Nordic spruce.',
  },
  {
    name: 'Cold Plunge',
    url: '/plunge.jpeg',
    description:
      'An outdoor cold plunge pool held at 8–12°C. The ultimate contrast to the heat — stimulates circulation and leaves you feeling electric.',
  },
  {
    name: 'Firepit',
    url: '/fire.jpeg',
    description:
      'Gather around the open firepit between rounds. Unwind under the sky, dry off, and soak in the atmosphere before your next session.',
  },
  {
    name: 'Löyly Rocks',
    url: '/fireplace.jpeg',
    description:
      'Carefully selected volcanic rocks that hold heat and release a burst of steam when water is poured over them. The heart of every great sauna.',
  },
]

export default function AmenitiesSection() {
  return (
    <section id="amenities" className='py-20 xl:mx-20 mx-auto'>
        <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">The Experience</h2>
              <p className="text-gray-600">One sauna. Four things that make it unforgettable.</p>
            </div>
        </div>
        <div className="grid md:grid-cols-2 ">
          {AMENITIES.map((amenity) => (
            <AmenityCard key={amenity.name} {...amenity} />
          ))}
        </div>
      </section>
  )
}
