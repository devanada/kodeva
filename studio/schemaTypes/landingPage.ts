import { defineArrayMember, defineField, defineType } from 'sanity';

import { PRODUCT_OPTIONS } from './products';

// Content of every landing page section. The order and layout of the sections stay in the website code.
export const landingPage = defineType({
  name: 'landingPage',
  title: 'Landing page',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Bagian utama (hero)',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Judul', type: 'string', validation: (rule) => rule.required() }),
        defineField({ name: 'subtitle', title: 'Subjudul', type: 'text', rows: 3 }),
        defineField({ name: 'ctaLabel', title: 'Teks tombol', type: 'string', initialValue: 'Lihat katalog' }),
        defineField({
          name: 'image',
          title: 'Gambar',
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Teks alternatif', type: 'string' })],
        }),
      ],
    }),
    defineField({
      name: 'featuredProducts',
      title: 'Produk unggulan',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: PRODUCT_OPTIONS },
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimoni',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'testimonial' }] })],
    }),
    defineField({
      name: 'faqs',
      title: 'FAQ',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'faq' }] })],
    }),
  ],
  preview: { prepare: () => ({ title: 'Landing page' }) },
});
