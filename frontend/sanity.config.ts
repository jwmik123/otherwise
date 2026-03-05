/**
 * This config is used to set up Sanity Studio that's mounted in the Next.js app at /studio.
 * Learn more: https://www.sanity.io/docs/configuration
 */

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './sanity/schemaTypes'
import {structure} from './sanity/structure'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {
  presentationTool,
  defineDocuments,
  defineLocations,
  type DocumentLocation,
} from 'sanity/presentation'
import {assist} from '@sanity/assist'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

const homeLocation = {
  title: 'Home',
  href: '/',
} satisfies DocumentLocation

function resolveHref(documentType?: string, slug?: string, useDirectSlug?: boolean): string | undefined {
  switch (documentType) {
    case 'page':
      return slug ? `/${slug}` : undefined
    case 'discipline':
      if (useDirectSlug) {
        return slug ? `/${slug}` : undefined
      }
      return slug ? `/disciplines/${slug}` : undefined
    default:
      console.warn('Invalid document type:', documentType)
      return undefined
  }
}

export default defineConfig({
  name: 'default',
  title: 'Otherwise Amsterdam',

  projectId,
  dataset,

  plugins: [
    presentationTool({
      previewUrl: {
        // Same origin — the studio is embedded in the frontend
        origin: typeof window !== 'undefined' ? window.location.origin : '',
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: '/',
            filter: `_type == "settings" && _id == "siteSettings"`,
          },
          {
            route: '/disciplines/:slug',
            filter: `_type == "discipline" && slug.current == $slug && useDirectSlug != true`,
          },
          {
            route: '/:slug',
            filter: `_type == "page" && slug.current == $slug || _type == "discipline" && slug.current == $slug && useDirectSlug == true || _id == $slug`,
          },
        ]),
        locations: {
          settings: defineLocations({
            locations: [homeLocation],
            message: 'This document is used on all pages',
            tone: 'positive',
          }),
          page: defineLocations({
            select: {
              name: 'name',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.name || 'Untitled',
                  href: resolveHref('page', doc?.slug)!,
                },
              ],
            }),
          }),
          discipline: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
              useDirectSlug: 'useDirectSlug',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: resolveHref('discipline', doc?.slug, doc?.useDirectSlug)!,
                },
              ].filter(Boolean) as DocumentLocation[],
            }),
          }),
        },
      },
    }),
    structureTool({structure}),
    unsplashImageAsset(),
    assist(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
