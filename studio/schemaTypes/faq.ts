import { defineField, defineType } from 'sanity';

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'Pertanyaan', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'answer', title: 'Jawaban', type: 'text', rows: 4, validation: (rule) => rule.required() }),
    defineField({ name: 'order', title: 'Urutan', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Urutan', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'question' } },
});
