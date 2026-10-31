import { getUtm } from './utm';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function pushDataLayer(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}

// campaign context attached to every event so a report can split behaviour by campaign
function getCampaignParams() {
  const { source, medium, campaign } = getUtm();

  return { campaign_source: source, campaign_medium: medium, campaign_name: campaign };
}

export interface ICtaClickParams {
  cta_id: string;
  cta_text: string;
  cta_destination: string;
}

// Fired from the click handler, never from render, so a re-render cannot duplicate it.
export function trackCtaClick(params: ICtaClickParams) {
  pushDataLayer('cta_click', { ...params, ...getCampaignParams() });
}

export interface IEcommerceItem {
  item_id: string;
  item_name: string;
  item_category: string;
  // the plan (Basic/Pro/Business)
  item_variant: string;
  price: number;
  quantity: number;
  discount?: number;
}

export interface IEcommercePayload {
  currency: 'IDR';
  value: number;
  items: IEcommerceItem[];
}

// GA4 asks for the previous ecommerce object to be cleared first, otherwise it leaks into the next event.
function pushEcommerce(event: 'view_item' | 'add_to_cart' | 'begin_checkout', ecommerce: IEcommercePayload) {
  pushDataLayer('', { ecommerce: null });
  pushDataLayer(event, { ecommerce, ...getCampaignParams() });
}

export function trackViewItem(ecommerce: IEcommercePayload) {
  pushEcommerce('view_item', ecommerce);
}

export function trackAddToCart(ecommerce: IEcommercePayload) {
  pushEcommerce('add_to_cart', ecommerce);
}

export function trackBeginCheckout(ecommerce: IEcommercePayload) {
  pushEcommerce('begin_checkout', ecommerce);
}
