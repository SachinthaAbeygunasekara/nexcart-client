import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  // Base path will be combined with /customer/payments/checkout/{orderId}
  private readonly baseUrl = `${environment.apiUrl}/customer/payments`;

  constructor(private readonly http: HttpClient, private readonly authService: AuthService) {}

  /**
   * Create a checkout session for an existing order.
   * The backend expects: POST /customer/payments/checkout/{orderId}
   * No request body is sent. JWT must be provided in Authorization header.
   */
  createCheckoutSession(orderId: number): Observable<CheckoutSessionResponse> {
    const token = this.authService.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    // POST without a body (null) because backend only accepts path variable
    return this.http.post<CheckoutSessionResponse>(
      `${this.baseUrl}/checkout/${orderId}`,
      null,
      { headers }
    );
  }
}


