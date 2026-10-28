import SectionWrapper from './SectionWrapper'
import MapEmbed from './MapEmbed'

export default function LocationSection() {
  return (
    <SectionWrapper
      id="location"
      title="Find Us"
      subtitle="Nestled in the Scottish Highlands, minutes from Ben Nevis and Fort William."
    >
      <div className="max-w-4xl mx-auto">
        {/* Map placeholder — replace the div below with your map embed */}
        <div className="w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <MapEmbed />
        </div>

        {/* Address & details strip */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Cool Coo Sauna</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fort William, Scottish Highlands, PH33 7BA</p>
            </div>
          </div>

          <a
            href={process.env.GOOGLE_LOCATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
          >
            Open in Google Maps
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </SectionWrapper>
  )
}
