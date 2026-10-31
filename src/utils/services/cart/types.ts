import { PlanId } from '../products/types';

export interface ICartLine {
  productSlug: string;
  planId: PlanId;
  // number of licenses (users/outlets)
  quantity: number;
}

export interface ICartTotals {
  // sum of regular prices
  original: number;
  // sum of prices after promo
  subtotal: number;
  savings: number;
  licenses: number;
}

export interface ICartIssue {
  productSlug: string;
  planId?: PlanId;
  message: string;
}
