import Image from 'next/image'

type AmenityCardProps = {
  name: string
  description: string
  url: string
}

export default function AmenityCard({ name, description, url }: AmenityCardProps) {
  return (
    <div className="aspect-square w-full overflow-hidden relative flex flex-col">
      <Image
        src={url}
        alt={name}
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="p-5 flex flex-col gap-2 mt-auto relative z-10">
        <h3 className="text-lg text-white font-semibold">{name}</h3>
        <p className="text-white text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
