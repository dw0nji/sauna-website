import Image from 'next/image'
import { LEGAL_UPDATED } from '../lib/business'

type LegalPageProps = {
  eyebrow: string
  title: string
  image: string
  intro: React.ReactNode
  children: React.ReactNode
}

// Shared shell for the privacy, cookie and terms pages. Tailwind typography
// isn't installed, so the prose styles live here as descendant selectors.
export default function LegalPage({ eyebrow, title, image, intro, children }: LegalPageProps) {
  return (
    <main>
      <section className="relative min-h-[45lvh] flex items-end">
        <Image src={image} alt="" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
        <div className="relative z-10 max-w-3xl w-full mx-auto px-4 pb-12 pt-28">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-400 mb-3">{eyebrow}</p>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-none">{title}</h1>
          <p className="mt-4 text-sm text-white/70">Last updated {LEGAL_UPDATED}</p>
        </div>
      </section>

      <article
        className="max-w-3xl mx-auto px-4 py-16 text-gray-700 dark:text-gray-300 leading-relaxed
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 dark:[&_h2]:text-white [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-24
          [&_h3]:font-semibold [&_h3]:text-gray-900 dark:[&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-2
          [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:mb-1.5
          [&_a]:text-amber-600 dark:[&_a]:text-amber-400 [&_a]:underline [&_a:hover]:text-amber-800
          [&_strong]:text-gray-900 dark:[&_strong]:text-white"
      >
        <div className="text-lg text-gray-900 dark:text-gray-100 border-l-4 border-amber-500 pl-5 mb-10">
          {intro}
        </div>
        {children}
      </article>
    </main>
  )
}
