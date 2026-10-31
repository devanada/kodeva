import { defineField, defineType } from 'sanity';

// Created by the website's lead Function with a write token. Marketing reads them here; nothing is editable.
export const lead = defineType({
  name: 'lead',
  title: 'Lead',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({ name: 'name', title: 'Nama', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'whatsapp', title: 'WhatsApp', type: 'string' }),
    defineField({
      name: 'utm',
      title: 'UTM (asal kampanye)',
      type: 'object',
      fields: ['source', 'medium', 'campaign', 'content', 'term'].map((name) => defineField({ name, type: 'string' })),
    }),
    defineField({ name: 'landingPath', title: 'Halaman asal', type: 'string' }),
    defineField({ name: 'createdAt', title: 'Waktu masuk', type: 'datetime' }),
  ],
  orderings: [{ title: 'Terbaru', name: 'createdAtDesc', by: [{ field: 'createdAt', direction: 'desc' }] }],
  preview: { select: { title: 'name', subtitle: 'createdAt' } },
});
