import {defineField, defineType} from 'sanity'

export const chairNote = defineType({
  name: 'chairNote',
  title: 'Chair Note',
  type: 'document',
  __experimental_actions: ['create', 'update', 'delete', 'publish'],
  fields: [
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 6,
      description: 'The note shown when someone sits a while. Use a blank line between paragraphs.',
      validation: (Rule) => Rule.required(),
    }),
  ],
})
