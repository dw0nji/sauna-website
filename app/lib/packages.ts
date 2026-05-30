export type Package = {
  id: string
  name: string
  price: number
  displayPrice: string
  duration: string
  maxGuests: number
  description: string
  features: string[]
  highlight?: boolean
}

export const PACKAGES: Package[] = [
  {
    id: 'short',
    name: 'Standard Session',
    price: 1500,
    displayPrice: '£15',
    duration: '1 Hour',
    maxGuests: 8,
    description: 'A quiet escape - the perfect amount of time for the average person!',
    features: [
      'Private sauna session',
      'Cold plunge access',
    ],
  },
  {
    id: 'long',
    name: 'Long Session',
    price: 2000,
    displayPrice: '£20',
    duration: '1.5 Hours',
    maxGuests: 8,
    description: 'Great value for money',
    features: [
      'Private sauna session',
      'Cold plunge access',
    ],
    highlight: true,
  },
  {
    id: 'highland',
    name: 'Highland Experience',
    price: 2500,
    displayPrice: '£25',
    duration: '3 Hours',
    maxGuests: 8,
    description: 'social events',
    features: [
      'Public sauna session',
      'Cold plunge access',
      'Private firepit',
      'Champaign',
      'Hot chocolate',
      'Marshmallows',
    ],
  },
]
