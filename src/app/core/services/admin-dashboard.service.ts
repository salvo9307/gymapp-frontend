import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/environment';
import { AdminDashboardResponse } from '../models/admin-dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private http = inject(HttpClient);

  getAdminDashboard() {
    return this.http.get<AdminDashboardResponse>(
      `${environment.apiUrl}/admin/dashboard`
    );
  }

  createGym(request: { name: string; city: string }) {
    return this.http.post<number>(
      `${environment.apiUrl}/admin/gyms`,
      request
    );
  }

  createGymWithManager(request: {
    gymName: string;
    city: string;
    managerFirstName: string;
    managerLastName: string;
    managerEmail: string;
    managerPassword: string;
  }) {
    return this.http.post<number>(
      `${environment.apiUrl}/admin/gyms/with-manager`,
      request
    );
  }

  updateGymStatus(gymId: number, active: boolean) {
    return this.http.put<void>(
      `${environment.apiUrl}/admin/gyms/${gymId}/status`,
      { active }
    );
  }

  resetGymManagerPassword(gymId: number, newPassword: string) {
    return this.http.put<void>(
      `${environment.apiUrl}/admin/gyms/${gymId}/manager/reset-password`,
      { newPassword }
    );
  }  

  renewGymSubscription(gymId: number, months: number) {
    return this.http.put(
      `${environment.apiUrl}/admin/gyms/${gymId}/renew-subscription`,
      { months }
    );
  }
}