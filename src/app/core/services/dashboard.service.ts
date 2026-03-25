import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ManagerDashboardResponse } from '../models/dashboard.models';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/manager`;

  getManagerDashboard(): Observable<ManagerDashboardResponse> {
    return this.http.get<ManagerDashboardResponse>(`${this.baseUrl}/dashboard`);
  }
}