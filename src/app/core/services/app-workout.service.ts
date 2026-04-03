import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../enviroments/environment';
import {
  AppUpdateWeightRequest,
  AppWorkoutPlanResponse
} from '../models/app-workout.models';

interface ApiWorkoutExerciseResponse {
  workoutDayExerciseId: number;
  exerciseName: string;
  exerciseOrder: number;
  sets: number | null;
  reps: string | null;
  weight: number | null;
}

interface ApiWorkoutDayResponse {
  id: number;
  dayOrder: number;
  title: string;
  exercises: ApiWorkoutExerciseResponse[];
}

interface ApiWorkoutPlanResponse {
  id: number;
  title: string;
  days: ApiWorkoutDayResponse[];
  subscriptionEndDate?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AppWorkoutService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/user/me`;

  getMyWorkoutPlan() {
    return this.http
      .get<ApiWorkoutPlanResponse>(`${this.baseUrl}/workout-plan`)
      .pipe(
        map(response => this.mapWorkoutPlanResponse(response))
      );
  }

  updateExerciseWeight(workoutDayExerciseId: number, request: AppUpdateWeightRequest) {
    return this.http.put<void>(
      `${this.baseUrl}/exercises/${workoutDayExerciseId}/weight`,
      request
    );
  }

  private mapWorkoutPlanResponse(response: ApiWorkoutPlanResponse): AppWorkoutPlanResponse {
    return {
      id: response.id,
      title: response.title,
      subscriptionEndDate: response.subscriptionEndDate ?? null,
      days: response.days.map(day => ({
        id: day.id,
        dayOrder: day.dayOrder,
        title: day.title,
        exercises: day.exercises.map(exercise => ({
          id: exercise.workoutDayExerciseId,
          exerciseName: exercise.exerciseName,
          exerciseOrder: exercise.exerciseOrder,
          sets: exercise.sets,
          reps: exercise.reps,
          lastWeight: exercise.weight
        }))
      }))
    };
  }
}