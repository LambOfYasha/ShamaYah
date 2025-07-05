import {defineField, defineType} from "sanity";
import { BookIcon } from "lucide-react";


export const blogType = defineType({
    name: 'blog',
    title: 'Blog',
    type: 'document',
    icon: BookIcon,
    fields: [
        defineField({
            name: 'title',
            title: 'Title', 
            type: 'string',
            description: 'The title of the blog',
            validation: (Rule) => Rule.required().min(3).max(100),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            description: 'The slug of the blog',
            options: {source: 'title'},
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            description: 'The description of the blog',
            validation: (Rule) => Rule.required().min(100),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            description: 'The image of the blog',
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
            name: 'content',
            title: 'Content',
            type: 'array',
            description: 'The content of the blog',
            of: [{type: 'block'}],
            validation: (Rule) => Rule.required().min(100),
        }),
        defineField({
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: [{type: 'teacher'}],
            description: 'The author of the blog',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            description: 'The date and time the blog was created',
            initialValue: new Date().toISOString(),
            validation: (Rule) => Rule.required(),
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'author.username',
            media: 'image',
        },
    }
})