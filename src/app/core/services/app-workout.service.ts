import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment';
import {
  AppWorkoutPlanResponse,
  AppWorkoutDayResponse,
  AppWorkoutExerciseResponse
} from '../models/app-workout.models';

@Injectable({
  providedIn: 'root'
})
export class AppWorkoutService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/user/me`;

  getMyWorkoutPlan(): Observable<AppWorkoutPlanResponse> {
    return this.http.get<any>(`${this.baseUrl}/workout-plan`).pipe(
      map(response => ({
        id: response.id,
        title: response.title,
        subscriptionEndDate: response.subscriptionEndDate ?? null,
        days: (response.days ?? []).map((day: any): AppWorkoutDayResponse => ({
          id: day.id,
          dayOrder: day.dayOrder,
          title: day.title,
          exercises: (day.exercises ?? []).map(
            (exercise: any): AppWorkoutExerciseResponse => ({
              id: exercise.workoutDayExerciseId ?? exercise.id,
              exerciseName: exercise.exerciseName,
              exerciseOrder: exercise.exerciseOrder,
              sets: exercise.sets ?? null,
              reps: exercise.reps ?? null,
              restSeconds: exercise.restSeconds ?? null,
              lastWeight: exercise.weight ?? exercise.lastWeight ?? null
            })
          )
        }))
      }))
    );
  }

  updateExerciseWeight(
    workoutDayExerciseId: number,
    request: { weight: number | null }
  ): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/exercises/${workoutDayExerciseId}/weight`,
      request
    );
  }
}