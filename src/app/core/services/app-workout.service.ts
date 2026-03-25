import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/environment';
import {
  AppUpdateWeightRequest,
  AppWorkoutPlanResponse
} from '../models/app-workout.models';

@Injectable({
  providedIn: 'root'
})
export class AppWorkoutService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/app/me`;

  getMyWorkoutPlan() {
    return this.http.get<AppWorkoutPlanResponse>(`${this.baseUrl}/workout-plan`);
  }

  updateExerciseWeight(workoutDayExerciseId: number, request: AppUpdateWeightRequest) {
    return this.http.put<void>(
      `${this.baseUrl}/exercises/${workoutDayExerciseId}/weight`,
      request
    );
  }
}