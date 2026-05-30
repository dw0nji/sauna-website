'use client'

import { useState } from 'react'
import SectionWrapper from './SectionWrapper'
import FormField from './FormField'
import { useBooking } from './BookingProvider'
import { Booking, TimeSlot } from './models/Booker'


const INPUT =
  'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400'

type FormData = {
  name: string
  email: string
  phone: string
  date: string
  time: string
  guests: string
  notes: string
}

const EMPTY: FormData = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  guests: '1',
  notes: '',
}

export default function BookingForm() {
  const [form, setForm] = useState<FormData>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [slotLoad, setSlotLoad] = useState(false)
  const [timeslots, setTimeslots] = useState<TimeSlot[]>([])
  const { controller } = useBooking()

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!controller) return

    setSubmitting(true)
    setSubmitError(null)

    const booking: Booking = {
      id: Date.now(),
      date: form.date,
      time: form.time,
      status: 'confirmed',
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
    }

    try {
      const slot = timeslots.find((slot)=>{
        if (slot.time === form.time && slot.date === form.date){
          return slot
        }
      })
      if (slot){
        await controller.createBooking(booking)
        await controller.cancelTimeSlot(slot.id)
      }else{
        throw new Error('There was a problem processing your booking.')
      }
      setSubmitted(true)
    } catch (err) {
      setSubmitError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleAvailability(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    handleChange(e)
    setSlotLoad(true)
    try {
      const slots = controller?.getAvailableTimeSlots(e.target.value)
      setTimeslots(slots ??  [])
    } finally {
      setSlotLoad(false)
    }
  }

  if (submitted) {
    return (
      <SectionWrapper id="booking" title="Booking Received!">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-gray-600 mb-6">
            Thanks, <strong>{form.name}</strong>! We'll send a confirmation to{' '}
            <strong>{form.email}</strong> shortly.
          </p>
          <button
            className="text-sm text-gray-500 underline hover:text-gray-800 cursor-pointer"
            onClick={() => { setForm(EMPTY); setSubmitted(false) }}
          >
            Make another booking
          </button>
        </div>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper
      id="booking"
      title="Book a Session"
      subtitle="Reserve the sauna for your group — includes the cold plunge and firepit."
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        <FormField label="Full Name">
          <input
            className={INPUT}
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Jane Smith"
          />
        </FormField>

        <FormField label="Email">
          <input
            className={INPUT}
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="jane@example.com"
          />
        </FormField>

        <FormField label="Phone">
          <input
            className={INPUT}
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+1 555 0100"
          />
        </FormField>

        <FormField label="Number of Guests">
          <input
            className={INPUT}
            name="guests"
            type="number"
            min="1"
            max="6"
            value={form.guests}
            onChange={handleChange}
            required
          />
        </FormField>

        <FormField label="Preferred Date">
          <input
            className={INPUT}
            name="date"
            type="date"
            value={form.date}
            onChange={handleAvailability}
            required
          />
        </FormField>

        <FormField label="Preferred Time">
          <select
            className={INPUT}
            name="time"
            value={form.time}
            onChange={handleChange}
            required
          >
            <option value="">Select a time</option>
            {timeslots.length > 0 ? timeslots.map((t) => (
              <option key={t.id} value={t.time}>
                {t.time}
              </option>
            )):
            <option disabled={true}>There is no availability on this date</option>
            }
          </select>
        </FormField>

        <FormField label="Special Requests" className="sm:col-span-2">
          <textarea
            className={INPUT}
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Accessibility needs, allergies, or anything else we should know..."
          />
        </FormField>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gray-900 text-white py-3 rounded font-medium hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Booking...' : 'Request Booking'}
          </button>
          {submitError && (
            <p className="mt-3 text-sm text-red-500">{submitError}</p>
          )}
        </div>
      </form>
    </SectionWrapper>
  )
}
