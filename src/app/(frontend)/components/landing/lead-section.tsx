import { LeadForm } from './lead-form';

function LeadSection() {
  return (
    <section id='daftar' className='mx-auto max-w-xl scroll-mt-16 px-4 py-10'>
      <h2 className='mb-2 text-2xl font-semibold tracking-tight'>Tertarik? Tinggalkan kontak Anda</h2>
      <p className='text-muted-foreground mb-6 text-sm'>Tim kami akan menghubungi Anda untuk demo gratis.</p>
      <LeadForm />
    </section>
  );
}

export { LeadSection };
