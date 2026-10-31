import { PlanId, ProductCategory } from '@/utils/services/products/types';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  kasir: 'Kasir',
  hr: 'HR & Payroll',
  addon: 'Add-on',
};

export const PLAN_DESCRIPTIONS: Record<PlanId, string> = {
  basic: 'Untuk usaha yang baru mulai',
  pro: 'Untuk usaha yang sedang berkembang',
  business: 'Untuk banyak cabang dan tim besar',
};
