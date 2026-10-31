'use client';

import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface SelectFormFieldOptions<TExtra = unknown> {
  value: string;
  label: string;
  extra?: TExtra;
}

export interface SelectFormFieldProps<
  TField extends FieldValues,
  TOption extends SelectFormFieldOptions = SelectFormFieldOptions,
> extends Omit<React.ComponentProps<'select'>, 'name' | 'onChange'> {
  control: Control<TField>;
  name: Path<TField>;
  options: TOption[];
  label?: string;
  description?: string;
  onValueChange?: (option: TOption) => void;
}

export const SelectFormField = <
  TField extends FieldValues,
  TOption extends SelectFormFieldOptions = SelectFormFieldOptions,
>({
  control,
  name,
  label,
  description,
  options,
  ...props
}: SelectFormFieldProps<TField, TOption>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        {label && <FieldLabel htmlFor={props.id}>{label}</FieldLabel>}
        <Select
          value={field.value}
          onValueChange={(value) => {
            field.onChange(value);

            const selected = options.find((o) => o.value === value);

            if (selected) {
              props.onValueChange?.(selected);
            }
          }}
          disabled={props.disabled}
        >
          <SelectTrigger id={props.id} className='w-full' aria-invalid={fieldState.invalid}>
            <SelectValue placeholder={props['aria-placeholder']} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description && <FieldDescription>{description}</FieldDescription>}
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
);
