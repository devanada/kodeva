'use client';

import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';

export interface InputFormFieldProps<T extends FieldValues> extends Omit<React.ComponentProps<'input'>, 'name' | 'id'> {
  control: Control<T>;
  name: Path<T>;
  id: string;
  label?: string;
  description?: string;
  additionalLabel?: React.ReactNode;
  additionalDesc?: React.ReactNode;
  preffix?: React.ReactNode;
  suffix?: React.ReactNode;
  digitsOnly?: boolean;
  valueAsNumber?: boolean;
}

export const InputFormField = <T extends FieldValues>({
  name,
  control,
  label,
  id,
  description,
  additionalLabel,
  preffix,
  suffix,
  digitsOnly,
  valueAsNumber,
  additionalDesc,
  ...props
}: InputFormFieldProps<T>) => {
  const isFileInput = props.type === 'file';

  return (
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
            <InputGroupInput
              {...props}
              type={valueAsNumber ? (props.type ?? 'number') : props.type}
              step={valueAsNumber ? (props.step ?? 'any') : props.step}
              id={id}
              aria-invalid={fieldState.invalid}
              {...(valueAsNumber ? { value: field.value ?? '' } : !isFileInput ? { value: field.value ?? '' } : {})}
              onChange={(e) => {
                if (valueAsNumber) {
                  field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber);
                  props.onChange?.(e);

                  return;
                }

                if (digitsOnly) {
                  e.target.value = e.target.value.replace(/\D/g, '');
                }

                field.onChange(e);
                props.onChange?.(e);
              }}
              disabled={field.disabled || props.disabled}
              name={field.name}
              onBlur={field.onBlur}
              ref={field.ref}
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
};
