import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateWorkoutPlanRequest, WorkoutPlanResponse } from '../models/workout.models';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private http = inject(HttpClient);
  private readonly managerBaseUrl = `${environment.apiUrl}/manager`;

  getUserWorkoutPlan(userId: number): Observable<WorkoutPlanResponse> {
    return this.http.get<WorkoutPlanResponse>(`${this.managerBaseUrl}/users/${userId}/workout-plan`);
  }

  createWorkoutPlan(request: CreateWorkoutPlanRequest): Observable<WorkoutPlanResponse> {
    return this.http.post<WorkoutPlanResponse>(`${this.managerBaseUrl}/workout-plans`, request);
  }

  updateWorkoutPlan(workoutPlanId: number, request: CreateWorkoutPlanRequest): Observable<WorkoutPlanResponse> {
    return this.http.put<WorkoutPlanResponse>(`${this.managerBaseUrl}/workout-plans/${workoutPlanId}`, request);
  }

  duplicateWorkoutPlan(workoutPlanId: number) {
    return this.http.post<WorkoutPlanResponse>(
        `${environment.apiUrl}/manager/workout-plans/${workoutPlanId}/duplicate`,
        {}
    );
    }
}