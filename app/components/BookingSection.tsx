'use client'

import { useState } from 'react'
import PackagesSection from './PackagesSection'
import BookingForm from './BookingForm'
import { Package } from '../lib/packages'

export default function BookingSection() {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)

  function handleSelectPackage(pkg: Package) {
    setSelectedPackage(pkg)
    setTimeout(() => {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  return (
    <>
      <PackagesSection
        selectedPackageId={selectedPackage?.id ?? null}
        onSelect={handleSelectPackage}
      />
      <BookingForm selectedPackage={selectedPackage} />
    </>
  )
}
