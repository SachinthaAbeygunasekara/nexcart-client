import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cart } from '../models/cart.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/customer/cart`;

  constructor(private readonly http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl);
  }

  addToCart(productId: number, quantity: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/items`, {
      productId,
      quantity,
    });
  }

  updateQuantity(cartItemId: number, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/items/${cartItemId}?quantity=${quantity}`, {});
  }

  removeFromCart(cartItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${cartItemId}`);
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}
