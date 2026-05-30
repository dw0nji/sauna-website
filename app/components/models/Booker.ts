interface Booking {
    id: number;
    date: string;
    time: string;
    status: 'confirmed' | 'cancelled';
    customerName: string;
    customerEmail: string;
    customerPhone: string;
}

interface TimeSlot {
    id: number;
    date: string;
    time: string;
    isAvailable: boolean;
}

interface Dictionary<T> {
    [key: string]: T;
}

class Booker {
    timeslots: TimeSlot[];
    allBookings: Dictionary<Booking> = {};
    newBookings: number[] = [];
    cancelledBookings: Booking[] = [];

    constructor(timeslots: TimeSlot[], bookings: Booking[]) {
        this.timeslots = timeslots;

        bookings.forEach((booking) => {
            this.allBookings[booking.id] = booking;
        });
    }

    createBooking(booking: Booking): void {
        const slot = this.timeslots.find(
            (s) => s.date === booking.date && s.time === booking.time
        );

        if (!slot || !slot.isAvailable) {
            throw new Error(
                `Time slot ${booking.date} at ${booking.time} is not available.`
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

    cancelTimeSlot(timeslotId: number): void {
        const slot = this.timeslots.find((s) => s.id === timeslotId);

        if (!slot) {
            throw new Error(`Time slot ${timeslotId} not found.`);
        }

        slot.isAvailable = false;
    }

    cancelBooking(bookingId: number): void {
        const booking = this.allBookings[bookingId];

        if (!booking) {
            throw new Error(`Booking ${bookingId} not found.`);
        }

        booking.status = 'cancelled';

        this.cancelledBookings.push(booking);

        delete this.allBookings[bookingId];

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

export type { Booking, TimeSlot };
export default Booker;