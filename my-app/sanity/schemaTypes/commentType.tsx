import {defineField, defineType} from "sanity";
import { MessageSquare } from "lucide-react";

export const commentType = defineType({
    name: 'comment',
    title: 'Comment',
    type: 'document',
    icon: MessageSquare,
    fields: [
        defineField({
            name: 'content',
            title: 'Content',
            type: 'text',
            description: 'The content of the comment',
            validation: (Rule) => Rule.required().min(100),
        }),
        defineField({
            name: 'author',
            title: 'Author',
            type: 'reference',
            description: 'The author of the comment',
            to: [{type: 'user'}, {type: 'teacher'}],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'post',
            title: 'Post',
            type: 'reference',
            description: 'The post the comment belongs to',
            to: [{type: 'post'}, {type: 'blog'}],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'parentComment',
            title: 'Parent Comment',
            type: 'reference',
            description: 'The parent comment of the comment',
            to: [{type: 'comment'}],
        }),
        defineField({
            name: 'isReported',
            title: 'Is Reported',
            type: 'boolean',
            description: 'Whether the comment has been reported',
            initialValue: false,
        }),
        defineField({
            name: 'isDeleted',
            title: 'Is Deleted',
            type: 'boolean',
            description: 'Whether the comment has been deleted',
            initialValue: false,
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            description: 'The date and time the comment was created',
            initialValue: new Date().toISOString(),
        }),
    ],
    preview: {
        select: {
            title: 'content',
            subtitle: 'author.username',
        },
        prepare({title, subtitle}) {
            return {
                title,
                subtitle,
            }
        }
    }
})