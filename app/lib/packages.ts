
export type PackageType = 'short' | 'long' | 'highland' 

export type Package = {
  id: PackageType
  name: string
  price: number
  displayPrice: string
  duration: number
  maxGuests: number
  description: string
  features: string[]
  highlight?: boolean
  backgroundImage?: string
}

export const PACKAGES: Package[] = [
  {
    id: 'short' ,
    name: 'Standard Session',
    price: 1500,
    displayPrice: '£15',
    duration: 1,
    maxGuests: 6,
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
    duration: 1.5,
    maxGuests: 6,
    description: 'Great value for money',
    features: [
      'Private sauna session',
      'Cold plunge access',
    ],
    highlight: true,
  },
  // {
  //   id: 'highland',
  //   name: 'Highland Experience',
  //   price: 2500,
  //   displayPrice: '£25',
  //   duration: 3,
  //   maxGuests: 8,
  //   backgroundImage: '/ben_dark.jpeg',
  //   description: 'social events',
  //   features: [
  //     'Public sauna session',
  //     'Cold plunge access',
  //     'Private firepit',
  //     'Champaign',
  //     'Hot chocolate',
  //     'Marshmallows',
  //   ],
  // },
]
