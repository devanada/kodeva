import type { PortableTextProps } from '@portabletext/react';

export interface ICmsImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface ICmsTestimonial {
  _id: string;
  name: string;
  role?: string | null;
  business?: string | null;
  quote: string;
}

export interface ICmsFaq {
  _id: string;
  question: string;
  answer: string;
}

export interface ICmsLanding {
  hero?: {
    title?: string | null;
    subtitle?: string | null;
    ctaLabel?: string | null;
    image?: ICmsImage | null;
  } | null;
  // product slugs from the marketplace catalog
  featuredProducts: string[];
  testimonials: ICmsTestimonial[];
  faqs: ICmsFaq[];
}

export interface ICmsCategory {
  title: string;
  slug: string;
}

export interface ICmsPostSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  _createdAt: string;
  _updatedAt: string;
  cover?: ICmsImage | null;
  category?: ICmsCategory | null;
}

export interface ICmsPost extends ICmsPostSummary {
  // product slugs from the marketplace catalog
  relatedProducts: string[];
  body?: PortableTextProps['value'] | null;
}

export interface IPostsPage {
  docs: ICmsPostSummary[];
  page: number;
  totalPages: number;
  totalDocs: number;
}
