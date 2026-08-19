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
import type { Booking, SpecialEvent, TimeSlot } from '../models/Booker'

export default class BookingController {
  private booker: Booker

  constructor(booker: Booker) {
    this.booker = booker
  }

  /**
   * Reserves a slot for a booking awaiting payment. Booker.createBooking throws
   * if the slot is gone or the package isn't allowed, which is what stops a
   * customer being charged for a slot someone else already took.
   *
   * Only the exact slot is flipped to unavailable — never deleted. The window
   * logic in filterSlotsByPackage hides overlapping neighbours for free, and
   * the deletions in cancelRelatedTimeSlots stay on the confirmation path
   * because they cannot be undone if the hold lapses.
   */
  async holdSlot(booking: Booking): Promise<void> {
    this.booker.createBooking(booking)
    await addDoc(collection(db, 'bookings'), { ...booking })

    const snap = await getDocs(collection(db, 'timeslots'))
    const slot = snap.docs.find(
      (d) => d.data().date === booking.date && d.data().time === booking.time
    )
    if (slot) {
      await updateDoc(doc(db, 'timeslots', slot.id), { isAvailable: false })
    }
  }

  static async getBookingById(bookingId: number): Promise<Booking | null> {
    const snap = await getDocs(collection(db, 'bookings'))
    const match = snap.docs.find((d) => d.data().id === bookingId)
    return match ? (match.data() as Booking) : null
  }

  static async setSessionId(bookingId: number, sessionId: string): Promise<void> {
    const snap = await getDocs(collection(db, 'bookings'))
    const match = snap.docs.find((d) => d.data().id === bookingId)
    if (match) {
      await updateDoc(doc(db, 'bookings', match.id), { sessionId })
    }
  }

  static async confirmBooking(bookingId: number): Promise<void> {
    const snap = await getDocs(collection(db, 'bookings'))
    const match = snap.docs.find((d) => d.data().id === bookingId)
    if (match) {
      await updateDoc(doc(db, 'bookings', match.id), { status: 'confirmed' })
    }
  }

  /** Drops an unpaid booking and puts its slot back on sale. */
  static async releaseHold(bookingId: number): Promise<void> {
    const bookingsSnap = await getDocs(collection(db, 'bookings'))
    const match = bookingsSnap.docs.find((d) => d.data().id === bookingId)
    if (!match) return

    const { date, time, status } = match.data()
    if (status !== 'pending') return

    await deleteDoc(doc(db, 'bookings', match.id))

    const slotsSnap = await getDocs(collection(db, 'timeslots'))
    const slot = slotsSnap.docs.find(
      (d) => d.data().date === date && d.data().time === time
    )
    if (slot) {
      await updateDoc(doc(db, 'timeslots', slot.id), { isAvailable: true })
    }
  }

  /**
   * Pending bookings held longer than maxAgeMs. Holds with no usable createdAt
   * are treated as expired so nothing can occupy a slot forever.
   */
  static async getExpiredHolds(maxAgeMs: number): Promise<Booking[]> {
    const cutoff = Date.now() - maxAgeMs
    const snap = await getDocs(collection(db, 'bookings'))

    return snap.docs
      .map((d) => d.data() as Booking)
      .filter(
        (b) =>
          b.status === 'pending' &&
          (typeof b.createdAt !== 'number' || b.createdAt < cutoff)
      )
  }

  async createEvent(event:SpecialEvent): Promise<void> {
    this.booker.createEvent(event)
    await addDoc(collection(db, 'events'), {...event})
  }

  async deleteEvent(timeslotId:number): Promise<void> {
    this.booker.deleteEvent(timeslotId)
    const snap = await getDocs(collection(db, 'events'))
    const match = snap.docs.find((d) => d.data().timeslotId === timeslotId)
    if (match){
      await deleteDoc(doc(db, 'timeslots', match.id))
    }
  }

  async createBooking(booking: Booking): Promise<void> {
    this.booker.createBooking(booking)
    await addDoc(collection(db, 'bookings'), { ...booking })
  }

  async cancelBooking(bookingId: number): Promise<void> {
    this.booker.cancelBooking(bookingId)
    const snap = await getDocs(collection(db, 'bookings'))
    const match = snap.docs.find((d) => d.data().id === bookingId)
    if (match) {
      await updateDoc(doc(db, 'bookings', match.id), { status: 'cancelled' })
    }
  }

  async deleteBooking(bookingId: number): Promise<void> {
    this.booker.deleteBooking(bookingId)
    const snap = await getDocs(collection(db, 'bookings'))
    const match = snap.docs.find((d) => d.data().id === bookingId)
    if (match) {
      await deleteDoc(doc(db, 'bookings', match.id))
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
        timeslot.allowedPackages === undefined ? ['long', 'short', 'highland'] : timeslot.allowedPackages,
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

    const slotsInWindow = this.booker.timeslots
      .filter(s => s.date === date && toMins(s.time) >= blockStart && toMins(s.time) < blockEnd)

    const idsToDelete = slotsInWindow
      .filter(s => s.time !== startTime)
      .map(s => s.id)

    idsToDelete.forEach(id => {this.booker.deleteTimeSlot(id)})

    const snap = await getDocs(collection(db, 'timeslots'))
    await Promise.all(
      snap.docs
        .filter(d => {
          const data = d.data()
          return data.date === date && (idsToDelete.includes(data.id) || data.time === startTime)
        })
        .map(d =>
          d.data().time === startTime && d.data().date === date
            ? updateDoc(doc(db, 'timeslots', d.id), { isAvailable: false })
            : deleteDoc(doc(db, 'timeslots', d.id))
        )
    )
  }

  getAvailableTimeSlots(date?: string): TimeSlot[] {
    return this.booker.getAvailableTimeSlots(date)
  }

  getUnavailableTimeSlots(date?: string): TimeSlot[] {
    return this.booker.timeslots.filter(
      (s) => !s.isAvailable && (!date || s.date === date)
    )
  }

  getBooking(bookingId: number): Booking | undefined {
    return this.booker.getBooking(bookingId)
  }

  getAllBookings(): Booking[] {
    return Object.values(this.booker.allBookings)
  }

  getNextEvent(): SpecialEvent | null {
    return this.booker.getNextEvent()
  }

  getCancelledBookings(): Booking[] {
    return this.booker.cancelledBookings
  }
}
