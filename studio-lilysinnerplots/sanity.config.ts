import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

const SINGLETONS = ['statusMessage', 'chairNote', 'readingList', 'listeningList', 'currentProject'] as const

export default defineConfig({
  name: 'default',
  title: "Lily's Inner Plots",

  projectId: 'qab4bxpf',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Site Content')
          .items([
            S.listItem()
              .title('Status Message')
              .id('statusMessage')
              .child(
                S.document()
                  .schemaType('statusMessage')
                  .documentId('statusMessage')
                  .title('Status Message'),
              ),
            S.listItem()
              .title('Chair Note')
              .id('chairNote')
              .child(
                S.document()
                  .schemaType('chairNote')
                  .documentId('chairNote')
                  .title('Chair Note'),
              ),
            S.listItem()
              .title('Reading List')
              .id('readingList')
              .child(
                S.document()
                  .schemaType('readingList')
                  .documentId('readingList')
                  .title('Reading List'),
              ),
            S.listItem()
              .title('Listening List')
              .id('listeningList')
              .child(
                S.document()
                  .schemaType('listeningList')
                  .documentId('listeningList')
                  .title('Listening List'),
              ),
            S.listItem()
              .title('Current Project')
              .id('currentProject')
              .child(
                S.document()
                  .schemaType('currentProject')
                  .documentId('currentProject')
                  .title('Current Project'),
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(
        ({schemaType}) => !SINGLETONS.includes(schemaType as (typeof SINGLETONS)[number]),
      ),
  },
})
