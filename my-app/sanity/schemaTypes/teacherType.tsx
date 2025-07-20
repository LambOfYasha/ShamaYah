import {defineField, defineType, ValidationRule} from "sanity";
import { GraduationCapIcon } from "lucide-react";
import Image from "next/image";

export const teacherType = defineType({
  name: 'teacher',
  title: 'Teacher',
  type: 'document',
  icon: GraduationCapIcon,
  fields: [
    defineField({
      name: 'id',
      title: 'Clerk ID',
      type: 'string',
      description: 'The Clerk user ID',
      validation: (Rule: ValidationRule) => Rule.required(),
    }),
    defineField({
      name: 'username',
      title: 'Username',
      type: 'string',
      validation: (Rule: ValidationRule) => Rule.required().min(3).max(50),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule: ValidationRule) => Rule.required().email(),
    }),
    defineField({
      name: 'imageURL',
      title: 'Profile Image URL',
      type: 'url',
      description: 'URL to the user\'s profile image',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'Teacher role in the system',
      options: {
        list: [
          {title: 'Teacher', value: 'teacher'},
          {title: 'Senior Teacher', value: 'senior_teacher'},
          {title: 'Lead Teacher', value: 'lead_teacher'},
        ],
        layout: 'radio'
      },
      initialValue: 'teacher',
      validation: (Rule: ValidationRule) => Rule.required(),
    }),
    defineField({
      name: 'specializations',
      title: 'Specializations',
      type: 'array',
      description: 'Areas of expertise',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'joinedAt',
      title: 'Joined At',
      type: 'datetime',
      description: 'When the teacher joined',
      initialValue: new Date().toISOString(),
      validation: (Rule: ValidationRule) => Rule.required(),
    }),
    defineField({
      name: 'isReported',
      title: 'Is Reported',
      type: 'boolean',
      description: 'Whether this teacher has been reported',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'username',
      media: 'imageURL',
      role: 'role',
      clerkId: 'id',
    },
    prepare({title, media, role, clerkId}: {title?: string, media?: string, role?: string, clerkId?: string}) {
      return {
        title,
        subtitle: `${role || 'No role'} • ${clerkId ? 'Clerk ID: ' + clerkId.slice(0, 8) + '...' : 'No Clerk ID'}`,
        media: media ? (
            <Image src={media} alt={`${title}'s avatar`} width={40} height={40} />
        ) : (
            <GraduationCapIcon />
        ),
      }
    }
  },
});

