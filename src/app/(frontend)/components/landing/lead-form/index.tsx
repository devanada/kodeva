'use client';

import { TurnstileInstance } from '@marsidev/react-turnstile';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { CaptchaFormField } from '@/components/form-field/captcha';
import { InputFormField } from '@/components/form-field/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import { createLead } from '@/utils/apis/v2/leads';
import { LeadInput, LeadPayload, LeadSchema } from '@/utils/apis/v2/leads/types';
import { useNearViewport } from '@/utils/hooks/use-near-viewport';
import { getUtm } from '@/utils/tracking/utm';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
const captchaReady = TURNSTILE_SITE_KEY !== '';

function LeadForm() {
  const turnstileRef = useRef<TurnstileInstance>(null);
  // The Turnstile widget costs about 0.9 MB of scripts. The form is far below the fold, so it is only mounted when the
  // form is about to be seen (or a field is focused), not for every visitor who lands from Instagram or TikTok.
  const { ref: formRef, near: captchaActive, activate: activateCaptcha } = useNearViewport<HTMLFormElement>();
  const form = useForm<LeadInput, unknown, LeadPayload>({
    resolver: zodResolver(LeadSchema),
    defaultValues: { name: '', email: '', whatsapp: '', website: '', turnstileToken: '' },
  });

  const onSubmit = async (values: LeadPayload) => {
    try {
      const response = await createLead({ ...values, utm: getUtm(), landingPath: window.location.pathname });

      if (response.metadata.error) {
        toast.error(response.metadata.error);
        turnstileRef.current?.reset();
        form.setValue('turnstileToken', '');

        return;
      }

      toast.success('Terima kasih! Tim kami akan segera menghubungi Anda.');
      form.reset();
      turnstileRef.current?.reset();
    } catch {
      toast.error('Gagal mengirim data, periksa koneksi Anda lalu coba lagi.');
    }
  };

  return (
    <form
      ref={formRef}
      onFocusCapture={activateCaptcha}
      onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
      noValidate
      className='flex flex-col gap-4'
    >
      <InputFormField control={form.control} name='name' id='lead-name' label='Nama' autoComplete='name' />
      <InputFormField
        control={form.control}
        name='email'
        id='lead-email'
        label='Email'
        type='email'
        autoComplete='email'
        inputMode='email'
      />
      <InputFormField
        control={form.control}
        name='whatsapp'
        id='lead-whatsapp'
        label='WhatsApp'
        type='tel'
        autoComplete='tel'
        inputMode='tel'
        description='Isi email atau WhatsApp, salah satu cukup.'
      />
      {/* honeypot: hidden from people and assistive tech, bots tend to fill every input */}
      <div aria-hidden className='absolute -left-[9999px] h-0 w-0 overflow-hidden'>
        <InputFormField
          control={form.control}
          name='website'
          id='lead-website'
          label='Website'
          tabIndex={-1}
          autoComplete='off'
        />
      </div>
      {captchaReady ? (
        captchaActive ? (
          <CaptchaFormField
            control={form.control}
            name='turnstileToken'
            id='lead-captcha'
            siteKey={TURNSTILE_SITE_KEY}
            ref={turnstileRef}
          />
        ) : (
          // reserves the widget's height (65px) so nothing jumps when it mounts
          <div aria-hidden className='min-h-[65px]' />
        )
      ) : (
        // the key is inlined at build time; without it no token can ever be produced, so say so instead of letting
        // the visitor hit a confusing "complete the verification" error on a widget that is not there
        <Alert variant='destructive'>
          <AlertTitle>Formulir belum aktif</AlertTitle>
          <AlertDescription>Verifikasi keamanan belum dikonfigurasi. Silakan coba lagi nanti.</AlertDescription>
        </Alert>
      )}
      <Button type='submit' size='lg' disabled={form.formState.isSubmitting || !captchaReady}>
        {form.formState.isSubmitting && <Spinner />}
        Kirim
      </Button>
    </form>
  );
}

export { LeadForm };
