import HomePage from '@/app/components/HomePage'
import {allDisciplinesQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import imageUrlBuilder from '@sanity/image-url'
import {client} from '@/sanity/lib/client'

const builder = imageUrlBuilder(client)

export default async function Page() {
  const {data: disciplines} = await sanityFetch({
    query: allDisciplinesQuery,
  })

  // Transform disciplines to include image URLs
  const disciplinesWithUrls = disciplines?.map((discipline: any) => ({
    _id: discipline._id,
    title: discipline.title,
    slug: discipline.slug,
    coverImage: {
      url: builder.image(discipline.coverImage).width(800).height(480).fit('crop').url(),
      alt: discipline.coverImage.alt,
    },
  }))

  return <HomePage disciplines={disciplinesWithUrls || []} />
}
