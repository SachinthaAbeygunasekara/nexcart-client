import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: CartItem[] = [];
  private readonly cartSubject = new BehaviorSubject<CartItem[]>([]);

  constructor() {
    this.loadCartFromLocalStorage();
  }

  getCart(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  addToCart(product: any, quantity: number = 1): void {
    const existingItem = this.cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({ product, quantity });
    }

    this.saveCartToLocalStorage();
    this.cartSubject.next([...this.cart]);
  }

  removeFromCart(productId: number): void {
    this.cart = this.cart.filter((item) => item.product.id !== productId);
    this.saveCartToLocalStorage();
    this.cartSubject.next([...this.cart]);
  }

  updateQuantity(productId: number, quantity: number): void {
    const item = this.cart.find((item) => item.product.id === productId);
    if (item && quantity > 0) {
      item.quantity = quantity;
      this.saveCartToLocalStorage();
      this.cartSubject.next([...this.cart]);
    }
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  getCartCount(): number {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  clearCart(): void {
    this.cart = [];
    this.saveCartToLocalStorage();
    this.cartSubject.next([...this.cart]);
  }

  private saveCartToLocalStorage(): void {
    localStorage.setItem('nexcart_cart', JSON.stringify(this.cart));
  }

  private loadCartFromLocalStorage(): void {
    const savedCart = localStorage.getItem('nexcart_cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.cartSubject.next([...this.cart]);
    }
  }
}

