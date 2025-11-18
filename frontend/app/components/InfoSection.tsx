import {type PortableTextBlock} from 'next-sanity'
import {stegaClean} from '@sanity/client/stega'
import {Image} from 'next-sanity/image'
import {getImageDimensions, SanityImageSource} from '@sanity/asset-utils'

import PortableText from '@/app/components/PortableText'
import {InfoSection} from '@/sanity.types'
import {urlForImage} from '@/sanity/lib/utils'

type InfoProps = {
  block: InfoSection
  index: number
}

export default function CTA({block}: InfoProps) {
  const hasImage = block?.image?.asset?._ref

  return (
    <div className="my-12 px-8">
      <div className={`flex flex-col ${hasImage ? 'md:flex-row md:gap-8 lg:gap-12' : ''}`}>
        {/* Text Content */}
        <div className={hasImage ? 'md:w-1/2' : ''}>
          {block?.heading && (
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">{block.heading}</h2>
          )}
          {block?.subheading && (
            <span className="block mt-4 mb-8 text-lg uppercase font-light text-gray-900/70">
              {block.subheading}
            </span>
          )}
          <div className="mt-4">
            {block?.content?.length && (
              <PortableText className="" value={block.content as PortableTextBlock[]} />
            )}
          </div>
        </div>

        {/* Image - below on mobile, right side on desktop */}
        {hasImage && (
          <div className="mt-8 md:mt-0 md:w-1/2">
            <Image
              className="w-full h-auto rounded-lg object-cover"
              width={getImageDimensions(block.image as SanityImageSource).width}
              height={getImageDimensions(block.image as SanityImageSource).height}
              alt={stegaClean(block.image?.alt) || ''}
              src={urlForImage(block.image)?.url() as string}
            />
          </div>
        )}
      </div>
    </div>
  )
}
