import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CustomerProfile } from '../models/customer-profile.model';
import { UpdateProfileRequest } from '../models/update-profile-request.model';
import { ChangePasswordRequest } from '../models/change-password-request.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = `${environment.apiUrl}/customer/profile`;

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(this.apiUrl);
  }

  updateProfile(request: UpdateProfileRequest): Observable<CustomerProfile> {
    return this.http.put<CustomerProfile>(this.apiUrl, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/password`, request);
  }
}
