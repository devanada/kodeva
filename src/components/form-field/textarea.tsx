'use client';

import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group';

export interface TextareaFormFieldProps<T extends FieldValues> extends Omit<
  React.ComponentProps<'textarea'>,
  'name' | 'id'
> {
  control: Control<T>;
  name: Path<T>;
  id: string;
  label?: string;
  description?: string;
  additionalLabel?: React.ReactNode;
  additionalDesc?: React.ReactNode;
  preffix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const TextareaFormField = <T extends FieldValues>({
  name,
  control,
  label,
  id,
  description,
  additionalLabel,
  preffix,
  suffix,
  additionalDesc,
  ...props
}: TextareaFormFieldProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        {label && (
          <div className='flex items-center gap-1'>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {additionalLabel}
          </div>
        )}
        <InputGroup>
          {preffix && (
            <InputGroupAddon align='inline-start' className='has-[>button]:-ml-3'>
              {typeof preffix === 'string' ? <InputGroupText>{preffix}</InputGroupText> : preffix}
            </InputGroupAddon>
          )}
          <InputGroupTextarea
            {...props}
            id={id}
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            aria-invalid={fieldState.invalid}
            value={field.value ?? ''}
            onChange={(e) => {
              field.onChange(e);
              props.onChange?.(e);
            }}
          />
          {suffix && <InputGroupAddon align='inline-end'>{suffix}</InputGroupAddon>}
        </InputGroup>
        {(description || additionalDesc) && (
          <div className='block'>
            {description && <FieldDescription>{description}</FieldDescription>}
            {additionalDesc}
          </div>
        )}
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
);
