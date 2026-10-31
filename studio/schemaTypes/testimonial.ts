import { defineField, defineType } from 'sanity';

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimoni',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nama', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'role', title: 'Jabatan', type: 'string' }),
    defineField({ name: 'business', title: 'Usaha', type: 'string' }),
    defineField({ name: 'quote', title: 'Kutipan', type: 'text', rows: 4, validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: 'name', subtitle: 'business' } },
});
