import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage from '../../components/LegalPage'
import { BUSINESS } from '../../lib/business'

export const metadata: Metadata = {
  title: 'Booking Terms - Cool Coo Sauna',
  description: 'Booking terms, cancellation policy and safety guidance for Cool Coo Sauna sessions.',
}

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Before you book"
      title="Booking Terms"
      image="/fire.jpeg"
      intro={
        <p className="!mb-0">
          <strong>The short version:</strong> cancel at least <strong>24 hours</strong> before your session for a full
          refund. Contact us by email or phone to cancel. Look after yourself in the heat and the cold.
        </p>
      }
    >
      <h2>1. About us</h2>
      <p>
        {BUSINESS.tradingName} is run by {BUSINESS.ownerName}, at {BUSINESS.address}. Contact us at{' '}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> or <a href={`tel:${BUSINESS.phone}`}>{BUSINESS.phone}</a>.
      </p>

      <h2>2. Making a booking</h2>
      <ul>
        <li>Choose a package, date, time and number of guests, then pay online through Stripe.</li>
        <li>Your slot is held for 5 minutes while you complete payment. If payment isn&apos;t completed in time, the slot is released.</li>
        <li>A contract between us is formed once your payment succeeds. We&apos;ll email a confirmation to the address you gave.</li>
        <li>The person booking is responsible for making sure everyone in their group has read these terms.</li>
      </ul>

      <h2>3. Prices</h2>
      <p>
        Prices are in pounds sterling and include any VAT that applies. 
      </p>

      <h2 id="cancellation">4. Cancelling your booking</h2>
      <ul>
        <li>
          <strong>24 hours or more before your session:</strong> full refund. To cancel, please{' '}
          <strong>contact us</strong> by email at <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> or by phone on{' '}
          <a href={`tel:${BUSINESS.phone}`}>{BUSINESS.phone}</a>. Include the name and date on your booking. We&apos;ll
          process your refund to your original payment method, which usually takes 5–10 working days to appear.
        </li>
        <li><strong>Less than 24 hours before, or if you don&apos;t arrive:</strong> no refund.</li>
        <li>If you&apos;d like to move your session instead, get in touch and we&apos;ll do our best to find another slot.</li>
      </ul>
      <p>
        <strong>No 14-day cooling-off period.</strong> Sauna sessions are leisure services booked for a specific date
        and time, so the statutory right to cancel within 14 days does not apply (Consumer Contracts Regulations 2013,
        reg. 28(1)(b)). The cancellation policy above applies instead.
      </p>

      <h2>5. If we have to cancel</h2>
      <p>
        If we need to cancel because of severe weather, safety concerns or any other reason on our side, we&apos;ll let you
        know as soon as possible and offer you either a full refund or a new date of your choice.
      </p>

      <h2>6. On the day</h2>
      <ul>
        <li>Please arrive on time. Late arrival may shorten your session, which still ends at the booked time.</li>
        <li>Group size must not exceed the number of guests booked or the package maximum.</li>
        <li>Under-18s must be accompanied and supervised by an adult from the booking group at all times.</li>
        <li>Please leave the sauna, plunge and grounds as you found them.</li>
      </ul>

      <h2>7. Our responsibility to you</h2>
      <p>
        We provide our services with reasonable care and skill. We are not responsible for losses that were not
        foreseeable, for personal belongings left on site, or for harm caused by ignoring the safety guidance above.
        Nothing in these terms limits our liability for death or personal injury caused by our negligence, for fraud,
        or for anything else that can&apos;t be limited by law. Your statutory rights are not affected.
      </p>

      <h2>8. Complaints</h2>
      <p>
        If something isn&apos;t right, please tell us as soon as possible at{' '}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> and we&apos;ll do our best to put it right.
      </p>

      <h2>9. Your data</h2>
      <p>
        We use your booking details as described in our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by Scots law, and disputes may be brought in the Scottish courts. If you live
        elsewhere in the UK or in the EU, you keep the protection of the mandatory consumer laws where you live and can
        also bring proceedings in your local courts.
      </p>
    </LegalPage>
  )
}
