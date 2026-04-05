import { defineField, defineType, ValidationRule } from "sanity";
import { FileText } from "lucide-react";

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: FileText,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The title shown at the top of the page',
      validation: (Rule: ValidationRule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The route slug for this page',
      options: { source: 'title' },
      validation: (Rule: ValidationRule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Optional summary shown under the page title',
      validation: (Rule: ValidationRule) => Rule.max(240),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      description: 'The page content (HTML)',
      validation: (Rule: ValidationRule) => Rule.required(),
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      description: 'Controls whether this page is visible to the public',
      initialValue: true,
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      description: 'The date and time the page was created',
      initialValue: new Date().toISOString(),
      validation: (Rule: ValidationRule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'The date and time the page was last updated',
      initialValue: new Date().toISOString(),
      validation: (Rule: ValidationRule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      isPublished: 'isPublished',
    },
    prepare({ title, slug, isPublished }: { title?: string; slug?: string; isPublished?: boolean }) {
      return {
        title,
        subtitle: `${isPublished ? 'Published' : 'Draft'}${slug ? ` • /${slug}` : ''}`,
      };
    },
  },
});
