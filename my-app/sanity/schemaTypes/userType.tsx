import {defineField, defineType, ValidationRule} from "sanity";
import { UserIcon } from "lucide-react";
import Image from "next/image";

export const userType = defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  icon: UserIcon,
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
      description: 'User role in the system',
      options: {
        list: [
          {title: 'Member', value: 'member'},
          {title: 'Moderator', value: 'moderator'},
          {title: 'Admin', value: 'admin'},
          {title: 'Teacher', value: 'teacher'},
        ],
        layout: 'radio'
      },
      initialValue: 'member',
      validation: (Rule: ValidationRule) => Rule.required(),
    }),
    defineField({
      name: 'joinedAt',
      title: 'Joined At',
      type: 'datetime',
      description: 'When the user joined',
      initialValue: new Date().toISOString(),
      validation: (Rule: ValidationRule) => Rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Whether this user account is active',
      initialValue: true,
    }),
    defineField({
      name: 'lastActive',
      title: 'Last Active',
      type: 'datetime',
      description: 'When the user was last active',
    }),
    defineField({
      name: 'postCount',
      title: 'Post Count',
      type: 'number',
      description: 'Number of posts created by this user',
      initialValue: 0,
    }),
    defineField({
      name: 'commentCount',
      title: 'Comment Count',
      type: 'number',
      description: 'Number of comments made by this user',
      initialValue: 0,
    }),
    defineField({
      name: 'reportCount',
      title: 'Report Count',
      type: 'number',
      description: 'Number of reports against this user',
      initialValue: 0,
    }),
    defineField({
      name: 'isReported',
      title: 'Is Reported',
      type: 'boolean',
      description: 'Whether this user has been reported',
      initialValue: false,
    }),
    defineField({
      name: 'isDeleted',
      title: 'Is Deleted',
      type: 'boolean',
      description: 'Whether this user account has been deleted',
      initialValue: false,
    }),
    defineField({
      name: 'deletedAt',
      title: 'Deleted At',
      type: 'datetime',
      description: 'When the user account was deleted',
    }),
    defineField({
      name: 'deletedBy',
      title: 'Deleted By',
      type: 'string',
      description: 'ID of the user who deleted this account',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      description: 'User biography',
      rows: 3,
    }),
    defineField({
      name: 'preferences',
      title: 'Preferences',
      type: 'object',
      description: 'User preferences and settings',
      fields: [
        {
          name: 'notifications',
          title: 'Notification Preferences',
          type: 'object',
          fields: [
            {
              name: 'email',
              title: 'Email Notifications',
              type: 'boolean',
              initialValue: true,
            },
            {
              name: 'push',
              title: 'Push Notifications',
              type: 'boolean',
              initialValue: true,
            },
          ],
        },
        {
          name: 'privacy',
          title: 'Privacy Settings',
          type: 'object',
          fields: [
            {
              name: 'profileVisible',
              title: 'Profile Visible',
              type: 'boolean',
              initialValue: true,
            },
            {
              name: 'activityVisible',
              title: 'Activity Visible',
              type: 'boolean',
              initialValue: true,
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'blog',
      title: 'Blog',
      type: 'reference',
      description: 'The blog this user is a moderator of',
      to: [{type: 'blog'}],
    }),
    defineField({
      name: 'communityQuestion',
      title: 'Community Question',
      type: 'reference',
      description: 'The community question this user is a moderator of',
      to: [{type: 'communityQuestion'}],
    }),
    // Teacher-specific fields
    defineField({
      name: 'teacherRole',
      title: 'Teacher Role',
      type: 'string',
      description: 'Specific role for teachers (only applies if role is teacher)',
      options: {
        list: [
          {title: 'Teacher', value: 'teacher'},
          {title: 'Senior Teacher', value: 'senior_teacher'},
          {title: 'Lead Teacher', value: 'lead_teacher'},
        ],
        layout: 'radio'
      },
      hidden: ({document}) => document?.role !== 'teacher',
    }),
    defineField({
      name: 'specializations',
      title: 'Specializations',
      type: 'array',
      description: 'Academic specializations for teachers',
      of: [{type: 'string'}],
      options: {
        list: [
          'Theology',
          'Biblical Studies',
          'Church History',
          'Systematic Theology',
          'Pastoral Care',
          'Ethics',
          'Apologetics',
          'Homiletics',
          'Liturgy',
          'Mission Studies',
          'Christian Education',
          'Counseling',
          'Philosophy',
          'Languages',
          'Archaeology'
        ]
      },
      hidden: ({document}) => document?.role !== 'teacher',
    }),
    defineField({
      name: 'qualifications',
      title: 'Qualifications',
      type: 'array',
      description: 'Academic qualifications and degrees',
      of: [{type: 'string'}],
      hidden: ({document}) => document?.role !== 'teacher',
    }),
    defineField({
      name: 'experience',
      title: 'Years of Experience',
      type: 'number',
      description: 'Number of years of teaching experience',
      hidden: ({document}) => document?.role !== 'teacher',
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      description: 'Average rating from students (1-5)',
      validation: (Rule) => Rule.min(1).max(5),
      hidden: ({document}) => document?.role !== 'teacher',
    }),
    defineField({
      name: 'totalStudents',
      title: 'Total Students',
      type: 'number',
      description: 'Total number of students taught',
      initialValue: 0,
      hidden: ({document}) => document?.role !== 'teacher',
    }),
    defineField({
      name: 'coursesCreated',
      title: 'Courses Created',
      type: 'number',
      description: 'Number of courses created by this teacher',
      initialValue: 0,
      hidden: ({document}) => document?.role !== 'teacher',
    }),
  ],
  preview: {
    select: {
      title: 'username',
      media: 'imageURL',
      role: 'role',
      clerkId: 'id',
      isActive: 'isActive',
      isReported: 'isReported',
    },
    prepare({title, media, role, clerkId, isActive, isReported}: {
      title?: string, 
      media?: string, 
      role?: string, 
      clerkId?: string,
      isActive?: boolean,
      isReported?: boolean
    }) {
      const status = isReported ? 'Reported' : isActive ? 'Active' : 'Inactive';
      return {
        title,
        subtitle: `${role || 'No role'} • ${status} • ${clerkId ? 'Clerk ID: ' + clerkId.slice(0, 8) + '...' : 'No Clerk ID'}`,
        media: media ? (
            <Image src={media} alt={`${title}'s avatar`} width={40} height={40} />
        ) : (
            <UserIcon />
        ),
      }
    }
  },
});

