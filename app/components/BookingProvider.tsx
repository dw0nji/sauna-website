'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import Booker from './models/Booker'
import BookingController from './controllers/BookingController'
import type { Booking, SpecialEvent, TimeSlot } from './models/Booker'

type BookingContextValue = {
  controller: BookingController | null
  loading: boolean
  error: string | null
}

const BookingContext = createContext<BookingContextValue>({
  controller: null,
  loading: true,
  error: null,
})


export function useBooking() {
  return useContext(BookingContext)
}



async function fetchData(): Promise<{ bookings: Booking[]; timeslots: TimeSlot[] }> {
  const [bookingsSnap, timeslotsSnap] = await Promise.all([
    getDocs(collection(db, 'bookings')),
    getDocs(collection(db, 'timeslots')),
  ])

  const bookings = bookingsSnap.docs.map((d) => d.data() as Booking)
  const timeslots = timeslotsSnap.docs.map((d) => d.data() as TimeSlot)

  return { bookings, timeslots }
}

async function fetchTimeslots(): Promise<TimeSlot[] > {
  const [timeslotsSnap] = await Promise.all([
    getDocs(collection(db, 'timeslots')),
  ])

  const timeslots = timeslotsSnap.docs.map((d) => d.data() as TimeSlot)

  return timeslots 
}

async function fetchEvents (): Promise<SpecialEvent[] > {
  const [eventsSnap] = await Promise.all([
    getDocs(collection(db, 'events')),
  ])

  const timeslots = eventsSnap.docs.map((d) => d.data() as SpecialEvent)

  return timeslots 
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [controller, setController] = useState<BookingController | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
      .then(({ bookings, timeslots}) => {
        const booker = new Booker(timeslots, bookings,[])
        setController(new BookingController(booker))
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <BookingContext.Provider value={{ controller, loading, error }}>
      {children}
    </BookingContext.Provider>
  )
}

export function TimeslotsProvider({ children }: { children: React.ReactNode }) {
  const [controller, setController] = useState<BookingController | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() =>{
    const loadData = async () => {
      let timeslots:any = []
      let events:any = []
      try{
        timeslots = await fetchTimeslots()
        events = await fetchEvents()
        console.log('Fetched events:', events)
        const booker = new Booker(timeslots, [],events)
        setController(new BookingController(booker))

        }catch(err) {

          setError(err instanceof Error ? err.message : String(err))

        }finally{
          setLoading(false)

        }
      }
      loadData()
  }, [])

  return (
    <BookingContext.Provider value={{ controller, loading, error }}>
      {children}
    </BookingContext.Provider>
  )
}
