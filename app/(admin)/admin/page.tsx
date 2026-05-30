'use client'

import { useState, useEffect } from 'react'
import { BookingProvider, useBooking } from '../../components/BookingProvider'
import CreateTimeSlotForm from '../../components/CreateTimeSlotForm'
import type { TimeSlot } from '../../components/models/Booker'

function AdminDashboard() {
  const { controller, loading, error } = useBooking()
  const [slots, setSlots] = useState<TimeSlot[]>([])

  useEffect(() => {
    if (controller) setSlots(controller.getAvailableTimeSlots())
  }, [controller])

  if (loading) return <p className="p-8 text-gray-500">Loading bookings...</p>
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>
  if (!controller) return null

  const bookings = controller.getAllBookings()

  async function handleCancelSlot(id: number) {
    if (!controller) return
    await controller.cancelTimeSlot(id)
    setSlots(controller.getAvailableTimeSlots())
  }

  function handleSlotCreated() {
    if (controller) setSlots(controller.getAvailableTimeSlots())
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Bookings ({bookings.length})</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-sm">No bookings yet.</p>
        ) : (
          <table className="w-full text-sm border border-gray-200 rounded">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{b.customerName}</td>
                  <td className="px-4 py-2">{b.customerEmail}</td>
                  <td className="px-4 py-2">{b.date}</td>
                  <td className="px-4 py-2">{b.time}</td>
                  <td className="px-4 py-2 capitalize">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mb-10">
        <CreateTimeSlotForm onCreated={handleSlotCreated} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Available Time Slots ({slots.length})</h2>
        {slots.length === 0 ? (
          <p className="text-gray-500 text-sm">No available slots.</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {slots.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 text-sm"
              >
                <span>{s.date} — {s.time}</span>
                <button
                  onClick={() => handleCancelSlot(s.id)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors text-xs cursor-pointer"
                  title="Cancel slot"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default function AdminPage() {
  return (
    <BookingProvider>
      <AdminDashboard />
    </BookingProvider>
  )
}
