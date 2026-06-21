'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import SectionWrapper from './SectionWrapper'
import FormField from './FormField'
import BookingCalendar from './BookingCalendar'
import { useBooking } from './BookingProvider'
import { Booking, TimeSlot } from './models/Booker'
import { Package, PackageType } from '../lib/packages'

const CheckoutModal = dynamic(() => import('./CheckoutModal'), { ssr: false })

const INPUT =
  'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500'

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

type Props = {
  selectedPackage: Package | null
}

export default function BookingForm({ selectedPackage }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [timeslots, setTimeslots] = useState<TimeSlot[]>([])
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [price, setPrice] = useState<number | null>(null)

  const { controller } = useBooking()

  const isSpecialEvent = selectedPackage?.id === 'highland'
  const eventTimeslot = isSpecialEvent
    ? (selectedPackage as Package & { timeslot?: TimeSlot }).timeslot
    : undefined

  useEffect(() => {
    calculatePrice()
    if (selectedPackage?.id !== 'highland') return
    const timeslot = (selectedPackage as Package & { timeslot?: TimeSlot }).timeslot
    if (!timeslot || !controller) return
    setForm(prev => ({ ...prev, date: timeslot.date, time: timeslot.time }))
    const all = controller.getAvailableTimeSlots(timeslot.date)
    const unavailable = controller.getUnavailableTimeSlots(timeslot.date)
    setTimeslots(filterSlotsByPackage(all, selectedPackage, unavailable))
  }, [selectedPackage, controller])

  const createBookingFromSession = useCallback(async () => {
    if (!controller) return
    const raw = localStorage.getItem('pending_booking')
    if (!raw) return
    console.log('processing booking')

    try {
      const { booking, durationMinutes } = JSON.parse(raw) as { booking: Booking; slotId: number; durationMinutes: number }
      await controller.createBooking(booking)
      await controller.cancelRelatedTimeSlots(booking.date, booking.time, durationMinutes)
      localStorage.removeItem('pending_booking')
      setSubmitted(true);
      setForm({
        name: booking.customerName,
        email: booking.customerEmail,
        phone: booking.customerPhone,
        date: booking.date,
        time: booking.time,
        guests: '1',
        notes: '',
      })
      setSubmitted(true)
      window.history.replaceState({}, '', window.location.pathname)
      window.location.href = '#booking'
    } catch(err) {
      console.error(err)
      localStorage.removeItem('pending_booking')
    }
  }, [controller])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment_success') === 'true') {
      createBookingFromSession()
    }
  }, [createBookingFromSession])

  function calculatePrice(){
    if (selectedPackage) {
      const price = (selectedPackage.price * Number(form.guests)) / 100
      console.log(price)
      setPrice(Math.min(price,65))
    } else {
      setPrice(null)
    }

  }
  function handleGuestChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    handleChange(e)
    if (!selectedPackage) return
    setPrice(Math.min((selectedPackage.price * Number(e.target.value)) / 100,65))
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function filterSlotsByPackage(slots: TimeSlot[], pkg: Package | null, unavailableSlots: TimeSlot[]): TimeSlot[] {
    if (!pkg) return []

    const toMins = (t: string) => {
      const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i)
      if (!match) return 0
      let h = parseInt(match[1])
      const m = parseInt(match[2])
      const isPM = match[3].toUpperCase() === 'PM'
      if (isPM && h !== 12) h += 12
      if (!isPM && h === 12) h = 0
      return h * 60 + m
    }

    const durationMins = Math.round(pkg.duration * 60)

    return slots.filter((s) => {
      if (s.allowedPackages?.length && !s.allowedPackages.includes(pkg.id as PackageType)) return false
      const slotMins = toMins(s.time)
      const blockStart = slotMins - 30
      const blockEnd = slotMins + durationMins + 60
      return !unavailableSlots.some((u) => {
        const uMins = toMins(u.time)
        return uMins >= blockStart && uMins < blockEnd
      })
    })
  }

  function handleCalendarSelect(date: string, time: string, slots: TimeSlot[]) {
    setForm((prev) => ({ ...prev, date, time }))
    setTimeslots(slots)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!controller || !selectedPackage) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const slot = timeslots.find((s) => s.time === form.time && s.date === form.date)
      if (!slot) throw new Error('There was a problem processing your booking.')

      const booking: Booking = {
        id: Date.now(),
        date: form.date,
        time: form.time,
        status: 'confirmed',
        PackageName: selectedPackage.id as PackageType,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
      }

      const durationMinutes = Math.round(selectedPackage.duration * 60)
      localStorage.setItem('pending_booking', JSON.stringify({ booking, slotId: slot.id, durationMinutes }))

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId:selectedPackage.id,
          amount:form.guests
        }),
      })

      if (!res.ok) throw new Error('Failed to create checkout session.')
      const { clientSecret } = await res.json()
      setClientSecret(clientSecret)
    } catch (err) {
      setSubmitError((err as Error).message)
      localStorage.removeItem('pending_booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <SectionWrapper id="booking" title="Booking Confirmed!">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-600" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Thanks, <strong>{form.name}</strong>! Your payment was successful and we've reserved your
            slot. A confirmation will be sent to <strong>{form.email}</strong> shortly.
          </p>
          <button
            className="text-sm text-gray-500 dark:text-gray-400 underline hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
            onClick={() => { setForm(EMPTY); setSubmitted(false) }}
          >
            Make another booking
          </button>
        </div>
      </SectionWrapper>
    )
  }

  return (
    <>
      <SectionWrapper
        id="booking"
        title="Book a Session"
        subtitle="Choose your package, date, and time below."
      >
        {selectedPackage && (
          <div className="max-w-2xl mx-auto mb-8 flex items-center justify-between shadow-amber-50 shadow-2xl border-2 border-black dark:border-gray-600 dark:bg-gray-900 px-5 py-4">
            <div>
              <p className="text-xs text-amber-600 font-semibold uppercase tracking-widest">Selected Package</p>
              <p className="font-bold text-gray-900 dark:text-white text-lg">{selectedPackage.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedPackage.duration} hr{selectedPackage.duration !== 1 ? 's' : ''}
                {isSpecialEvent && eventTimeslot
                  ? ` · ${new Date(eventTimeslot.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} at ${eventTimeslot.time}`
                  : ` · Up to ${selectedPackage.maxGuests} guests`
                }
              </p>
            </div>
            <div className="text-right">
              {(() => {
                const full = selectedPackage ? (selectedPackage.price * Number(form.guests)) / 100 : null
                const discount = full !== null && full > 65 ? +(full - 65).toFixed(2) : 0
                return (
                  <>
                    <div className="flex items-baseline justify-end gap-2">
                      {discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">£{full?.toFixed(2)}</span>
                      )}
                      <p className="text-3xl font-black text-gray-900 dark:text-white">£{price?.toFixed(2)}</p>
                    </div>
                    {discount > 0 && (
                      <span className="inline-block mt-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                        You save £{discount.toFixed(2)}
                      </span>
                    )}
                  </>
                )
              })()}
              <button
                type="button"
                onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
                className="block text-xs text-amber-600 hover:text-amber-800 underline mt-1 cursor-pointer ml-auto"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {!selectedPackage && (
          <div className="max-w-2xl mx-auto mb-8 flex items-center gap-4 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 shrink-0 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">No package selected</p>
              <button
                type="button"
                onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm text-amber-600 hover:text-amber-800 underline cursor-pointer"
              >
                Choose a package above to continue
              </button>
            </div>
          </div>
        )}

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
              placeholder="+44 7700 900100"
            />
          </FormField>

          <FormField label="Number of Guests">
            <input
              className={INPUT}
              name="guests"
              type="number"
              min="1"
              max={isSpecialEvent ? undefined : (selectedPackage?.maxGuests ?? 6)}
              value={form.guests}
              onChange={handleGuestChange}
              required
            />
            {selectedPackage && !isSpecialEvent && (
              <p className="text-xs text-gray-400 mt-1">Max {selectedPackage.maxGuests} for this package</p>
            )}
          </FormField>

          {!isSpecialEvent && (
            <BookingCalendar
              controller={controller}
              selectedPackage={selectedPackage}
              selectedDate={form.date}
              selectedTime={form.time}
              onSelect={handleCalendarSelect}
            />
          )}

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
              disabled={submitting || !selectedPackage}
              className="w-full bg-gray-900 dark:bg-amber-600 text-white py-3.5 rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-amber-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Preparing checkout…
                </>
              ) : (
                <>
                  {selectedPackage ? `Pay £${price} & Confirm` : 'Select a Package Above'}
                  {selectedPackage && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </>
              )}
            </button>
            {submitError && (
              <p className="mt-3 text-sm text-red-500">{submitError}</p>
            )}
          </div>
        </form>
      </SectionWrapper>

      {clientSecret && (
        <CheckoutModal
          clientSecret={clientSecret}
          onClose={() => setClientSecret(null)}
        />
      )}
    </>
  )
}
