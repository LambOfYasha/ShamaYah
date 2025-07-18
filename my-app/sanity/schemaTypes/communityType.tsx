import {defineField, defineType} from "sanity";
import { UsersIcon } from "lucide-react";

export const communityType = defineType({
    name: 'communityQuestion',
    title: 'Community Question',
    type: 'document',
    icon: UsersIcon,
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            description: 'The title of the community',
            validation: (Rule) => Rule.required().min(3).max(100),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            description: 'The description of the community',
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            description: 'The slug of the community',
            options: {
                source: 'title',
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            description: 'The image of the community',
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
            name: 'moderator',
            title: 'Moderator',
            type: 'reference',
            to: [{type: 'user'}, {type: 'teacher'}],
            description: 'The moderator of the community (can be a user or teacher)',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            description: 'The date and time the community was created',
            initialValue: new Date().toISOString(),
            validation: (Rule) => Rule.required(),
        }),
    ],
    preview: {
        select: {
            title: 'title',
            media: 'image',
        },
    }
})