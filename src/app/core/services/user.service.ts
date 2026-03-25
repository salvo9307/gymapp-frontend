import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserSummaryResponse, UserDetailResponse, UpdateUserStatusRequest, ResetUserPasswordRequest, CreateManagedUserRequest } from '../models/user.models';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  private readonly managerBaseUrl = `${environment.apiUrl}/manager/users`;
  private readonly adminBaseUrl = `${environment.apiUrl}/admin/users`;

  getUsersForManagement(): Observable<UserSummaryResponse[]> {
    return this.http.get<UserSummaryResponse[]>(this.managerBaseUrl);
  }

  getUserDetail(userId: number): Observable<UserDetailResponse> {
    return this.http.get<UserDetailResponse>(`${this.managerBaseUrl}/${userId}`);
  }

  updateUserStatus(userId: number, request: UpdateUserStatusRequest) {
    return this.http.put<void>(
      `${environment.apiUrl}/manager/users/${userId}/status`,
      request
    );
  }

  resetUserPassword(userId: number, request: ResetUserPasswordRequest) {
    return this.http.put<void>(
      `${environment.apiUrl}/manager/users/${userId}/reset-password`,
      request
    );
  }

  createUserForManager(request: CreateManagedUserRequest) {
    return this.http.post<UserDetailResponse>(
      `${environment.apiUrl}/manager/users`,
      request
    );
  }

  renewSubscription(userId: number, months: number) {
    return this.http.put<void>(
      `${this.managerBaseUrl}/${userId}/renew-subscription`,
      { months }
    );
  }
}