import SectionWrapper from './SectionWrapper'
import StepCard from './StepCard'

const STEPS = [
  {
    step: '01',
    title: 'Choose a Service',
    description: 'Browse our sauna packages and pick the one that suits your needs and schedule.',
  },
  {
    step: '02',
    title: 'Pick a Date & Time',
    description: 'Select an available slot using the booking form. We have morning and evening options.',
  },
  {
    step: '03',
    title: 'Confirm & Arrive',
    description: 'Submit your details and receive a confirmation email. Just show up and relax.',
  },
]

export default function HowItWorks() {
  return (
    <SectionWrapper
      id="how-it-works"
      title="How It Works"
      subtitle="Three easy steps to your next sauna session."
      className="bg-gray-50"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {STEPS.map((step) => (
          <StepCard key={step.step} {...step} />
        ))}
      </div>
    </SectionWrapper>
  )
}
