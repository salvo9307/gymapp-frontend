import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { WorkoutService } from '../../../../core/services/workout.service';
import { ExerciseService } from '../../../../core/services/exercise.service';

import {
  CreateWorkoutPlanRequest,
  WorkoutDayRequest,
  WorkoutExerciseRequest,
  WorkoutPlanResponse
} from '../../../../core/models/workout.models';

import { ExerciseResponse } from '../../../../core/models/exercise.models';

type EditableExercise = {
  exerciseId: number | null;
  exerciseOrder: number;
  sets: number | null;
  reps: string;
};

type EditableDay = {
  dayOrder: number;
  title: string;
  exercises: EditableExercise[];
};

@Component({
  selector: 'app-create-workout-plan-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-workout-plan-page.component.html',
  styleUrl: './create-workout-plan-page.component.scss'
})
export class CreateWorkoutPlanPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private exerciseService = inject(ExerciseService);

  userId = signal<number | null>(null);
  workoutPlanId = signal<number | null>(null);

  isLoading = signal(false);
  isSaving = signal(false);
  isEditMode = signal(false);

  errorMessage = signal('');
  successMessage = signal('');
  formErrorMessage = signal('');
  exercises = signal<ExerciseResponse[]>([]);

  title = '';
  days: EditableDay[] = [];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || Number.isNaN(id)) {
      this.errorMessage.set('ID utente non valido');
      return;
    }

    this.userId.set(id);
    this.isEditMode.set(this.router.url.endsWith('/edit'));

    if (this.isEditMode()) {
      this.loadExercisesAndWorkoutPlan(id);
    } else {
      this.loadExercises();
      this.addDay();
    }
  }

  loadExercises(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.formErrorMessage.set('');

    this.exerciseService.getExercises().subscribe({
      next: response => {
        this.exercises.set(response);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('LOAD EXERCISES ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nel caricamento esercizi');
        this.isLoading.set(false);
      }
    });
  }

  loadExercisesAndWorkoutPlan(userId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.formErrorMessage.set('');

    forkJoin({
      exercises: this.exerciseService.getExercises(),
      workoutPlan: this.workoutService.getUserWorkoutPlan(userId)
    }).subscribe({
      next: ({ exercises, workoutPlan }) => {
        this.exercises.set(exercises);
        this.fillFormFromWorkoutPlan(workoutPlan, exercises);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('LOAD EDIT DATA ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nel caricamento della scheda');
        this.isLoading.set(false);
      }
    });
  }

  fillFormFromWorkoutPlan(
    workoutPlan: WorkoutPlanResponse,
    availableExercises: ExerciseResponse[]
  ): void {
    this.workoutPlanId.set(workoutPlan.id);
    this.title = workoutPlan.title;

    this.days = workoutPlan.days.map(day => ({
      dayOrder: day.dayOrder,
      title: day.title,
      exercises: day.exercises.map(exercise => {
        const resolvedExerciseId =
          exercise.exerciseId ??
          availableExercises.find(
            e => e.name.trim().toLowerCase() === exercise.exerciseName.trim().toLowerCase()
          )?.id ??
          null;

        return {
          exerciseId: resolvedExerciseId,
          exerciseOrder: exercise.exerciseOrder,
          sets: exercise.sets,
          reps: exercise.reps ?? ''
        };
      })
    }));

    if (this.days.length === 0) {
      this.addDay();
    }
  }

  addDay(): void {
    this.days.push({
      dayOrder: this.days.length + 1,
      title: '',
      exercises: []
    });
  }

  removeDay(index: number): void {
    this.days.splice(index, 1);
    this.recalculateDayOrders();
  }

  addExercise(day: EditableDay): void {
    day.exercises.push({
      exerciseId: null,
      exerciseOrder: day.exercises.length + 1,
      sets: null,
      reps: ''
    });
  }

  removeExercise(day: EditableDay, exerciseIndex: number): void {
    day.exercises.splice(exerciseIndex, 1);
    day.exercises.forEach((exercise, index) => {
      exercise.exerciseOrder = index + 1;
    });
  }

  recalculateDayOrders(): void {
    this.days.forEach((day, index) => {
      day.dayOrder = index + 1;
    });
  }

  buildRequest(): CreateWorkoutPlanRequest | null {
    const userId = this.userId();

    this.formErrorMessage.set('');
    this.errorMessage.set('');

    if (!userId) {
      this.formErrorMessage.set('Utente non valido');
      return null;
    }

    if (!this.title.trim()) {
      this.formErrorMessage.set('Inserisci il titolo della scheda');
      return null;
    }

    if (this.days.length === 0) {
      this.formErrorMessage.set('Aggiungi almeno una giornata');
      return null;
    }

    const invalidDay = this.days.find(day => !day.title.trim());
    if (invalidDay) {
      this.formErrorMessage.set('Ogni giornata deve avere un titolo');
      return null;
    }

    const invalidExercise = this.days.some(day =>
      day.exercises.some(ex => !ex.exerciseId)
    );

    if (invalidExercise) {
      this.formErrorMessage.set('Seleziona un esercizio valido per tutte le righe');
      return null;
    }

    return {
      userId,
      title: this.title.trim(),
      days: this.days.map((day): WorkoutDayRequest => ({
        dayOrder: day.dayOrder,
        title: day.title.trim(),
        exercises: day.exercises.map((exercise): WorkoutExerciseRequest => ({
          exerciseId: exercise.exerciseId!,
          exerciseOrder: exercise.exerciseOrder,
          sets: exercise.sets,
          reps: exercise.reps?.trim() || null
        }))
      }))
    };
  }

  saveWorkoutPlan(): void {
    const request = this.buildRequest();
    if (!request) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.formErrorMessage.set('');
    this.isSaving.set(true);

    if (this.isEditMode()) {
      const workoutPlanId = this.workoutPlanId();

      if (!workoutPlanId) {
        this.formErrorMessage.set('ID scheda non valido');
        this.isSaving.set(false);
        return;
      }

      this.workoutService.updateWorkoutPlan(workoutPlanId, request).subscribe({
        next: () => {
          this.successMessage.set('Scheda aggiornata con successo');
          this.isSaving.set(false);
          this.router.navigate(['/manager/users', request.userId, 'workout-plan']);
        },
        error: err => {
          console.error('UPDATE WORKOUT PLAN ERROR', err);
          this.errorMessage.set(err?.error?.message || 'Errore nell’aggiornamento della scheda');
          this.isSaving.set(false);
        }
      });

      return;
    }

    this.workoutService.createWorkoutPlan(request).subscribe({
      next: () => {
        this.successMessage.set('Scheda creata con successo');
        this.isSaving.set(false);
        this.router.navigate(['/manager/users', request.userId, 'workout-plan']);
      },
      error: err => {
        console.error('CREATE WORKOUT PLAN ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nel salvataggio della scheda');
        this.isSaving.set(false);
      }
    });
  }

  goBack(): void {
    const userId = this.userId();

    if (userId) {
      this.router.navigate(['/manager/users', userId]);
    } else {
      this.router.navigate(['/manager/users']);
    }
  }
}