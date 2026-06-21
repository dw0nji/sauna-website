'use client'

import { useState } from 'react'
import { useBooking } from './BookingProvider'
import FormField from './FormField'
import { Booking, TimeSlot } from './models/Booker'
import { PACKAGES, PackageType } from '../lib/packages'

const TIME_SLOTS = [
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
  '5:30 PM',
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM',
  '9:00 PM',
  '9:30 PM',
  '10:00 PM',
];

const INPUT = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400'

type Status = { type: 'success' | 'error'; message: string } | null

export default function CreateTimeSlotForm({ bookings, timeslots, onCreated }: { bookings: Booking[]; timeslots: TimeSlot[]; onCreated?: () => void }) {
  const { controller } = useBooking()
  const [date, setDate] = useState('')
  const [times, setTimes] = useState<string[]>([])
  const [allowedPackages, setAllowedPackages] = useState<PackageType[]>([])
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)

  function togglePackage(id: PackageType) {
    setAllowedPackages((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  function toggleTime(t: string) {
    setTimes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!controller || times.length === 0) return

    setSubmitting(true)
    setStatus(null)

    const errors: string[] = []
    let added = 0

    for (const time of times) {
      const doubleBooking = bookings.find(
        (b) => b.date === date && b.time === time && b.status === 'confirmed'
      )
      if (doubleBooking) {
        errors.push(`${time} already has a booking`)
        continue
      }
      try {
        await controller.createTimeSlot({
          id: Date.now(),
          date,
          time,
          isAvailable: true,
          allowedPackages: allowedPackages.length ? allowedPackages : undefined,
        })
        added++
      } catch (err) {
        errors.push(`${time}: ${(err as Error).message}`)
      }
    }

    if (added > 0) {
      setDate('')
      setTimes([])
      setAllowedPackages([])
      onCreated?.()
    }

    if (errors.length) {
      setStatus({ type: 'error', message: errors.join(' · ') })
    } else {
      setStatus({ type: 'success', message: `${added} slot${added !== 1 ? 's' : ''} added for ${date}` })
    }

    setSubmitting(false)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Add Available Time Slot</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <FormField label="Date">
          <input
            className={INPUT}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </FormField>

        <div className="sm:col-span-3">
          <p className="text-xs font-medium text-gray-600 mb-2">
            Time <span className="text-gray-400 font-normal">(select one or more)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((t) => {
              const selected = times.includes(t)
              const taken = date ? timeslots.some((s) => s.date === date && s.time === t) : false
              return (
                <button
                  key={t}
                  type="button"
                  disabled={taken}
                  onClick={() => toggleTime(t)}
                  className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                    taken
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                      : selected
                      ? 'border-gray-800 bg-gray-900 text-white cursor-pointer'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500 cursor-pointer'
                  }`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </div>

        <div className="sm:col-span-3">
          <p className="text-xs font-medium text-gray-600 mb-2">
            Allowed Packages <span className="text-gray-400 font-normal">(leave all unchecked to allow any)</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {PACKAGES.map((pkg) => {
              const checked = allowedPackages.includes(pkg.id)
              return (
                <label
                  key={pkg.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded border text-sm cursor-pointer select-none transition-colors ${
                    checked
                      ? 'border-gray-800 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={() => togglePackage(pkg.id)}
                  />
                  {pkg.name}
                </label>
              )
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || times.length === 0}
          className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Adding...' : `Add ${times.length > 0 ? times.length : ''} Slot${times.length !== 1 ? 's' : ''}`}
        </button>
      </form>

      {status && (
        <p className={`mt-3 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {status.message}
        </p>
      )}
    </div>
  )
}
