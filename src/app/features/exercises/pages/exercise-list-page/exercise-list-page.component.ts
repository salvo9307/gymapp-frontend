import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExerciseService } from '../../../../core/services/exercise.service';
import {
  CreateExerciseRequest,
  ExerciseResponse,
  UpdateExerciseRequest
} from '../../../../core/models/exercise.models';
import { LoadingSpinnerComponent } from '../../../../core/loading/loading-spinner.component';

@Component({
  selector: 'app-exercise-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './exercise-list-page.component.html',
  styleUrl: './exercise-list-page.component.scss'
})
export class ExerciseListPageComponent implements OnInit {
  private exerciseService = inject(ExerciseService);

  exercises = signal<ExerciseResponse[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');

  searchTerm = '';
  newExerciseName = '';

  editingExerciseId: number | null = null;
  editingExerciseName = '';

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(name?: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.exerciseService.getExercises(name).subscribe({
      next: response => {
        this.exercises.set(response);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('EXERCISES ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nel caricamento esercizi');
        this.isLoading.set(false);
      }
    });
  }

  searchExercises(): void {
    this.loadExercises(this.searchTerm);
  }

  resetSearch(): void {
    this.searchTerm = '';
    this.loadExercises();
  }

  createExercise(): void {
    const name = this.newExerciseName.trim();

    if (!name) {
      this.errorMessage.set('Inserisci un nome esercizio');
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    const request: CreateExerciseRequest = { name };

    this.exerciseService.createExercise(request).subscribe({
      next: () => {
        this.newExerciseName = '';
        this.successMessage.set('Esercizio creato con successo');
        this.loadExercises(this.searchTerm);
      },
      error: err => {
        console.error('CREATE EXERCISE ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nella creazione esercizio');
      }
    });
  }

  startEdit(exercise: ExerciseResponse): void {
    this.editingExerciseId = exercise.id;
    this.editingExerciseName = exercise.name;
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  cancelEdit(): void {
    this.editingExerciseId = null;
    this.editingExerciseName = '';
  }

  saveEdit(exerciseId: number): void {
    const name = this.editingExerciseName.trim();

    if (!name) {
      this.errorMessage.set('Il nome esercizio non può essere vuoto');
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    const request: UpdateExerciseRequest = { name };

    this.exerciseService.updateExercise(exerciseId, request).subscribe({
      next: () => {
        this.successMessage.set('Esercizio aggiornato con successo');
        this.editingExerciseId = null;
        this.editingExerciseName = '';
        this.loadExercises(this.searchTerm);
      },
      error: err => {
        console.error('UPDATE EXERCISE ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nell’aggiornamento esercizio');
      }
    });
  }

  deleteExercise(exercise: ExerciseResponse): void {
    const confirmed = window.confirm(`Vuoi eliminare l'esercizio "${exercise.name}"?`);
    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.exerciseService.deleteExercise(exercise.id).subscribe({
      next: () => {
        this.successMessage.set('Esercizio eliminato con successo');
        this.loadExercises(this.searchTerm);
      },
      error: err => {
        console.error('DELETE EXERCISE ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nell’eliminazione esercizio');
      }
    });
  }
}