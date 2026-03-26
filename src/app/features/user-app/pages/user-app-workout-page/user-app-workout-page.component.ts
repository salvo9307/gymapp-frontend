import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppWorkoutService } from '../../../../core/services/app-workout.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  AppWorkoutDayResponse,
  AppWorkoutExerciseResponse,
  AppWorkoutPlanResponse
} from '../../../../core/models/app-workout.models';

@Component({
  selector: 'app-user-app-workout-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-app-workout-page.component.html',
  styleUrl: './user-app-workout-page.component.scss'
})
export class UserAppWorkoutPageComponent implements OnInit {
  private appWorkoutService = inject(AppWorkoutService);
  private authService = inject(AuthService);
  private router = inject(Router);

  workoutPlan = signal<AppWorkoutPlanResponse | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  saveStatus = signal('Pronto');
  selectedDay = signal<number | null>(null);

  currentDay = computed(() => {
    const plan = this.workoutPlan();
    const dayOrder = this.selectedDay();

    if (!plan || dayOrder === null) {
      return null;
    }

    return plan.days.find(day => day.dayOrder === dayOrder) ?? null;
  });

  ngOnInit(): void {
    this.loadWorkoutPlan();
  }

  loadWorkoutPlan(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.appWorkoutService.getMyWorkoutPlan().subscribe({
      next: response => {
        this.workoutPlan.set(response);
        this.selectedDay.set(response.days[0]?.dayOrder ?? null);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('APP WORKOUT ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nel caricamento della scheda');
        this.isLoading.set(false);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/app/login']);
  }

  showDay(dayOrder: number): void {
    this.selectedDay.set(dayOrder);
  }

  onWeightChange(exercise: AppWorkoutExerciseResponse, rawValue: string): void {
    const trimmed = rawValue.trim();
    const weight = trimmed === '' ? null : Number(trimmed);

    if (trimmed !== '' && Number.isNaN(weight)) {
      return;
    }

    this.updateLocalWeight(exercise.id, weight);
    this.saveStatus.set('Salvataggio...');

    this.appWorkoutService.updateExerciseWeight(exercise.id, { weight }).subscribe({
      next: () => {
        this.saveStatus.set('Salvato');
        setTimeout(() => this.saveStatus.set('Pronto'), 1400);
      },
      error: err => {
        console.error('UPDATE WEIGHT ERROR', err);
        this.saveStatus.set('Errore salvataggio');
        setTimeout(() => this.saveStatus.set('Pronto'), 2000);
      }
    });
  }

  resetWeightsForCurrentDay(): void {
    const day = this.currentDay();
    if (!day) return;

    day.exercises.forEach(exercise => {
      this.onWeightChange(exercise, '');
    });
  }

  trackDay(_: number, day: AppWorkoutDayResponse): number {
    return day.id;
  }

  trackExercise(_: number, exercise: AppWorkoutExerciseResponse): number {
    return exercise.id;
  }

  private updateLocalWeight(exerciseId: number, weight: number | null): void {
    const plan = this.workoutPlan();
    if (!plan) return;

    this.workoutPlan.set({
      ...plan,
      days: plan.days.map(day => ({
        ...day,
        exercises: day.exercises.map(exercise =>
          exercise.id === exerciseId
            ? { ...exercise, lastWeight: weight }
            : exercise
        )
      }))
    });
  }
}