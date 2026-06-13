import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Cart } from '../models/cart.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/customer/cart`;

  // BehaviorSubject to broadcast cart updates across the app
  private readonly cartSubject = new BehaviorSubject<Cart>({ items: [], total: 0 });
  readonly cart$ = this.cartSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  getCart(): Observable<Cart> {
    // Fetch cart from server and update the internal subject so all subscribers get updated
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap((cart) => {
        this.cartSubject.next(cart || { items: [], total: 0 });
      }),
    );
  }

  addToCart(productId: number, quantity: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/items`, {
      productId,
      quantity,
    }).pipe(
      tap(() => {
        // refresh cart after successful mutation
        this.getCart().subscribe({});
      }),
    );
  }

  updateQuantity(cartItemId: number, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/items/${cartItemId}?quantity=${quantity}`, {}).pipe(
      tap(() => this.getCart().subscribe({})),
    );
  }

  removeFromCart(cartItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${cartItemId}`).pipe(
      tap(() => this.getCart().subscribe({})),
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => this.getCart().subscribe({})),
    );
  }
}
