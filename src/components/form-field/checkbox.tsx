'use client';

import React, { ReactNode } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { Checkbox as CheckboxPrimitive } from 'radix-ui';

import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';

export interface CheckboxFormFieldProps<T extends FieldValues> extends Omit<
  React.ComponentProps<typeof CheckboxPrimitive.Root>,
  'name' | 'id'
> {
  control: Control<T>;
  name: Path<T>;
  id: string;
  label?: string | ReactNode;
  description?: string;
}

export const CheckboxFormField = <T extends FieldValues>({
  name,
  control,
  label,
  id,
  description,
  onCheckedChange,
  ...props
}: CheckboxFormFieldProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <FieldGroup className='gap-3!'>
        <Field orientation='horizontal' data-invalid={fieldState.invalid}>
          <Checkbox
            {...field}
            {...props}
            id={id}
            checked={field.value}
            onCheckedChange={(checked) => {
              onCheckedChange?.(checked);
              field.onChange(checked);
            }}
          />
          <FieldContent>
            {label && (
              <FieldLabel htmlFor={id} className='gap-1'>
                {label}
              </FieldLabel>
            )}
            {description && <FieldDescription>{description}</FieldDescription>}
          </FieldContent>
        </Field>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </FieldGroup>
    )}
  />
);
