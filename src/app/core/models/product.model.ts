import { Category } from './category.model';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category?: Category;
  quantity: number;
  status: 'ACTIVE' | 'INACTIVE';
  averageRating?: number;
  totalReviews?: number;
}
