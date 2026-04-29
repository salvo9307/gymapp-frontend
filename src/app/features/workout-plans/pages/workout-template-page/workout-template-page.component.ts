import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WorkoutService } from '../../../../core/services/workout.service';
import { ExerciseService } from '../../../../core/services/exercise.service';
import {
  CreateWorkoutPlanRequest,
  WorkoutDayRequest,
  WorkoutExerciseRequest,
  WorkoutTemplateResponse,
  WorkoutTemplateSummaryResponse
} from '../../../../core/models/workout.models';
import { ExerciseResponse } from '../../../../core/models/exercise.models';
import { LoadingSpinnerComponent } from '../../../../core/loading/loading-spinner.component';

type EditableExercise = {
  exerciseId: number | null;
  exerciseOrder: number;
  sets: number | null;
  reps: string;
  restSeconds: number | null;
};

type EditableDay = {
  dayOrder: number;
  title: string;
  exercises: EditableExercise[];
};

@Component({
  selector: 'app-workout-template-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './workout-template-page.component.html',
  styleUrl: './workout-template-page.component.scss'
})
export class WorkoutTemplatePageComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private exerciseService = inject(ExerciseService);

  isLoading = signal(false);
  isSaving = signal(false);
  isDeleting = signal(false);
  editingTemplateId = signal<number | null>(null);

  errorMessage = signal('');
  successMessage = signal('');
  formErrorMessage = signal('');

  templates = signal<WorkoutTemplateSummaryResponse[]>([]);
  exercises = signal<ExerciseResponse[]>([]);

  title = '';
  days: EditableDay[] = [];

  ngOnInit(): void {
    this.loadInitialData();
    this.addDay();
  }

  loadInitialData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.exerciseService.getExercises().subscribe({
      next: exercises => {
        this.exercises.set(exercises);
        this.loadTemplates();
      },
      error: err => {
        console.error('LOAD EXERCISES ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nel caricamento esercizi');
        this.isLoading.set(false);
      }
    });
  }

  loadTemplates(): void {
    this.workoutService.getWorkoutTemplates().subscribe({
      next: templates => {
        this.templates.set(templates);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('LOAD TEMPLATES ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nel caricamento template');
        this.isLoading.set(false);
      }
    });
  }

  editTemplate(templateId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.formErrorMessage.set('');

    this.workoutService.getWorkoutTemplate(templateId).subscribe({
      next: template => {
        this.fillFormFromTemplate(template);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('GET TEMPLATE ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nel caricamento del template');
        this.isLoading.set(false);
      }
    });
  }

  fillFormFromTemplate(template: WorkoutTemplateResponse): void {
    this.editingTemplateId.set(template.id);
    this.title = template.title;

    this.days = template.days.map(day => ({
      dayOrder: day.dayOrder,
      title: day.title,
      exercises: day.exercises.map(exercise => ({
        exerciseId: exercise.exerciseId,
        exerciseOrder: exercise.exerciseOrder,
        sets: exercise.sets,
        reps: exercise.reps ?? '',
        restSeconds: exercise.restSeconds ?? null
      }))
    }));

    if (this.days.length === 0) {
      this.addDay();
    }
  }

  deleteTemplate(templateId: number): void {
    const confirmed = confirm('Vuoi eliminare questo template?');

    if (!confirmed || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.formErrorMessage.set('');

    this.workoutService.deleteWorkoutTemplate(templateId).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.successMessage.set('Template eliminato con successo');

        if (this.editingTemplateId() === templateId) {
          this.resetForm();
        }

        this.loadTemplates();
      },
      error: err => {
        console.error('DELETE TEMPLATE ERROR', err);
        this.isDeleting.set(false);
        this.errorMessage.set(err?.error?.message || 'Errore durante l’eliminazione del template');
      }
    });
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

    if (this.days.length === 0) {
      this.addDay();
    }
  }

  addExercise(day: EditableDay): void {
    day.exercises.push({
      exerciseId: null,
      exerciseOrder: day.exercises.length + 1,
      sets: null,
      reps: '',
      restSeconds: null
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

  saveTemplate(): void {
    const request = this.buildRequest();
    if (!request) return;

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.formErrorMessage.set('');

    const editingId = this.editingTemplateId();

    if (editingId) {
      this.workoutService.updateWorkoutTemplate(editingId, request).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.successMessage.set('Template aggiornato con successo');
          this.resetForm();
          this.loadTemplates();
        },
        error: err => {
          console.error('UPDATE TEMPLATE ERROR', err);
          this.isSaving.set(false);
          this.errorMessage.set(err?.error?.message || 'Errore durante la modifica del template');
        }
      });

      return;
    }

    this.workoutService.createWorkoutTemplate(request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Template creato con successo');
        this.resetForm();
        this.loadTemplates();
      },
      error: err => {
        console.error('CREATE TEMPLATE ERROR', err);
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'Errore durante la creazione del template');
      }
    });
  }

  resetForm(): void {
    this.editingTemplateId.set(null);
    this.title = '';
    this.days = [];
    this.addDay();
    this.formErrorMessage.set('');
  }

  buildRequest(): CreateWorkoutPlanRequest | null {
    this.formErrorMessage.set('');

    if (!this.title.trim()) {
      this.formErrorMessage.set('Inserisci il titolo del template');
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

    const emptyDay = this.days.find(day => day.exercises.length === 0);
    if (emptyDay) {
      this.formErrorMessage.set('Ogni giornata deve contenere almeno un esercizio');
      return null;
    }

    const invalidExercise = this.days.some(day =>
      day.exercises.some(ex =>
        !ex.exerciseId ||
        !ex.sets ||
        !ex.reps?.trim()
      )
    );

    if (invalidExercise) {
      this.formErrorMessage.set('Compila esercizio, serie e ripetizioni per tutte le righe');
      return null;
    }

    return {
      userId: 0,
      title: this.title.trim(),
      days: this.days.map((day): WorkoutDayRequest => ({
        dayOrder: day.dayOrder,
        title: day.title.trim(),
        exercises: day.exercises.map((exercise): WorkoutExerciseRequest => ({
          exerciseId: exercise.exerciseId!,
          exerciseOrder: exercise.exerciseOrder,
          sets: exercise.sets!,
          reps: exercise.reps.trim(),
          restSeconds: exercise.restSeconds
        }))
      }))
    };
  }
}