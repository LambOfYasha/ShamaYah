import {defineField, defineType} from "sanity";
import { FileText } from "lucide-react";

export const postType = defineType({
    name: 'post',
    title: 'Post',
    type: 'document',
    icon: FileText,
    fields: [
        defineField({
      name: 'title',
      title: 'Title',  
      type: 'string',
      description: 'The title of the post',
      validation: (Rule) => Rule.required().min(3).max(100),
    }),

    defineField({
      name: 'originalTitle',
      title: 'Original Title',
      type: 'string',
      description: 'The original title of the post in case deleted',
      hidden: true,
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'user'}, {type: 'teacher'}],
      description: 'The author of the post (can be a user or teacher)',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'communityQuestion',
      title: 'Community Question',
      type: 'reference',
      description: 'The community question the post belongs to',
      to: [{type: 'communityQuestion'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'The body of the post',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'The image of the post',
      fields: [
        {
            name: 'alt',
            title: 'Alt Text',
            type: 'string',
            description: 'The alt text for the image',
        },
      ]
    }),
    defineField({
        name: 'isReported',
        title: 'Is Reported',
        type: 'boolean',
        description: 'Whether the post has been reported',
        initialValue: false,
    }),
    defineField({
        name: 'isDeleted',
        title: 'Is Deleted',
        type: 'boolean',
        description: 'Whether the post has been deleted',
        initialValue: false,
    }),
    defineField({
        name: 'publishedAt',
        title: 'Published At',
        type: 'datetime',
        description: 'The date and time the post was published',
        initialValue: new Date().toISOString(),
    }),
],
preview: {
    select: {
        title: 'title',
        subtitle: 'author.username',
        media: 'image',
    },
    prepare({title, subtitle, media}) {
        return {
            title,
            subtitle,
            media,
        }
    }
}
})
