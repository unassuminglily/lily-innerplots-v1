import {defineArrayMember, defineField, defineType} from 'sanity'

export const listeningList = defineType({
  name: 'listeningList',
  title: 'Listening List',
  type: 'document',
  __experimental_actions: ['update', 'discardChanges', 'publish'],
  fields: [
    defineField({
      name: 'tracks',
      title: 'Tracks',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({
              name: 'source',
              title: 'Source',
              type: 'string',
              description: 'e.g. "Mac Miller · album", "BBC Sounds · podcast"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'note', title: 'Note', type: 'string'}),
            defineField({name: 'order', title: 'Order', type: 'number', description: 'Lower numbers appear first.'}),
          ],
          preview: {
            select: {title: 'title', subtitle: 'source'},
          },
        }),
      ],
    }),
  ],
})
