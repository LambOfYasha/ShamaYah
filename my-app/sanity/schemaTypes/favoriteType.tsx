import {defineField, defineType} from "sanity";
import { HeartIcon, HeartOffIcon } from "lucide-react";

export const favoriteType = defineType({
  name: 'favorite',
  title: 'Favorite',
  type: 'document',
  icon: HeartIcon,
  fields: [
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{type: 'user'}, {type: 'teacher'}],
      description: 'The user who saved this post',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{type: 'post'}, {type: 'blog'}],
      description: 'The post that was saved',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'savedAt',
      title: 'Saved At',
      type: 'datetime',
      description: 'When the user saved this post',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Whether this favorite is still active (not removed)',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      favorite: "favorite",
      postTitle: 'post.title',
      blogTitle: 'blog.title',
      username: 'user.username',
      teacherUsername: 'teacher.username',
    },
    prepare(selection) {
      const {favorite, postTitle, blogTitle, username, teacherUsername} = selection;
      return {
        title: postTitle || blogTitle,
        subtitle: username || teacherUsername,
        media: favorite === true ? <HeartIcon /> : <HeartOffIcon />,
      };
    },
  },
});
