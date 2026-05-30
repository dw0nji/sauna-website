import Image from 'next/image'
import Button from './Button'
import SecondaryButton from './SecondaryButton'

export default function Hero() {
  return (
    <section className="relative py-28 text-center min-h-[80lvh] flex items-center justify-center">
      <Image
        src="/sauna_outside.jpeg"
        alt="Sauna background"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <h1 className="text-5xl font-bold tracking-tight mb-6 text-white">Cool Coo <a className='text-amber-500'>Sauna</a></h1>
        <p className="text-xl text-white mb-10">
          Book your private sauna session and experience true relaxation, on your schedule.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="#booking">Book a Session</Button>
          <SecondaryButton href="#amenities">View more</SecondaryButton>
        </div>
      </div>
    </section>
  )
}
