'use client'

import SectionWrapper from './SectionWrapper'
import { PACKAGES, Package } from '../lib/packages'
import { useBooking} from './BookingProvider'
import { useEffect, useState } from 'react'

type Props = {
  selectedPackageId: string | null
  onSelect: (pkg: Package) => void
}

export default function PackagesSection({ selectedPackageId, onSelect }: Props) {
  const {controller} = useBooking()
  const [packages, setPackages] = useState<Package[]>(PACKAGES)

  useEffect(() => {
    if (!controller) return;

    const event = controller.getNextEvent();
    console.log('Next event:', event);
    if (!event) return;

    const { timeslotId, ...rest } = event;

    const newPackage = rest as Package;
    setPackages((prev) => [...prev, newPackage]);
    
  }, [controller]);

  return (
    <SectionWrapper
      id="packages"
      title="Choose Your Session"
      subtitle="Every package includes exclusive access to the private sauna and the breathtaking Highland views."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {packages.map((pkg) => {
          const isSelected = selectedPackageId === pkg.id
          if (pkg.id === 'highland'){return (
            <EventsPackageCard key={pkg.id} pkg = {pkg} isSelected={isSelected} onSelect={onSelect}/>

          )}else{
            return (
              <StandardPackageCard key={pkg.id} pkg = {pkg} isSelected={isSelected} onSelect={onSelect}/>
            )
          }

        })}
        {!packages.some((pkg) => pkg.id === 'highland') && <NoUpcomingEventsCard />}
      </div>
    </SectionWrapper>
  )
}

const StandardPackageCard = ({ pkg, isSelected, onSelect }: { pkg: Package, isSelected: boolean, onSelect: (pkg:Package) => void }) => {
  return (
            <div
              key={pkg.id}
              className={`relative flex flex-col rounded-md overflow-hidden border-2 transition-all duration-300
                ${pkg.highlight
                  ? 'border-amber-500  shadow-xl shadow-amber-500/20 scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }
                ${isSelected ? 'ring-3 ring-orange-300 ring-offset-2 ring-offset-white dark:ring-offset-gray-950' : ''}
              `}
            >
              {pkg.highlight && (
                <div className="bg-orange-400 text-white text-xs font-bold tracking-widest uppercase text-center py-2">
                  Most Popular
                </div>
              )}
              <div className="relative overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${pkg.backgroundImage})` }}
              />
              <div className={`absolute inset-0 bg-gray-900${pkg.backgroundImage ? '/80': ''}`} />

              <div className=" text-white p-6 flex flex-col gap-1 relative">
                <span className="text-orange-400 text-xs font-semibold uppercase tracking-widest">
                  {pkg.duration} Hours · Up to {pkg.maxGuests} guests
                </span>
                <h3 className="text-2xl font-bold mt-1">{pkg.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{pkg.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-black text-white">{pkg.displayPrice}</span>
                  <span className="text-gray-400 text-sm ml-1">/pp</span>
                </div>
              </div>
              </div>

              <div className="bg-white dark:bg-gray-800 flex-1 p-6 flex flex-col gap-6">
                <ul className="space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-400 dark:bg-amber-900/40 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white dark:text-amber-400" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelect(pkg)}
                  className={`mt-auto w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer
                    ${isSelected
                      ? 'bg-orange-400 text-white shadow-lg shadow-orange-500/30'
                      : pkg.highlight
                        ? 'bg-gray-900 text-white hover:bg-gray-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {isSelected ? '✓ Selected' : 'Select Package'}
                </button>
              </div>
            </div>
          )
}

const NoUpcomingEventsCard = () => {
  return (
    <div className="p-[2px] rounded-md bg-linear-to-br from-cyan-400 via-teal-400 to-blue-600 shadow-lg transition-all duration-300">
      <div className="relative flex flex-col rounded-md h-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(/ben_dark.jpeg)` }}
          />
          <div className="absolute inset-0 bg-gray-900/70" />

          <div className="text-white p-6 flex flex-col gap-1 relative">
            <span className="text-orange-400 text-xs font-semibold uppercase tracking-widest">
              Special Events
            </span>
            <h3 className="text-2xl font-bold mt-1">No Upcoming Events</h3>
            <p className="text-gray-400 text-sm mt-1">
              Keep an eye out on our website and our Facebook page!
            </p>
            <div className="mt-4">
              <span className="text-lg font-semibold text-gray-300">Check back soon</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 flex-1 p-6 flex flex-col gap-6">
          <div className="flex-1" />

          <button
            disabled
            className="mt-auto w-full py-3 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          >
            No Event Scheduled
          </button>
        </div>
      </div>
    </div>
  )
}

const EventsPackageCard = ({ pkg, isSelected, onSelect }: { pkg: Package, isSelected: boolean, onSelect: (pkg:Package) => void }) => {
  return (
                <div className={`p-[2px] rounded-md bg-linear-to-br from-cyan-400 via-teal-400
                 to-blue-600 shadow-lg  transition-all duration-300 
                 ${isSelected ? 'shadow-xl shadow-amber-500/20 scale-[1.02]' : ''}`}>

            <div
              key={pkg.id}
              className={`relative flex flex-col rounded-md h-full overflow-hidden border-2 transition-all duration-300
                ${pkg.highlight
                  ? 'border-orange-500 shadow-xl shadow-amber-500/20 scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }
                ${isSelected ? 'ring-4 ring-orange-300 ring-offset-2 ring-offset-white dark:ring-offset-gray-950' : ''}
              `}
            >
              {pkg.highlight && (
                <div className="bg-orange-400 text-white text-xs font-bold tracking-widest uppercase text-center py-2">
                  Most Popular
                </div>
              )}
              <div className="relative overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${pkg.backgroundImage})` }}
              />
              <div className={`absolute inset-0 ${pkg.backgroundImage ? 'bg-gray-900/70': 'bg-gray-900'}`} />

              <div className=" text-white p-6 flex flex-col gap-1 relative">
                <span className="text-orange-400 text-xs font-semibold uppercase tracking-widest">
                  {pkg.duration} Hours · Public Session
                </span>
                <h3 className="text-2xl font-bold mt-1">{pkg.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{pkg.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-black text-white">{pkg.displayPrice}</span>
                  <span className="text-gray-400 text-sm ml-1">/pp</span>
                </div>
              </div>
              </div>

              <div className="bg-white dark:bg-gray-800 flex-1 p-6 flex flex-col gap-6">
                <ul className="space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-400 dark:bg-amber-900/40 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white dark:text-amber-400" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelect(pkg)}
                  className={`mt-auto w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer
                    ${isSelected
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                      : pkg.highlight
                        ? 'bg-gray-900 text-white hover:bg-gray-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {isSelected ? '✓ Selected' : 'Select Package'}
                </button>
              </div>
            </div>
            </div>
          )
}
