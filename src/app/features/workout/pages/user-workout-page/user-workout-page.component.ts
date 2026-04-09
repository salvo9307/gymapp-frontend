import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserWorkoutService } from '../../../../core/services/user-workout.service';
import { UserWorkoutDayResponse, UserWorkoutExerciseResponse, UserWorkoutPlanResponse} from '../../../../core/models/user-workout.models';
import { LoadingSpinnerComponent } from '../../../../core/loading/loading-spinner.component';

@Component({
  selector: 'app-user-workout-page',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './user-workout-page.component.html',
  styleUrl: './user-workout-page.component.scss'
})
export class UserWorkoutPageComponent implements OnInit {
  private userWorkoutService = inject(UserWorkoutService);

  workoutPlan = signal<UserWorkoutPlanResponse | null>(null);
  selectedDay = signal(1);
  isLoading = signal(true);
  errorMessage = signal('');
  saveStatus = signal('Pronto');

  currentDay = computed(() => {
    const plan = this.workoutPlan();
    if (!plan) return null;

    return plan.days.find(day => day.dayNumber === this.selectedDay()) ?? null;
  });

  ngOnInit(): void {
    this.loadWorkoutPlan();
  }

  loadWorkoutPlan(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userWorkoutService.getMyWorkoutPlan().subscribe({
      next: response => {
        this.workoutPlan.set(response);
        this.selectedDay.set(response.days[0]?.dayNumber ?? 1);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('USER WORKOUT ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nel caricamento della scheda');
        this.isLoading.set(false);
      }
    });
  }

  showDay(dayNumber: number): void {
    this.selectedDay.set(dayNumber);
  }

  onWeightChange(exercise: UserWorkoutExerciseResponse, rawValue: string): void {
    const parsedWeight = rawValue.trim() === '' ? null : Number(rawValue);

    this.updateLocalWeight(exercise.id, parsedWeight);
    this.saveStatus.set('Salvataggio...');

    this.userWorkoutService.updateExerciseWeight(exercise.id, {
      weight: parsedWeight
    }).subscribe({
      next: () => {
        this.saveStatus.set('Salvato');
        setTimeout(() => this.saveStatus.set('Pronto'), 1500);
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

    for (const exercise of day.exercises) {
      this.onWeightChange(exercise, '');
    }
  }

  private updateLocalWeight(exerciseRowId: number, weight: number | null): void {
    const plan = this.workoutPlan();
    if (!plan) return;

    const updatedDays = plan.days.map(day => ({
      ...day,
      exercises: day.exercises.map(exercise =>
        exercise.id === exerciseRowId
          ? { ...exercise, weight }
          : exercise
      )
    }));

    this.workoutPlan.set({
      ...plan,
      days: updatedDays
    });
  }

  trackDay(_: number, day: UserWorkoutDayResponse): number {
    return day.dayNumber;
  }

  trackExercise(_: number, exercise: UserWorkoutExerciseResponse): number {
    return exercise.id;
  }
}