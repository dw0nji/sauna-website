'use client'

import { useState, useEffect } from 'react'
import { BookingProvider, useBooking } from '../../components/BookingProvider'
import AuthProvider from '../../components/AuthProvider'
import CreateTimeSlotForm from '../../components/CreateTimeSlotForm'
import ConfirmDialog from '../../components/ConfirmDialog'
import type { Booking, TimeSlot } from '../../components/models/Booker'
import { Package, PACKAGES } from '../../lib/packages'
import { EventsForm } from '@/app/components/EventsForm'
import { time } from 'console'

function AdminDashboard() {
  const { controller, loading, error } = useBooking()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null)
  const [packages, setPackages] = useState(PACKAGES)
  useEffect(() => {
    if (!controller) return
    setBookings(controller.getAllBookings())
    setSlots(controller.getAvailableTimeSlots())
    const event = controller.getNextEvent();
    if (!event) return;
    const { timeslotId, ...rest } = event;

    const newPackage = rest as Package;

    setPackages((prev) => [...prev, newPackage]);
  }, [controller])

  if (loading) return <p className="p-8 text-gray-500">Loading bookings...</p>
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>
  if (!controller) return null

  async function handleCancelBooking(id: number) {
    if (!controller) return
    await controller.cancelBooking(id)
    setBookings(controller.getAllBookings())
    setSlots(controller.getAvailableTimeSlots())
    setPendingCancelId(null)
  }

  async function handleCancelSlot(timeslot: TimeSlot) {
    if (!controller) return
    const id = timeslot.id
    await controller.cancelTimeSlot(id)

    // If its an event then delete the event as well as the timeslot
    if (timeslot.allowedPackages?.includes('highland')){
      await controller.deleteEvent(id)
    }
    setSlots(controller.getAvailableTimeSlots())
  }

  function handleSlotCreated() {
    if (controller) setSlots(controller.getAvailableTimeSlots())
  }

  const pendingBooking = pendingCancelId !== null
    ? bookings.find((b) => b.id === pendingCancelId)
    : null

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Bookings ({bookings.length})</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-sm">No bookings yet.</p>
        ) : (
          <div className="border overflow-x-auto scrollbar-thin  border-gray-200 rounded">
                <table className="text-sm max-w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium whitespace-nowrap">Name</th>
                  <th className="px-4 py-2 font-medium whitespace-nowrap">Email</th>
                  <th className="px-4 py-2 font-medium whitespace-nowrap">Package</th>
                  <th className="px-4 py-2 font-medium whitespace-nowrap">Date</th>
                  <th className="px-4 py-2 font-medium whitespace-nowrap">Time</th>
                  <th className="px-4 py-2 font-medium whitespace-nowrap">Status</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-gray-100">
                    <td className="px-4 py-2 whitespace-nowrap">{b.customerName}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{b.customerEmail}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {packages.find((p) => p.id === b.PackageName)?.name ?? b.PackageName ?? '—'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{b.date}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{b.time}</td>
                    <td className="px-4 py-2 capitalize whitespace-nowrap">{b.status}</td>
                    <td className="px-4 py-2 text-right">
                      {b.status == 'confirmed' ?
                      <button
                        onClick={() => setPendingCancelId(b.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors text-xs cursor-pointer"
                        title="Cancel booking"
                      >
                        ✕
                      </button>:
                      <></>
                    }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-10">
        <CreateTimeSlotForm bookings={bookings} onCreated={handleSlotCreated} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Available Time Slots ({slots.length})</h2>
        {slots.length === 0 ? (
          <p className="text-gray-500 text-sm">No available slots.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {slots.map((s) => (
              <li
                key={s.id}
                className="flex items-start justify-between border border-gray-200 rounded px-3 py-2 text-sm"
              >
                <div>
                  <span>{s.date} — {s.time}</span>
                  {s.allowedPackages?.length ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {s.allowedPackages.map((id) => (
                        <span key={id} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {packages.find((p) => p.id === id)?.name ?? id}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">All packages</p>
                  )}
                </div>
                <button
                  onClick={() => handleCancelSlot(s)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors text-xs cursor-pointer mt-0.5 shrink-0"
                  title="Cancel slot"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <EventsForm bookings={bookings} onCreated={handleSlotCreated} />

      {pendingBooking && (
        <ConfirmDialog
          message={`Cancel ${pendingBooking.customerName}'s booking on ${pendingBooking.date} at ${pendingBooking.time}? This cannot be undone.`}
          confirmLabel="Cancel Booking"
          onConfirm={() => handleCancelBooking(pendingBooking.id)}
          onCancel={() => setPendingCancelId(null)}
        />
      )}
    </main>
  )
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <BookingProvider>
        <AdminDashboard />
      </BookingProvider>
    </AuthProvider>
  )
}
