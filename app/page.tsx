import Navbar from './components/Navbar'
import Hero from './components/Hero'
import AmenitiesSection from './components/AmenitiesSection'
import BookingSection from './components/BookingSection'
import TestimonialsSection from './components/TestimonialsSection'
import Footer from './components/Footer'
import { TimeslotsProvider } from './components/BookingProvider'

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <AmenitiesSection />
        <TimeslotsProvider>
          <BookingSection />
        </TimeslotsProvider>
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  )
}
