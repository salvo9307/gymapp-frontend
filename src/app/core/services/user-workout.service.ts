import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/environment';
import {
  UpdateExerciseWeightRequest,
  UserWorkoutPlanResponse
} from '../models/user-workout.models';

@Injectable({
  providedIn: 'root'
})
export class UserWorkoutService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/user/workout-plan`;

  getMyWorkoutPlan() {
    return this.http.get<UserWorkoutPlanResponse>(this.baseUrl);
  }

  updateExerciseWeight(exerciseRowId: number, request: UpdateExerciseWeightRequest) {
    return this.http.put<void>(
      `${this.baseUrl}/exercises/${exerciseRowId}/weight`,
      request
    );
  }
}