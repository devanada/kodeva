export type ProductCategory = 'kasir' | 'hr' | 'addon';

export type PlanId = 'basic' | 'pro' | 'business';

export interface IProductPlan {
  id: PlanId;
  name: string;
  // monthly price per license in IDR
  price: number;
}

export interface IProductPromo {
  quota: number;
  discountPercent: number;
}

export interface IProduct {
  slug: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  // short captions shown as feature screenshots on the detail page
  features: string[];
  plans: IProductPlan[];
  promo?: IProductPromo;
}
