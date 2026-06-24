import {defineField, defineType} from 'sanity'

export const statusMessage = defineType({
  name: 'statusMessage',
  title: 'Status Message',
  type: 'document',
  __experimental_actions: ['update', 'discardChanges', 'publish'],
  fields: [
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 6,
      description: 'What you are currently working on. Each line becomes a bullet in the mailbox popup.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'Optional — lets visitors know when this was last changed.',
    }),
  ],
})
