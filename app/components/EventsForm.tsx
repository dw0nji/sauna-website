'use client'

import { useState } from 'react'
import { useBooking } from './BookingProvider'
import FormField from './FormField'
import { Booking, SpecialEvent } from './models/Booker'
import { PACKAGES, PackageType } from '../lib/packages'

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
  '9:00 PM', '9:30 PM', '10:00 PM',
]

const INPUT = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400'

type Status = { type: 'success' | 'error'; message: string } | null

export function EventsForm({ bookings = [], onCreated }: { bookings?: Booking[]; onCreated?: () => void }) {
  const { controller } = useBooking()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(0)
  const [description, setDescription] = useState('')
  const [features, setFeatures] = useState('')
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!controller) return

    setSubmitting(true)
    setStatus(null)

    try {
      const doubleBooking = bookings.find(
        (b) => b.date === date && b.time === time && b.status === 'confirmed'
      )
      if (doubleBooking) {
        setStatus({ type: 'error', message: `There is already a booking at: ${time} on ${date}` })
        return
      }

      const id = Date.now()

      await controller.createTimeSlot({
        id,
        date,
        time,
        isAvailable: true,
        allowedPackages: ['highland'],
      })
      const event: SpecialEvent = {
        id: 'highland',
        name: 'Special Event',
        backgroundImage: '/ben_dark.jpeg',
        price: 2500,
        displayPrice: '£25',
        timeslotId: id,
        duration: duration ,
        maxGuests: -1, // no max
        description: description,
        features: features.split('\n').map((s) => s.trim()).filter(Boolean),
      }

      await controller.createEvent(event)

      setStatus({ type: 'success', message: `Event added: ${date} at ${time}` })
      setDate('')
      setTime('')
      setDuration(0)
      setDescription('')
      setFeatures('')
      onCreated?.()
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold mb-4">Events</h2>
      <form className="border border-gray-200 rounded p-6 space-y-4 max-w-xl" onSubmit={handleSubmit}>
        <h3 className="font-medium text-sm text-gray-700">Add Event</h3>

        <FormField label="Date">
          <input
            className={INPUT}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </FormField>

        <FormField label="Time">
          <select
            className={INPUT}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          >
            <option value="">Select a time</option>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FormField>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Features (one item per line)</label>
          <textarea
            rows={3}
            placeholder={"Prosecco\nMarshmallows"}
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
          />
        </div>

        {status && (
          <p className={`text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Add Event'}
        </button>
      </form>
    </section>
  )
}
