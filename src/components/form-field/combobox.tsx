'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { useDebouncedCallback } from '@/utils/hooks/use-debounce';

export interface ComboboxFormFieldOptions<TExtra = unknown> {
  value: string;
  label: string;
  extra?: TExtra;
}

export interface ComboboxFormFieldProps<
  TField extends FieldValues,
  TOption extends ComboboxFormFieldOptions = ComboboxFormFieldOptions,
> {
  control: Control<TField>;
  name: Path<TField>;
  options: TOption[];
  placeholder?: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  shouldFilter?: boolean;
  additionalDesc?: React.ReactNode;
  onSearchChange?: (e: string) => void;
  onChange?: (e: TOption) => void;
}

export const ComboboxFormField = <
  TField extends FieldValues,
  TOption extends ComboboxFormFieldOptions = ComboboxFormFieldOptions,
>({
  control,
  name,
  label,
  description,
  options,
  placeholder = 'Pilih opsi...',
  disabled,
  shouldFilter = true,
  onSearchChange,
  additionalDesc,
  ...props
}: ComboboxFormFieldProps<TField, TOption>) => {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleOnSearchChange = useDebouncedCallback((e: string) => {
    onSearchChange?.(e);
    setIsLoading(false);
  }, 500);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && <FieldLabel>{label}</FieldLabel>}
          <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                aria-expanded={open}
                className='w-full justify-between font-normal truncate'
                aria-invalid={fieldState.invalid}
                {...field}
                disabled={field.disabled || disabled}
              >
                {field.value ? options.find((option) => option.value === field.value)?.label : placeholder}
                <ChevronsUpDown className='opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-full p-0'>
              <Command shouldFilter={shouldFilter}>
                <CommandInput
                  placeholder={placeholder}
                  className='h-9'
                  onValueChange={(e) => {
                    setIsLoading(true);
                    handleOnSearchChange(e);
                  }}
                />
                <CommandList>
                  <CommandEmpty>{isLoading ? 'Memuat...' : 'Opsi tidak ditemukan.'}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option, index) => (
                      <CommandItem
                        key={`${option.value}-${index}`}
                        value={option.value}
                        onSelect={(currentValue) => {
                          field.onChange(currentValue === field.value ? '' : currentValue);
                          props?.onChange?.(option);
                          setOpen(false);
                        }}
                      >
                        {option.label}
                        <Check className={cn('ml-auto', field.value === option.value ? 'opacity-100' : 'opacity-0')} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
