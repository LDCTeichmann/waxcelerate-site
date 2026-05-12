export interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'wax' | 'chain' | 'bundle' | 'accessory';
  specs: {
    weight?: string;
    compatibility?: string[];
    cycles?: string;
  };
  inStock: boolean;
  badge?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  content: string;
  contentEn: string;
  avatar: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
  category: string;
}

export interface GuideStep {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  image?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  date: string;
  image: string;
  category: string;
}

export interface Deal {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  discount: number;
  endDate: Date;
  products: string[];
}

export type Language = 'de' | 'en';

export interface QuizAnswer {
  speed: string;
  terrain: string;
  monthlyKm: string;
}

export interface CalculatorInput {
  monthlyKm: number;
  rainDays: number;
  chainCount: number;
}
