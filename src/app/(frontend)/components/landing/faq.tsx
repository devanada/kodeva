import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import type { ICmsFaq } from '@/utils/services/cms/types';

interface FaqSectionProps {
  faqs: ICmsFaq[];
}

function FaqSection({ faqs }: FaqSectionProps) {
  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className='mx-auto max-w-3xl px-4 py-10'>
      <h2 className='mb-6 text-2xl font-semibold tracking-tight'>Pertanyaan yang sering diajukan</h2>
      <Accordion type='single' collapsible>
        {faqs.map((faq) => (
          <AccordionItem key={faq._id} value={faq._id}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export { FaqSection };
