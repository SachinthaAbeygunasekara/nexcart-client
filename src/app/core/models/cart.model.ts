import { CartItem } from './cart_item.model';


export interface Cart {
  items: CartItem[];
  total: number;
}
