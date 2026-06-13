import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CheckoutRequest, Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private readonly http: HttpClient) {}

  checkout(request: CheckoutRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/customer/orders/checkout`, request);
  }

  getCustomerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/customer/orders`);
  }

  getMyOrders(): Observable<Order[]> {
    return this.getCustomerOrders();
  }

  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<Order>(
      `${this.apiUrl}/admin/orders/${orderId}/status?status=${status}`,
      {},
    );
  }

  updateStatus(orderId: number, status: string): Observable<Order> {
    return this.updateOrderStatus(orderId, status);
  }

  getOrders(filters: { orderId?: number; status?: string; date?: string }) {
    let params = new HttpParams();

    if (filters.orderId) {
      params = params.set('orderId', filters.orderId);
    }

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    if (filters.date) {
      params = params.set('date', filters.date);
    }

    return this.http.get<Order[]>(`${environment.apiUrl}/admin/orders`, { params });
  }
}
