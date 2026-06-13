export interface CheckoutRequest {
  deliveryAddress: string;
  phoneNumber: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  deliveryAddress: string;
  phoneNumber: string;
  items: OrderItem[];
}
