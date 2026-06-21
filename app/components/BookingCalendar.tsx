'use client'

import { useState, useMemo, useEffect } from 'react'
import BookingController from './controllers/BookingController'
import type { TimeSlot } from './models/Booker'
import type { Package, PackageType } from '../lib/packages'

type AvailabilityLevel = 'none' | 'low' | 'high'

const COLOR_AVAILABLE = {
  cell:   'bg-green-200 dark:bg-green-800/60 text-green-900 dark:text-green-200 cursor-pointer hover:bg-green-300 dark:hover:bg-green-700/70',
  swatch: 'bg-green-200 dark:bg-green-800/60 border border-green-300 dark:border-green-700',
}
const COLOR_LIMITED = {
  cell:   'bg-orange-200 dark:bg-orange-800/60 text-orange-900 dark:text-orange-200 cursor-pointer hover:bg-orange-300 dark:hover:bg-orange-700/70',
  swatch: 'bg-orange-200 dark:bg-orange-800/60 border border-orange-300 dark:border-orange-700',
}
const COLOR_FULL = {
  cell:   'bg-red-200 dark:bg-red-900/60 text-red-700 dark:text-red-300 cursor-not-allowed line-through',
  swatch: 'bg-red-200 dark:bg-red-900/60 border border-red-300 dark:border-red-800',
}

type Props = {
  controller: BookingController | null
  selectedPackage: Package | null
  selectedDate: string
  selectedTime: string
  onSelect: (date: string, time: string, slots: TimeSlot[]) => void
}

function toMins(t: string): number {
  const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return 0
  let h = parseInt(match[1])
  const m = parseInt(match[2])
  const isPM = match[3].toUpperCase() === 'PM'
  if (isPM && h !== 12) h += 12
  if (!isPM && h === 12) h = 0
  return h * 60 + m
}

function filterSlotsByPackage(slots: TimeSlot[], pkg: Package | null, unavailableSlots: TimeSlot[]): TimeSlot[] {
  if (!pkg) return []
  const durationMins = Math.round(pkg.duration * 60)
  return slots.filter((s) => {
    if (s.allowedPackages?.length && !s.allowedPackages.includes(pkg.id as PackageType)) return false
    const slotMins = toMins(s.time)
    const blockStart = slotMins - 30
    const blockEnd = slotMins + durationMins + 60
    return !unavailableSlots.some((u) => {
      const uMins = toMins(u.time)
      return uMins >= blockStart && uMins < blockEnd
    })
  })
}

export default function BookingCalendar({ controller, selectedPackage, selectedDate, selectedTime, onSelect }: Props) {
  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [activeDate, setActiveDate] = useState<string>(selectedDate)

  useEffect(() => {
    setActiveDate(selectedDate)
  }, [selectedDate])

  const dateAvailability = useMemo(() => {
    const map = new Map<string, { level: AvailabilityLevel; slots: TimeSlot[] }>()
    if (!controller || !selectedPackage) return map

    const allAvailable = controller.getAvailableTimeSlots()
    const allUnavailable = controller.getUnavailableTimeSlots()

    const dates = new Set<string>([
      ...allAvailable.map((s) => s.date),
      ...allUnavailable.map((s) => s.date),
    ])

    for (const date of dates) {
      const availForDate = allAvailable.filter((s) => s.date === date)
      const unavailForDate = allUnavailable.filter((s) => s.date === date)
      const filtered = filterSlotsByPackage(availForDate, selectedPackage, unavailForDate)

      let level: AvailabilityLevel
      if (filtered.length === 0) level = 'none'
      else if (filtered.length <= 2) level = 'low'
      else level = 'high'

      map.set(date, { level, slots: filtered })
    }

    return map
  }, [controller, selectedPackage])

  const activeDateSlots = useMemo(() => {
    if (!activeDate) return []
    return dateAvailability.get(activeDate)?.slots ?? []
  }, [activeDate, dateAvailability])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const lastDay = new Date(viewYear, viewMonth + 1, 0)
    const startDow = firstDay.getDay()

    const days: (Date | null)[] = []
    for (let i = 0; i < startDow; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(viewYear, viewMonth, d))
    while (days.length % 7 !== 0) days.push(null)
    return days
  }, [viewYear, viewMonth])

  function formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  function isPast(d: Date): boolean {
    return d < todayMidnight
  }

  function handleDateClick(d: Date) {
    const dateStr = formatDate(d)
    const info = dateAvailability.get(dateStr)
    if (!info || info.level === 'none' || isPast(d)) return
    setActiveDate(dateStr)
  }

  function handleTimeClick(slot: TimeSlot) {
    onSelect(slot.date, slot.time, activeDateSlots)
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const activeDateLabel = activeDate
    ? new Date(activeDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    : null

  return (
    <div className="sm:col-span-2">
      <div className="flex flex-col lg:flex-row gap-0 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">

        {/* Calendar panel */}
        <div className="flex-1 p-5 bg-white dark:bg-gray-900">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-bold text-gray-900 dark:text-white tracking-wide uppercase">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((d, i) => {
              if (!d) return <div key={`empty-${i}`} />

              const dateStr = formatDate(d)
              const past = isPast(d)
              const info = dateAvailability.get(dateStr)
              const isActive = activeDate === dateStr
              const isSelected = selectedDate === dateStr
              const hasData = !!info && !past

              let base =
                'relative aspect-square flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus:outline-none '

              if (past || !info) {
                base += 'text-gray-300 dark:text-gray-700 cursor-default'
              } else if (info.level === 'none') {
                base += COLOR_FULL.cell
              } else if (info.level === 'low') {
                base += COLOR_LIMITED.cell
              } else {
                base += COLOR_AVAILABLE.cell
              }

              if (isActive && hasData && info!.level !== 'none') {
                base += ' ring-2 ring-gray-300 dark:ring-gray-400 ring-offset-1 dark:ring-offset-gray-900'
              }

              if (isSelected && hasData && info!.level !== 'none') {
                base += ' font-black'
              }

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={past || !info || info.level === 'none'}
                  onClick={() => handleDateClick(d)}
                  className={base}
                >
                  {d.getDate()}
                  {isSelected && hasData && info!.level !== 'none' && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${COLOR_AVAILABLE.swatch}`} />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${COLOR_LIMITED.swatch}`} />
              Limited
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${COLOR_FULL.swatch}`} />
              Full
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-gray-200 dark:bg-gray-700" />
        <div className="block lg:hidden h-px bg-gray-200 dark:bg-gray-700 max-h-fit" />

        {/* Timeslots panel — outer div is sized by flex-stretch to match calendar height */}
        <div className="lg:w-60 relative">
          {/* Inner div fills that height exactly and scrolls; on mobile just flows naturally */}
          <div className="lg:absolute lg:inset-0 p-5 bg-gray-50 dark:bg-gray-800/50 flex flex-col">
            {!selectedPackage ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
                  Select a package above<br />to see availability
                </p>
              </div>
            ) : !activeDate ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
                  Pick a date on the<br />calendar to see times
                </p>
              </div>
            ) : activeDateSlots.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
                  No slots available<br />on this date
                </p>
              </div>
            ) : (
              <>
                <p className="shrink-0 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                  {activeDateLabel}
                </p>
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 max-h-64 lg:max-h-none">
                  {activeDateSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time && selectedDate === slot.date
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleTimeClick(slot)}
                        className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-gray-900 dark:bg-amber-600 text-white border-transparent shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                        }`}
                      >
                        {slot.time}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
