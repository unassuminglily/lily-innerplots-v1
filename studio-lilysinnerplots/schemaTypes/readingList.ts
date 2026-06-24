import {defineArrayMember, defineField, defineType} from 'sanity'

export const readingList = defineType({
  name: 'readingList',
  title: 'Reading List',
  type: 'document',
  __experimental_actions: ['create', 'update', 'delete', 'publish'],
  fields: [
    defineField({
      name: 'books',
      title: 'Books',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'author', title: 'Author', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({
              name: 'progress',
              title: 'Progress (1–5)',
              type: 'number',
              validation: (Rule) => Rule.required().min(1).max(5).integer(),
            }),
            defineField({name: 'note', title: 'Note', type: 'string'}),
            defineField({name: 'order', title: 'Order', type: 'number', description: 'Lower numbers appear first.'}),
          ],
          preview: {
            select: {title: 'title', subtitle: 'author'},
          },
        }),
      ],
    }),
  ],
})
