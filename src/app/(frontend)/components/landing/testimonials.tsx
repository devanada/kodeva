import { Card, CardContent } from '@/components/ui/card';

import type { ICmsTestimonial } from '@/utils/services/cms/types';

interface TestimonialsProps {
  testimonials: ICmsTestimonial[];
}

function Testimonials({ testimonials }: TestimonialsProps) {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className='mx-auto max-w-5xl px-4 py-10'>
      <h2 className='mb-6 text-2xl font-semibold tracking-tight'>Kata pelanggan kami</h2>
      <div className='grid gap-4 md:grid-cols-3'>
        {testimonials.map((testimonial) => (
          <Card key={testimonial._id}>
            <CardContent className='flex flex-col gap-3'>
              <blockquote className='text-sm'>&ldquo;{testimonial.quote}&rdquo;</blockquote>
              <p className='text-sm font-medium'>
                {testimonial.name}
                <span className='text-muted-foreground block font-normal'>
                  {[testimonial.role, testimonial.business].filter(Boolean).join(', ')}
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export { Testimonials };
