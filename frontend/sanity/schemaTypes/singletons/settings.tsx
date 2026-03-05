import {CogIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import * as demo from '../../lib/demo'

/**
 * Settings schema Singleton.  Singletons are single documents that are displayed not in a collection, handy for things like site settings and other global configurations.
 * Learn more: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
 */

export const settings = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'homepage', title: 'Homepagina'},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({
      name: 'title',
      description: 'This field is the title of your site.',
      title: 'Title',
      type: 'string',
      initialValue: demo.title,
      group: 'settings',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      description: 'Used on the Homepage',
      title: 'Description',
      type: 'array',
      group: 'settings',
      initialValue: demo.description,
      of: [
        defineArrayMember({
          type: 'block',
          options: {},
          styles: [],
          lists: [],
          marks: {
            decorators: [],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'linkType',
                    title: 'Link Type',
                    type: 'string',
                    initialValue: 'href',
                    options: {
                      list: [
                        {title: 'URL', value: 'href'},
                        {title: 'Page', value: 'page'},
                      ],
                      layout: 'radio',
                    },
                  }),
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    hidden: ({parent}) => parent?.linkType !== 'href' && parent?.linkType != null,
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }).custom((value, context: any) => {
                        if (context.parent?.linkType === 'href' && !value) {
                          return 'URL is required when Link Type is URL'
                        }
                        return true
                      }),
                  }),
                  defineField({
                    name: 'page',
                    title: 'Page',
                    type: 'reference',
                    to: [{type: 'page'}],
                    hidden: ({parent}) => parent?.linkType !== 'page',
                    validation: (Rule) =>
                      Rule.custom((value, context: any) => {
                        if (context.parent?.linkType === 'page' && !value) {
                          return 'Page reference is required when Link Type is Page'
                        }
                        return true
                      }),
                  }),
                  defineField({
                    name: 'openInNewTab',
                    title: 'Open in new tab',
                    type: 'boolean',
                    initialValue: false,
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'marqueeText',
      title: 'Marquee Text',
      description: 'Text displayed in the scrolling marquee banner',
      type: 'string',
      group: 'settings',
      initialValue: 'Welcome to our site',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contactContent',
      title: 'Contact Panel Content',
      description: 'Content displayed in the contact panel dropdown',
      type: 'blockContent',
      group: 'settings',
    }),
    defineField({
      name: 'homepageTagline',
      title: 'Homepage Tagline',
      description: 'Small label above the main heading (e.g. "Otherwise")',
      type: 'string',
      group: 'homepage',
      initialValue: 'Otherwise',
    }),
    defineField({
      name: 'homepageHeading',
      title: 'Homepage Heading',
      description: 'Main hero heading on the homepage. Press Enter for a new line.',
      type: 'text',
      rows: 3,
      group: 'homepage',
      initialValue: 'Anders denken\nén anders doen.',
    }),
    defineField({
      name: 'homepageSection1Title',
      title: 'Homepage Section 1 Title',
      type: 'string',
      group: 'homepage',
      initialValue: 'Snel, secuur en altijd een oplossing',
    }),
    defineField({
      name: 'homepageSection1Body',
      title: 'Homepage Section 1 Body',
      type: 'text',
      rows: 4,
      group: 'homepage',
      initialValue:
        'Otherwise is een no-nonsense creatieve studio waar strategie, design en realisatie samenkomen. Van concept tot uitvoering maken wij alles wat merken laat stralen, snel, secuur en met oog voor detail. We houden van korte lijnen, duidelijkheid en een goed resultaat waar iedereen blij van wordt. In plaats van snel scoren richten we ons op duurzame relaties en langdurige resultaten.',
    }),
    defineField({
      name: 'homepageSection2Title',
      title: 'Homepage Section 2 Title',
      type: 'string',
      group: 'homepage',
      initialValue: 'Creatieve oplossingen en sterke communicatie',
    }),
    defineField({
      name: 'homepageSection2Body',
      title: 'Homepage Section 2 Body',
      type: 'text',
      rows: 4,
      group: 'homepage',
      initialValue:
        'Bij Otherwise geloven we dat elk vraagstuk een creatieve oplossing heeft. Of je nu op zoek bent naar een opvallend verpakkingsontwerp, een effectieve direct mail campagne of een sterk communicatiemiddel dat echt opvalt. Wij zorgen dat jouw merk overal opvalt en indruk maakt. Van flyer tot insert en van brochure tot online banner, we vertalen elk idee moeiteloos naar print en digitaal. Zo blijft je merk herkenbaar, krachtig en zichtbaar op elk kanaal, van de brievenbus tot het beeldscherm.',
    }),
    defineField({
      name: 'homepageImage',
      title: 'Homepage Image',
      description: 'Image displayed on the right side of the homepage',
      type: 'image',
      group: 'homepage',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
        }),
        defineField({
          name: 'link',
          title: 'Link URL',
          description: 'Page the image links to (e.g. /otherprice-days)',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      group: 'settings',
      description: 'Displayed on social cards and search engine results.',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        defineField({
          name: 'alt',
          description: 'Important for accessibility and SEO.',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => {
            return rule.custom((alt, context) => {
              if ((context.document?.ogImage as any)?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        }),
        defineField({
          name: 'metadataBase',
          type: 'url',
          description: (
            <a
              href="https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase"
              rel="noreferrer noopener"
            >
              More information
            </a>
          ),
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Settings',
      }
    },
  },
})
