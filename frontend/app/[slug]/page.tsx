import type {Metadata} from 'next'
import Head from 'next/head'
import {notFound} from 'next/navigation'
import Image from 'next/image'

import PageBuilderPage from '@/app/components/PageBuilder'
import PortableText from '@/app/components/PortableText'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageQuery, pagesSlugs, disciplineQuery, disciplinesSlugs} from '@/sanity/lib/queries'
import {GetPageQueryResult} from '@/sanity.types'
import {PageOnboarding} from '@/app/components/Onboarding'
import imageUrlBuilder from '@sanity/image-url'
import {client} from '@/sanity/lib/client'
import GoBackButton from '@/app/components/GoBackButton'

const builder = imageUrlBuilder(client)

function urlFor(source: any) {
  return builder.image(source)
}

type Props = {
  params: Promise<{slug: string}>
}

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const [{data: pageSlugs}, {data: disciplineSlugs}] = await Promise.all([
    sanityFetch({
      query: pagesSlugs,
      perspective: 'published',
      stega: false,
    }),
    sanityFetch({
      query: disciplinesSlugs,
      perspective: 'published',
      stega: false,
    }),
  ])

  // Combine page slugs and discipline slugs (only those with useDirectSlug enabled)
  return [...(pageSlugs || []), ...(disciplineSlugs || [])]
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params

  // Try to fetch as a page first
  const {data: page} = await sanityFetch({
    query: getPageQuery,
    params,
    stega: false,
  })

  if (page?._id) {
    return {
      title: page?.name,
      description: page?.heading,
    } satisfies Metadata
  }

  // If not a page, try to fetch as a discipline with direct slug
  const {data: discipline} = await sanityFetch({
    query: disciplineQuery,
    params,
    stega: false,
  })

  if (discipline?.useDirectSlug) {
    return {
      title: discipline?.title,
    } satisfies Metadata
  }

  return {
    title: 'Not Found',
  } satisfies Metadata
}

export default async function Page(props: Props) {
  const params = await props.params

  // Try to fetch as a page first
  const {data: page} = await sanityFetch({query: getPageQuery, params})

  if (page?._id) {
    return (
      <div className="h-full overflow-y-auto">
        <Head>
          <title>{page.heading}</title>
        </Head>
        <div className="sticky top-0 z-10">
          <div className="">
            <div className="pb-6">
              <div className="bg-primary text-white w-full">
                <div className="relative w-full bg-primary px-12 md:px-10 pt-1 pb-3 sticky top-0 z-10">
              
                  <h1 className="text-[clamp(1.5rem,4vw,2rem)] text-white font-bold tracking-tight -ml-6 md:ml-0 mt-2">{page.heading}</h1>
                </div>
              </div>
              <GoBackButton />
            </div>
          </div>
        </div>
      
        <PageBuilderPage page={page as GetPageQueryResult} />

      </div>
    )
  }

  // If not a page, try to fetch as a discipline with direct slug
  const {data: discipline} = await sanityFetch({query: disciplineQuery, params})

  if (discipline?.useDirectSlug) {
    // Render the discipline page inline
    return (
      <div className="h-full overflow-y-auto">
        <div className="relative w-full bg-primary px-12 md:px-10 py-4 sticky top-0 z-10">
         
          <h1 className="text-[clamp(1.5rem,4vw,2rem)] text-white font-bold tracking-tight -ml-6 md:ml-0 mt-2">
            {discipline.title}
          </h1>
        </div>
        <GoBackButton />

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

  // If neither found, show onboarding or 404
  if (!page?._id && !discipline) {
    return (
      <div className="py-40">
        <PageOnboarding />
      </div>
    )
  }

  // If discipline exists but doesn't have direct slug enabled, redirect to proper URL
  notFound()
}
