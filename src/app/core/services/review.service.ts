import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';
import { ProductRating } from '../models/product-rating.model';
import { CreateReviewRequest } from '../models/create-review-request.model';
import { UpdateReviewRequest } from '../models/update-review-request.model';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly apiUrl = environment.apiUrl;
  constructor(private readonly http: HttpClient) {}
  getProductReviews(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${ this.apiUrl}/products/${ productId}/reviews`);
  }
  getProductRating(productId: number): Observable<ProductRating> {
    return this.http.get<ProductRating>(`${ this.apiUrl}/products/${ productId}/rating`);
  }
  addReview(productId: number, data: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${ this.apiUrl}/customer/products/${ productId}/reviews`, data);
  }
  updateReview(reviewId: number, data: UpdateReviewRequest): Observable<Review> {
    return this.http.put<Review>(`${ this.apiUrl}/customer/reviews/${ reviewId}`, data);
  }
  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${ this.apiUrl}/customer/reviews/${ reviewId}`);
  }
  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${ this.apiUrl}/admin/reviews`);
  }
  deleteReviewByAdmin(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${ this.apiUrl}/admin/reviews/${ reviewId}`);
  }
}