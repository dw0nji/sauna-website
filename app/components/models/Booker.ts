import { Package, PackageType } from "@/app/lib/packages";

interface Booking {
    id: number;
    date: string;
    time: string;
    status: 'confirmed' | 'cancelled';
    PackageName:PackageType;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
}
interface SpecialEvent extends Package {
  timeslotId: number
  timeslot?: TimeSlot
}
interface TimeSlot {
    id: number;
    date: string;
    time: string;
    isAvailable: boolean;
    allowedPackages?: PackageType[];
}

interface Dictionary<T> {
    [key: string]: T;
}

class Booker {
    timeslots: TimeSlot[];
    events: SpecialEvent[];
    allBookings: Dictionary<Booking> = {};
    newBookings: number[] = [];
    cancelledBookings: Booking[] = [];

    constructor(timeslots: TimeSlot[], bookings: Booking[],events: SpecialEvent[]) {
        this.timeslots = timeslots;
        this.events = events;

        bookings.forEach((booking) => {
            this.allBookings[booking.id] = booking;
        });
    }
    createEvent(event: SpecialEvent): void {
        this.events.push(event)
    }
    deleteEvent(timeslotId: number): void {
        this.events = this.events.filter((e) => e.timeslotId !== timeslotId)
    }

    getNextEvent(): SpecialEvent | null {
        let shortestEvent: SpecialEvent | null = null;
        let shortestValue = Infinity;
        const now = Date.now();

        this.events.forEach((e) => {
            const slot = this.timeslots.find((s) => s.id === e.timeslotId);
            if (!slot) return;

            const match = slot.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (!match) return;
            let h = parseInt(match[1]);
            const m = parseInt(match[2]);
            const isPM = match[3].toUpperCase() === 'PM';
            if (isPM && h !== 12) h += 12;
            if (!isPM && h === 12) h = 0;
            const iso = `${slot.date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
            const timestamp = new Date(iso).getTime();
            if (timestamp < now) return;
            if (timestamp < shortestValue) {
                shortestValue = timestamp;
                shortestEvent = { ...e, timeslot: slot };
            }
        });

        return shortestEvent;
    }

    createBooking(booking: Booking): void {
        console.log(this.timeslots)
        console.log(booking)

        const slot = this.timeslots.find(
            (s) => s.date === booking.date && s.time === booking.time
        );

        if (!slot || !slot.isAvailable) {
            throw new Error(
                `Time slot ${booking.date} at ${booking.time} is not available.`
            );
        }

        if (slot.allowedPackages?.length && !slot.allowedPackages.includes(booking.PackageName)) {
            throw new Error(
                `Package "${booking.PackageName}" is not available for this time slot.`
            );
        }

        slot.isAvailable = false;

        this.allBookings[booking.id] = {
            ...booking,
            status: 'confirmed',
        };

        this.newBookings.push(booking.id);
    }

    createAvailableTimeSlot(timeslot: TimeSlot): void {
        const exists = this.timeslots.some((s) => s.id === timeslot.id);

        if (exists) {
            throw new Error(
                `Time slot with id ${timeslot.id} already exists.`
            );
        }

        this.timeslots.push({
            ...timeslot,
            isAvailable: true,
        });
    }

    deleteTimeSlot(timeslotId: number): void {
        const exists = this.timeslots.some((s) => s.id === timeslotId);

        if (!exists) {
            throw new Error(`Time slot ${timeslotId} not found.`);
        }
        this.timeslots = this.timeslots.filter((s) => s.id !== timeslotId);
    }

    cancelBooking(bookingId: number): void {
        const booking = this.allBookings[bookingId];

        if (!booking) {
            throw new Error(`Booking ${bookingId} not found.`);
        }

        booking.status = 'cancelled';

        this.cancelledBookings.push(booking);

        //delete this.allBookings[bookingId];

        const slot = this.timeslots.find(
            (s) => s.date === booking.date && s.time === booking.time
        );

        if (slot) {
            slot.isAvailable = true;
        }
    }

    updateBooking(
        bookingId: number,
        updates: Partial<Omit<Booking, 'id'>>
    ): void {
        const booking = this.allBookings[bookingId];

        if (!booking) {
            throw new Error(`Booking ${bookingId} not found.`);
        }

        if (updates.date || updates.time) {
            const newDate = updates.date ?? booking.date;
            const newTime = updates.time ?? booking.time;

            const newSlot = this.timeslots.find(
                (s) => s.date === newDate && s.time === newTime
            );

            if (!newSlot || !newSlot.isAvailable) {
                throw new Error(
                    `Time slot ${newDate} at ${newTime} is not available.`
                );
            }

            const oldSlot = this.timeslots.find(
                (s) => s.date === booking.date && s.time === booking.time
            );

            if (oldSlot) {
                oldSlot.isAvailable = true;
            }

            newSlot.isAvailable = false;
        }

        Object.assign(booking, updates);
    }

    getAvailableTimeSlots(date?: string): TimeSlot[] {
        return this.timeslots.filter(
            (s) => s.isAvailable && (!date || s.date === date)
        );
    }

    getBooking(bookingId: number): Booking | undefined {
        return this.allBookings[bookingId];
    }
}

export type { Booking, TimeSlot, SpecialEvent };
export default Booker;