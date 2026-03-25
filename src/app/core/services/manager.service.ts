import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdminDashboardResponse } from '../models/admin-dashboard.models';
import { environment } from '../../../enviroments/environment';

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

  updateGymStatus(gymId: number, active: boolean) {
    return this.http.put<void>(
      `${environment.apiUrl}/admin/gyms/${gymId}/status`,
      { active }
    );
  }
}