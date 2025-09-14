import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'notification',
  title: 'Notification',
  type: 'document',
  fields: [
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: 'Moderation', value: 'moderation' },
          { title: 'Appeal', value: 'appeal' },
          { title: 'Guideline', value: 'guideline' },
          { title: 'System', value: 'system' },
          { title: 'Bulk', value: 'bulk' },
          { title: 'Ticket', value: 'ticket' },
          { title: 'Feedback', value: 'feedback' },
        ],
      },
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'severity',
      title: 'Severity',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Warning', value: 'warning' },
          { title: 'Error', value: 'error' },
          { title: 'Success', value: 'success' },
        ],
      },
    }),
    defineField({
      name: 'recipientId',
      title: 'Recipient ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'recipientRole',
      title: 'Recipient Role',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: 'User', value: 'user' },
          { title: 'Teacher', value: 'teacher' },
          { title: 'Admin', value: 'admin' },
        ],
      },
    }),
    defineField({
      name: 'isRead',
      title: 'Is Read',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'data',
      title: 'Additional Data',
      type: 'object',
      fields: [
        {
          name: 'contentId',
          title: 'Content ID',
          type: 'string',
        },
        {
          name: 'contentType',
          title: 'Content Type',
          type: 'string',
        },
        {
          name: 'appealId',
          title: 'Appeal ID',
          type: 'string',
        },
        {
          name: 'guidelineId',
          title: 'Guideline ID',
          type: 'string',
        },
        {
          name: 'batchId',
          title: 'Batch ID',
          type: 'string',
        },
        {
          name: 'testMessage',
          title: 'Test Message',
          type: 'string',
        },
        {
          name: 'ticketId',
          title: 'Ticket ID',
          type: 'string',
        },
        {
          name: 'ticketTitle',
          title: 'Ticket Title',
          type: 'string',
        },
        {
          name: 'ticketCategory',
          title: 'Ticket Category',
          type: 'string',
        },
        {
          name: 'ticketPriority',
          title: 'Ticket Priority',
          type: 'string',
        },
        {
          name: 'adminResponse',
          title: 'Admin Response',
          type: 'text',
        },
        {
          name: 'userName',
          title: 'User Name',
          type: 'string',
        },
        {
          name: 'userEmail',
          title: 'User Email',
          type: 'string',
        },
        {
          name: 'feedbackId',
          title: 'Feedback ID',
          type: 'string',
        },
        {
          name: 'feedbackTitle',
          title: 'Feedback Title',
          type: 'string',
        },
        {
          name: 'feedbackCategory',
          title: 'Feedback Category',
          type: 'string',
        },
        {
          name: 'feedbackPriority',
          title: 'Feedback Priority',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      severity: 'severity',
      recipientId: 'recipientId',
    },
    prepare(selection) {
      const { title, type, severity, recipientId } = selection
      return {
        title: title,
        subtitle: `${type} - ${severity} - ${recipientId}`,
      }
    },
  },
}) 