import {notFound} from 'next/navigation'
import Image from 'next/image'
import PortableText from '@/app/components/PortableText'
import {disciplineQuery, disciplinesSlugs, getPageQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import imageUrlBuilder from '@sanity/image-url'
import {client} from '@/sanity/lib/client'
import {Metadata} from 'next'
import GoBackButton from '@/app/components/GoBackButton'

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

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const {data: discipline} = await sanityFetch({
    query: disciplineQuery,
    params,
    // Metadata should never contain stega
    stega: false,
  })

  return {
    title: discipline?.title,
  } satisfies Metadata
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

      <div className="relative flex items-center w-full bg-primary px-5 md:px-10 pb-0 sticky top-0 z-10">
      <GoBackButton />
        <h1 className="text-[clamp(1.5rem,4vw,2rem)] text-white font-bold tracking-tight -ml-6 pl-4 md:pl-0 md:ml-0  flex-1">{discipline.title}</h1>
      </div>
      

      {/* Content */}
      <div className="container mx-auto px-8 md:px-16 md:py-4">
        {discipline.description && (
          <div className="prose prose-lg prose-invert max-w-none mb-16">
            <PortableText value={discipline.description as any} />
          </div>
        )}

        

        {/* Image Gallery */}
        {discipline.images && discipline.images.length > 0 && (
          <div className={`grid gap-8 mt-16 ${discipline.images.filter((image: any) => image?.asset).length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
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
