import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private readonly httpClient: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(`${this.apiUrl}/products`);
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.httpClient.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  // getProductsByCategory(category: string): Observable<Product[]> {
  //   return of(this.mockProducts.filter((p) => p.category === category));
  // }

  // searchProducts(query: string): Observable<Product[]> {
  //   return of(
  //     this.mockProducts.filter(
  //       (p) =>
  //         p.name.toLowerCase().includes(query.toLowerCase()) ||
  //         p.description.toLowerCase().includes(query.toLowerCase()),
  //     ),
  //   );
  // }

  createProduct(product: Product): Observable<Product> {
    return this.httpClient.post<Product>(`${this.apiUrl}/admin/products`, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.httpClient.put<Product>(`${this.apiUrl}/admin/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/admin/products/${id}`);
  }
}
