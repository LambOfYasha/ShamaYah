import {defineField, defineType} from "sanity";
import { HeartIcon, HeartOffIcon } from "lucide-react";

export default defineType({
  name: 'favorite',
  title: 'Favorite',
  type: 'document',
  icon: HeartIcon,
  fields: [
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{type: 'user'}],
      description: 'The user who saved this post',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{type: 'post'}],
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
      username: 'user.username',
    },
    prepare(selection) {
      const {favorite, postTitle, username} = selection;
      return {
        title: postTitle,
        subtitle: username,
        media: favorite === true ? <HeartIcon /> : <HeartOffIcon />,
      };
    },
  },
});
