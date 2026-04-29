import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateWorkoutPlanRequest,
  WorkoutPlanResponse,
  WorkoutTemplateResponse,
  WorkoutTemplateSummaryResponse
} from '../models/workout.models';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private http = inject(HttpClient);
  private readonly managerBaseUrl = `${environment.apiUrl}/manager`;

  getUserWorkoutPlan(userId: number): Observable<WorkoutPlanResponse> {
    return this.http.get<WorkoutPlanResponse>(
      `${this.managerBaseUrl}/users/${userId}/workout-plan`
    );
  }

  createWorkoutPlan(request: CreateWorkoutPlanRequest): Observable<number> {
    return this.http.post<number>(
      `${this.managerBaseUrl}/workout-plans`,
      request
    );
  }

  updateWorkoutPlan(workoutPlanId: number, request: CreateWorkoutPlanRequest): Observable<number> {
    return this.http.put<number>(
      `${this.managerBaseUrl}/workout-plans/${workoutPlanId}`,
      request
    );
  }

  duplicateWorkoutPlan(workoutPlanId: number): Observable<WorkoutPlanResponse> {
    return this.http.post<WorkoutPlanResponse>(
      `${this.managerBaseUrl}/workout-plans/${workoutPlanId}/duplicate`,
      {}
    );
  }

  getWorkoutTemplates(): Observable<WorkoutTemplateSummaryResponse[]> {
    return this.http.get<WorkoutTemplateSummaryResponse[]>(
      `${this.managerBaseUrl}/templates`
    );
  }

  getWorkoutTemplate(templateId: number): Observable<WorkoutTemplateResponse> {
    return this.http.get<WorkoutTemplateResponse>(
      `${this.managerBaseUrl}/templates/${templateId}`
    );
  }

  createWorkoutTemplate(request: CreateWorkoutPlanRequest): Observable<number> {
    return this.http.post<number>(
      `${this.managerBaseUrl}/templates`,
      request
    );
  }

  updateWorkoutTemplate(templateId: number, request: CreateWorkoutPlanRequest): Observable<number> {
    return this.http.put<number>(
      `${this.managerBaseUrl}/templates/${templateId}`,
      request
    );
  }

  deleteWorkoutTemplate(templateId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.managerBaseUrl}/templates/${templateId}`
    );
  }

  applyWorkoutTemplate(templateId: number, userId: number): Observable<number> {
    return this.http.post<number>(
      `${this.managerBaseUrl}/templates/${templateId}/apply/${userId}`,
      {}
    );
  }
}