import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [
        { type: 'communityQuestion' },
        { type: 'blogPost' }
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parentComment',
      title: 'Parent Comment',
      type: 'reference',
      to: [{ type: 'comment' }],
      description: 'Reference to parent comment for nested replies',
    }),
    defineField({
      name: 'replies',
      title: 'Replies',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'comment' }] }],
      description: 'Child comments/replies to this comment',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'content',
      author: 'author.name',
      createdAt: 'createdAt',
    },
    prepare(selection) {
      const { title, author, createdAt } = selection
      return {
        title: title ? `${title.substring(0, 50)}...` : 'No content',
        subtitle: `by ${author || 'Unknown'} on ${createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown date'}`,
      }
    },
  },
}) 