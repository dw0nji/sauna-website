import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import Booker from '../models/Booker'
import type { Booking, TimeSlot } from '../models/Booker'

export default class BookingController {
  private booker: Booker

  constructor(booker: Booker) {
    this.booker = booker
  }

  async createBooking(booking: Booking): Promise<void> {
    this.booker.createBooking(booking)
    await addDoc(collection(db, 'bookings'), {
      ...booking,
      status: 'confirmed',
    })
  }

  async cancelBooking(bookingId: number): Promise<void> {
    this.booker.cancelBooking(bookingId)
    const snap = await getDocs(collection(db, 'bookings'))
    const match = snap.docs.find((d) => d.data().id === bookingId)
    if (match) {
      await updateDoc(doc(db, 'bookings', match.id), { status: 'cancelled' })
    }
  }

  async updateBooking(
    bookingId: number,
    updates: Partial<Omit<Booking, 'id'>>
  ): Promise<void> {
    this.booker.updateBooking(bookingId, updates)
    const snap = await getDocs(collection(db, 'bookings'))
    const match = snap.docs.find((d) => d.data().id === bookingId)
    if (match) {
      await updateDoc(doc(db, 'bookings', match.id), { ...updates })
    }
  }

  async createTimeSlot(timeslot: TimeSlot): Promise<void> {
    this.booker.createAvailableTimeSlot(timeslot)
    const data = {
      ...timeslot,
      isAvailable: true,
      allowedPackages:
        timeslot.allowedPackages === undefined ? ['long', 'short', 'highland']: timeslot.allowedPackages,
    }
    await addDoc(collection(db, 'timeslots'), data)
  }

  async cancelTimeSlot(timeslotId: number): Promise<void> {
    this.booker.deleteTimeSlot(timeslotId)
    const snap = await getDocs(collection(db, 'timeslots'))
    const match = snap.docs.find((d) => d.data().id === timeslotId)
    if (match) {
      await deleteDoc(doc(db, 'timeslots', match.id))
    }
  }

  async cancelRelatedTimeSlots(date: string, startTime: string, durationMinutes: number): Promise<void> {
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
    const startMins = toMins(startTime)
    const blockStart = startMins - 30
    const blockEnd   = startMins + durationMinutes + 60

    const idsToCancel = this.booker.timeslots
      .filter(s => s.date === date && toMins(s.time) >= blockStart && toMins(s.time) < blockEnd)
      .map(s => s.id)

    if (idsToCancel.length === 0) return

    idsToCancel.forEach(id => this.booker.deleteTimeSlot(id))

    const snap = await getDocs(collection(db, 'timeslots'))
    await Promise.all(
      snap.docs
        .filter(d => idsToCancel.includes(d.data().id))
        .map(d => deleteDoc(doc(db, 'timeslots', d.id)))
    )
  }

  getAvailableTimeSlots(date?: string): TimeSlot[] {
    return this.booker.getAvailableTimeSlots(date)
  }

  getBooking(bookingId: number): Booking | undefined {
    return this.booker.getBooking(bookingId)
  }

  getAllBookings(): Booking[] {
    return Object.values(this.booker.allBookings)
  }

  getCancelledBookings(): Booking[] {
    return this.booker.cancelledBookings
  }
}
