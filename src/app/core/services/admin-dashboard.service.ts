import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminDashboardResponse,
  RenewGymSubscriptionRequest,
  UpdateGymMaxUsersRequest
} from '../models/admin-dashboard.models';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private http = inject(HttpClient);

  private readonly adminBaseUrl = `${environment.apiUrl}/admin`;
  private readonly gymsBaseUrl = `${environment.apiUrl}/admin/gyms`;

  getAdminDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${this.adminBaseUrl}/dashboard`);
  }

  createGymWithManager(payload: {
    gymName: string;
    city: string;
    managerFirstName: string;
    managerLastName: string;
    managerEmail: string;
    managerPassword: string;
    maxUsers?: number | null;
  }): Observable<number> {
    return this.http.post<number>(`${this.gymsBaseUrl}/with-manager`, payload);
  }

  updateGymStatus(gymId: number, active: boolean): Observable<void> {
    return this.http.put<void>(`${this.gymsBaseUrl}/${gymId}/status`, { active });
  }

  resetGymManagerPassword(gymId: number, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.gymsBaseUrl}/${gymId}/manager/reset-password`, {
      newPassword
    });
  }

  renewGymSubscription(gymId: number, request: RenewGymSubscriptionRequest): Observable<void> {
    return this.http.put<void>(`${this.gymsBaseUrl}/${gymId}/renew-subscription`, request);
  }

  updateGymMaxUsers(gymId: number, request: UpdateGymMaxUsersRequest): Observable<void> {
    return this.http.put<void>(`${this.gymsBaseUrl}/${gymId}/max-users`, request);
  }
}