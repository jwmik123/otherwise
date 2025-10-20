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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Image */}
      {discipline.coverImage && (
        <div className="relative w-full h-[60vh]">
          <Image
            src={urlFor(discipline.coverImage).width(1920).height(1080).url()}
            alt={discipline.coverImage.alt || discipline.title || 'Discipline cover image'}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
            <div className="container mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight">
                {discipline.title}
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-8 md:px-16 py-12 md:py-20">
        {discipline.description && (
          <div className="prose prose-lg prose-invert max-w-none mb-16">
            <PortableText value={discipline.description as any} />
          </div>
        )}

        {/* Image Gallery */}
        {discipline.images && discipline.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {discipline.images.map((image: any, index: number) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={urlFor(image).width(800).height(600).url()}
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
