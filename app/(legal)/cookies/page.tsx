import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage from '../../components/LegalPage'
import CookieSettingsButton from '../../components/CookieSettingsButton'

export const metadata: Metadata = {
  title: 'Cookie Policy - Cool Coo Sauna',
  description: 'The cookies and local storage used on the Cool Coo Sauna website, and how to change your choice.',
}

const ITEMS = [
  { name: 'cookie-consent', type: 'Local storage', purpose: 'Remembers your cookie choice', category: 'Essential' },
  { name: 'theme', type: 'Local storage', purpose: 'Remembers light or dark mode', category: 'Essential' },
  { name: 'pending_booking', type: 'Local storage', purpose: 'Shows your booking confirmation after payment, then deleted', category: 'Essential' },
  { name: '__stripe_mid, __stripe_sid', type: 'Stripe cookies', purpose: 'Fraud prevention during checkout', category: 'Essential' },
  { name: 'NID and other Google cookies', type: 'Google Maps cookies', purpose: 'Display the embedded map', category: 'Optional' },
]

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Your device"
      title="Cookie Policy"
      image="/ben_dark.jpeg"
      intro={
        <p className="!mb-0">
          We keep this simple: no analytics and no advertising trackers. We only store what the site and checkout
          need, plus Google Maps cookies if you say yes.
        </p>
      }
    >
      <h2>What we store</h2>
      <p>
        <strong>Essential </strong>items are needed for the site and payments to work, so they don&apos;t require
        consent. <strong>Optional</strong> items only load if you click Accept.
      </p>


      <h2>Third parties</h2>
      <p>
        Stripe sets its cookies when the checkout opens. See{' '}
        <a href="https://stripe.com/cookie-settings" target="_blank" rel="noopener noreferrer">Stripe&apos;s cookie policy</a>.
        Google sets its cookies only when the map loads. See{' '}
        <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">Google&apos;s cookie policy</a>.
      </p>

      <h2>Changing your choice</h2>
      <p>
        You can change your mind at any time. This brings back the cookie banner, and declining stops the map from loading.
      </p>
      <CookieSettingsButton className="px-5 py-2.5 text-sm bg-amber-600 text-white font-medium rounded-full hover:bg-amber-700 transition-colors mb-6" />
      <p>You can also clear cookies and site data in your browser settings.</p>

      <h2>More information</h2>
      <p>
        See our <Link href="/privacy">Privacy Policy</Link> for how we handle personal data.
      </p>
    </LegalPage>
  )
}
