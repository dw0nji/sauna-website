import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage from '../../components/LegalPage'
import { BUSINESS } from '../../lib/business'

export const metadata: Metadata = {
  title: 'Privacy Policy - Cool Coo Sauna',
  description: 'How Cool Coo Sauna collects, uses and protects your personal data when you book a session.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Your data"
      title="Privacy Policy"
      image="/fire.jpeg"
      intro={
        <p className="!mb-0">
          We collect only what we need to run your sauna session, we never sell it, and we don&apos;t send
          marketing emails. This page explains what we hold, why, and the rights you have over it.
        </p>
      }
    >
      <h2>Who we are</h2>
      <p>
        {BUSINESS.tradingName} is run by {BUSINESS.ownerName}, a sole trader, who is the data controller
        for the personal data described here.
      </p>
      <ul>
        <li>Address: {BUSINESS.address}</li>
        <li>Email: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></li>
        <li>Phone: <a href={`tel:${BUSINESS.phone}`}>{BUSINESS.phone}</a></li>
      </ul>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Booking details</strong>: your name, email address, phone number (optional), chosen package, date, time and number of guests.</li>
        <li><strong>Special requests</strong>: anything you type in the special requests box. Please only share what we need to look after you on the day.</li>
        <li><strong>Payment details</strong>: card payments are handled by Stripe. We never see or store your full card number.</li>
        <li><strong>Technical data</strong>: your IP address and browser details are processed by our hosting provider, and by Google if you choose to load the map.</li>
      </ul>

      <h2>Why we use it and our lawful basis</h2>
      <ul>
        <li><strong>To take and manage your booking</strong>, send your confirmation and contact you about your session: necessary for our contract with you (UK GDPR Art. 6(1)(b)).</li>
        <li><strong>To keep financial and tax records</strong>: legal obligation (Art. 6(1)(c)).</li>
        <li><strong>To prevent payment fraud</strong> through Stripe: our legitimate interest in secure payments (Art. 6(1)(f)).</li>
        <li><strong>To show the Google Map</strong>: your consent, which you can withdraw at any time from Cookie settings.</li>
      </ul>
      <p>
        If your special requests include health or accessibility information, we use it only to accommodate
        you during your visit, with your explicit consent in providing it, and we delete it once your session has passed.
      </p>

      <h2>Who we share it with</h2>
      <p>We use trusted service providers who process data on our behalf and under contract:</p>
      <ul>
        <li><strong>Google Firebase</strong> (booking database)</li>
        <li><strong>Stripe</strong> (payments)</li>
        <li><strong>Resend</strong> (booking confirmation emails)</li>
        <li>Our <strong>website hosting provider</strong></li>
        <li><strong>Google Maps</strong> (only if you accept cookies)</li>
      </ul>
      <p>We never sell your data or share it for advertising.</p>

      <h2>International transfers</h2>
      <p>
        Some of these providers store or process data in the United States. Transfers are protected by the
        UK–US Data Bridge or the UK International Data Transfer Addendum to the EU Standard Contractual Clauses.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Booking and payment records: 6 years, as required for HMRC tax records.</li>
        <li>Special requests: deleted after your session.</li>
        <li>Cancelled bookings may be deleted sooner.</li>
      </ul>

      <h2>Your rights</h2>
      <p>Under UK GDPR (and the EU GDPR, if you live in the EU) you have the right to:</p>
      <ul>
        <li>access a copy of your data</li>
        <li>have inaccurate data corrected</li>
        <li>have your data erased</li>
        <li>restrict or object to how we use it</li>
        <li>receive your data in a portable format</li>
        <li>withdraw consent at any time, where we rely on it</li>
      </ul>
      <p>
        Email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> to use any of these rights. We&apos;ll
        respond within one month. There is no automated decision-making or profiling on this site.
      </p>

      <h2>Cookies</h2>
      <p>
        See our <Link href="/cookies">Cookie Policy</Link> for what is stored on your device and how to change your choice.
      </p>

      <h2>Complaints</h2>
      <p>
        If you&apos;re unhappy with how we handle your data, please contact us first. You also have the right to
        complain to the Information Commissioner&apos;s Office (ICO) at{' '}
        <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">ico.org.uk</a> or on 0303 123 1113.
      </p>

      <h2>Changes</h2>
      <p>If we change this policy we&apos;ll update the date at the top of this page.</p>
    </LegalPage>
  )
}
