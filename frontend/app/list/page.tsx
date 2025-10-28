import SimplifiedHomePage from '@/app/components/SimplifiedHomePage'
import {allDisciplinesQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import imageUrlBuilder from '@sanity/image-url'
import {client} from '@/sanity/lib/client'

const builder = imageUrlBuilder(client)

export default async function ListPage() {
  const {data: disciplines} = await sanityFetch({
    query: allDisciplinesQuery,
  })

  // Transform disciplines to include image URLs
  const disciplinesWithUrls = disciplines?.map((discipline: any) => ({
    _id: discipline._id,
    title: discipline.title,
    slug: discipline.slug,
    coverImage: {
      url: builder.image(discipline.coverImage).width(1400).height(840).url(),
      alt: discipline.coverImage.alt,
    },
  }))

  return <SimplifiedHomePage disciplines={disciplinesWithUrls || []} />
}
