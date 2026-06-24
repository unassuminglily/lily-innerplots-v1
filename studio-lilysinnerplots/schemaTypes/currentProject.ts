import {defineField, defineType} from 'sanity'

export const currentProject = defineType({
  name: 'currentProject',
  title: 'Current Project',
  type: 'document',
  __experimental_actions: ['create', 'update', 'delete', 'publish'],
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'In Progress', value: 'in progress'},
          {title: 'Just Shipped', value: 'just shipped'},
          {title: 'On Pause', value: 'on pause'},
          {title: 'Coming Soon', value: 'coming soon'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 8,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [{type: 'string'}],
      description: 'e.g. ["html", "css", "canvas api"]',
    }),
    defineField({name: 'nextSteps', title: 'Next Steps', type: 'text', rows: 4}),
    defineField({name: 'githubUrl', title: 'GitHub URL', type: 'url'}),
    defineField({name: 'liveUrl', title: 'Live URL', type: 'url'}),
  ],
})
