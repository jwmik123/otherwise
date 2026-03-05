import HomePage from '@/app/components/HomePage'
import {allDisciplinesQuery, homePageSettingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import imageUrlBuilder from '@sanity/image-url'
import {client} from '@/sanity/lib/client'

const builder = imageUrlBuilder(client)

export default async function Page() {
  const [{data: disciplines}, {data: settings}] = await Promise.all([
    sanityFetch({query: allDisciplinesQuery}),
    sanityFetch({query: homePageSettingsQuery}),
  ])

  // Transform disciplines to include image URLs
  const disciplinesWithUrls = disciplines?.map((discipline: any) => ({
    _id: discipline._id,
    title: discipline.title,
    slug: discipline.slug,
    useDirectSlug: discipline.useDirectSlug,
    coverImage: {
      url: builder.image(discipline.coverImage).width(800).height(480).fit('crop').url(),
      alt: discipline.coverImage.alt,
    },
  }))

  const homepageImageUrl = settings?.homepageImage?.asset
    ? builder.image(settings.homepageImage).width(800).fit('max').url()
    : undefined

  return (
    <HomePage
      disciplines={disciplinesWithUrls || []}
      homepageTagline={settings?.homepageTagline ?? undefined}
      homepageHeading={settings?.homepageHeading ?? undefined}
      homepageSection1Title={settings?.homepageSection1Title ?? undefined}
      homepageSection1Body={settings?.homepageSection1Body ?? undefined}
      homepageSection2Title={settings?.homepageSection2Title ?? undefined}
      homepageSection2Body={settings?.homepageSection2Body ?? undefined}
      homepageImageUrl={homepageImageUrl}
      homepageImageAlt={settings?.homepageImage?.alt ?? undefined}
      homepageImageLink={settings?.homepageImage?.link ?? undefined}
    />
  )
}
