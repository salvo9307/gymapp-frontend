import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../../../core/services/workout.service';
import { WorkoutPlanResponse } from '../../../../core/models/workout.models';

@Component({
  selector: 'app-user-workout-plan-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-workout-plan-page.component.html',
  styleUrl: './user-workout-plan-page.component.scss'
})
export class UserWorkoutPlanPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);

  workoutPlan = signal<WorkoutPlanResponse | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  userId = signal<number | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || Number.isNaN(id)) {
      this.errorMessage.set('ID utente non valido');
      this.isLoading.set(false);
      return;
    }

    this.userId.set(id);
    this.loadWorkoutPlan(id);
  }

  loadWorkoutPlan(userId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.workoutService.getUserWorkoutPlan(userId).subscribe({
      next: response => {
        this.workoutPlan.set(response);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('WORKOUT PLAN ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nel caricamento della scheda');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    const userId = this.userId();
    if (userId) {
      this.router.navigate(['/manager/users', userId]);
      return;
    }

    this.router.navigate(['/manager/users']);
  }
}