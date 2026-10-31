'use client';

import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  label: string;
  onChange: (value: number) => void;
}

// 44px targets so it is comfortable to tap on a phone
function QuantityStepper({ value, min = 1, max, label, onChange }: QuantityStepperProps) {
  return (
    <div role='group' aria-label={label} className='flex items-center gap-1'>
      <Button
        type='button'
        variant='outline'
        className='size-11'
        aria-label='Kurangi'
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus />
      </Button>
      <span aria-live='polite' className='min-w-10 text-center text-base font-medium tabular-nums'>
        {value}
      </span>
      <Button
        type='button'
        variant='outline'
        className='size-11'
        aria-label='Tambah'
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}

export { QuantityStepper };
