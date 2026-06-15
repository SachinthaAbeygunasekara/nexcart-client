import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DashboardStats } from '../models/dashboard-stats.model';
import { MonthlySales } from '../models/monthly-sales.model';
import { TopProduct } from '../models/top-product.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private readonly http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/admin/dashboard/stats`);
  }

  getMonthlySales(): Observable<MonthlySales[]> {
    return this.http.get<MonthlySales[]>(`${this.apiUrl}/admin/reports/sales`);
  }

  getTopProducts(): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(`${this.apiUrl}/admin/reports/top-products`);
  }
}

