import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'guestQuestion',
  title: 'Guest Question',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'text',
      validation: (Rule) => Rule.required().min(10).max(1000),
    }),
    defineField({
      name: 'guestEmail',
      title: 'Guest Email (Optional)',
      type: 'string',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Reviewed', value: 'reviewed' },
          { title: 'Answered', value: 'answered' },
          { title: 'Rejected', value: 'rejected' },
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'General', value: 'general' },
          { title: 'Theology', value: 'theology' },
          { title: 'Biblical Interpretation', value: 'biblical-interpretation' },
          { title: 'Christian Living', value: 'christian-living' },
          { title: 'Church History', value: 'church-history' },
          { title: 'Apologetics', value: 'apologetics' },
          { title: 'Other', value: 'other' },
        ],
      },
      initialValue: 'general',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      hidden: ({ document }) => document?.status !== 'answered',
    }),
    defineField({
      name: 'reviewedBy',
      title: 'Reviewed By',
      type: 'reference',
      to: [{ type: 'user' }],
      hidden: ({ document }) => !document?.reviewed,
    }),
    defineField({
      name: 'answeredBy',
      title: 'Answered By',
      type: 'reference',
      to: [{ type: 'user' }],
      hidden: ({ document }) => document?.status !== 'answered',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'reviewedAt',
      title: 'Reviewed At',
      type: 'datetime',
      hidden: ({ document }) => !document?.reviewed,
    }),
    defineField({
      name: 'answeredAt',
      title: 'Answered At',
      type: 'datetime',
      hidden: ({ document }) => document?.status !== 'answered',
    }),
  ],
  preview: {
    select: {
      title: 'question',
      status: 'status',
      category: 'category',
      createdAt: 'createdAt',
    },
    prepare(selection) {
      const { title, status, category, createdAt } = selection;
      const date = new Date(createdAt).toLocaleDateString();
      return {
        title: title?.length > 50 ? `${title.substring(0, 50)}...` : title,
        subtitle: `${status} • ${category} • ${date}`,
      };
    },
  },
  orderings: [
    {
      title: 'Created At (Newest)',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Created At (Oldest)',
      name: 'createdAtAsc',
      by: [{ field: 'createdAt', direction: 'asc' }],
    },
    {
      title: 'Status',
      name: 'status',
      by: [{ field: 'status', direction: 'asc' }],
    },
  ],
});
