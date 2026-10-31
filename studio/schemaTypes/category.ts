import { defineField, defineType } from 'sanity';

export const category = defineType({
  name: 'category',
  title: 'Kategori',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Nama', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
  ],
});
