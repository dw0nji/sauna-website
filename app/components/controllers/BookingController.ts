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
    await addDoc(collection(db, 'timeslots'), { ...timeslot, isAvailable: true })
  }

  async cancelTimeSlot(timeslotId: number): Promise<void> {
    this.booker.cancelTimeSlot(timeslotId)
    const snap = await getDocs(collection(db, 'timeslots'))
    const match = snap.docs.find((d) => d.data().id === timeslotId)
    if (match) {
      await updateDoc(doc(db, 'timeslots', match.id), { isAvailable: false })
    }
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
