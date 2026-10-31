'use client';

import { Turnstile, TurnstileInstance, TurnstileProps } from '@marsidev/react-turnstile';
import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';

export interface CaptchaFormFieldProps<T extends FieldValues> extends Omit<
  TurnstileProps,
  'onSuccess' | 'onExpire' | 'siteKey'
> {
  control: Control<T>;
  name: Path<T>;
  id: string;
  siteKey: string;
  label?: string;
  description?: string;
  additionalLabel?: React.ReactNode;
}

const CaptchaFormFieldInner = <T extends FieldValues>(
  { name, control, label, id, description, additionalLabel, siteKey, ...props }: CaptchaFormFieldProps<T>,
  ref: React.Ref<TurnstileInstance>,
) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        {label && (
          <div className='flex items-center'>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {additionalLabel}
          </div>
        )}
        <Turnstile
          {...props}
          id={id}
          ref={ref}
          siteKey={siteKey}
          onSuccess={(token) => field.onChange(token)}
          onExpire={() => field.onChange('')}
        />
        {description && <FieldDescription>{description}</FieldDescription>}
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
);

export const CaptchaFormField = React.forwardRef(CaptchaFormFieldInner) as <T extends FieldValues>(
  props: CaptchaFormFieldProps<T> & { ref?: React.Ref<TurnstileInstance> },
) => React.ReactElement;
