import { defineArrayMember, defineField, defineType } from 'sanity';

import { PRODUCT_OPTIONS } from './products';

// Draft and publish come with Sanity: the website only ever reads published documents, so a draft stays invisible
// until someone presses Publish.
export const post = defineType({
  name: 'post',
  title: 'Artikel',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Judul', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug (bagian dari URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'excerpt', title: 'Ringkasan', type: 'text', rows: 3 }),
    defineField({
      name: 'cover',
      title: 'Gambar cover',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Teks alternatif', type: 'string' })],
    }),
    defineField({ name: 'category', title: 'Kategori', type: 'reference', to: [{ type: 'category' }] }),
    defineField({
      name: 'body',
      title: 'Isi artikel',
      type: 'array',
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Teks alternatif', type: 'string' })],
        }),
      ],
    }),
    defineField({
      name: 'relatedProducts',
      title: 'Produk terkait',
      description: 'Ditampilkan di bawah artikel.',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: PRODUCT_OPTIONS },
    }),
    defineField({ name: 'publishedAt', title: 'Tanggal terbit', type: 'datetime', initialValue: () => new Date().toISOString() }),
  ],
  orderings: [{ title: 'Terbaru', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'publishedAt', media: 'cover' } },
});
