import {notFound} from 'next/navigation'
import Image from 'next/image'
import PortableText from '@/app/components/PortableText'
import {disciplineQuery, disciplinesSlugs} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import imageUrlBuilder from '@sanity/image-url'
import {client} from '@/sanity/lib/client'

const builder = imageUrlBuilder(client)

function urlFor(source: any) {
  return builder.image(source)
}

type Props = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const {data: slugs} = await sanityFetch({
    query: disciplinesSlugs,
    perspective: 'published',
    stega: false,
  })

  return slugs
}

export default async function DisciplinePage({params}: Props) {
  const {slug} = await params
  const {data: discipline} = await sanityFetch({
    query: disciplineQuery,
    params: {slug},
  })

  if (!discipline) {
    notFound()
  }

  return (
    <div className="h-full overflow-y-auto">

      <div className="relative w-full bg-primary px-12 py-4 sticky top-0 z-10">
        <h1 className="text-[clamp(1.5rem,5vw,2.5rem)] text-white font-bold tracking-tight">{discipline.title}</h1>
      </div>

      {/* Content */}
      <div className="container mx-auto px-8 md:px-16 py-10">
        {discipline.description && (
          <div className="prose prose-lg prose-invert max-w-none mb-16">
            <PortableText value={discipline.description as any} />
          </div>
        )}

        {/* Image Gallery */}
        {discipline.images && discipline.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            {discipline.images
              .filter((image: any) => image?.asset)
              .map((image: any, index: number) => (
              <div key={index} className="relative rounded-lg overflow-hidden aspect-[4/3]">
                <Image
                  src={urlFor(image).width(1200).height(900).fit('crop').url()}
                  alt={image.alt || `${discipline.title} image ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-sm">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
