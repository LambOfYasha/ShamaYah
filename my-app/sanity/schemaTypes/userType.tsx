import {defineField, defineType} from "sanity";
import { UserIcon } from "lucide-react";
import Image from "next/image";

export const userType = defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'username',
      title: 'Username',
      type: 'string',
      validation: (Rule) => Rule.required().min(3).max(50),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'imageURL',
      title: 'Profile Image URL',
      type: 'url',
      description: 'URL to the user\'s profile image',
    }),
    defineField({
      name: 'joinedAt',
      title: 'Joined At',
      type: 'datetime',
      description: 'When the user joined',
      initialValue: new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'community',
      title: 'Community Question',
      type: 'reference',
      description: 'The community question this user is a moderator of',
      to: [{type: 'community'}],
    }),
    defineField({
      name: 'isReported',
      title: 'Is Reported',
      type: 'boolean',
      description: 'Whether this user has been reported',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'username',
      media: 'imageURL',
    },
    prepare({title, media}) {
      return {
        title,
        media: media ? (
            <Image src={media} alt={`${title}'s avatar`} width={40} height={40} />
        ) : (
            <UserIcon />
        ),
      }
    }
  },
});

