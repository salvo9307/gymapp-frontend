import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { ManagerDashboardResponse } from '../../../../core/models/dashboard.models';

@Component({
  selector: 'app-manager-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-dashboard-page.component.html',
  styleUrl: './manager-dashboard-page.component.scss'
})
export class ManagerDashboardPageComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  dashboard: ManagerDashboardResponse | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getManagerDashboard().subscribe({
      next: response => {
        this.dashboard = response;
        this.isLoading = false;
      },
      error: err => {
        console.error('DASHBOARD ERROR', err);
        this.errorMessage = err?.error?.message || 'Errore nel caricamento della dashboard';
        this.isLoading = false;
      }
    });
  }

  hasExpiringUsers(): boolean {
    return !!this.dashboard?.expiringUsersCount && this.dashboard.expiringUsersCount > 0;
  }

  hasExpiredUsers(): boolean {
    return !!this.dashboard?.expiredUsersCount && this.dashboard.expiredUsersCount > 0;
  }

  getExpiringUsersLabel(): string {
    const count = this.dashboard?.expiringUsersCount ?? 0;
    return count === 1 ? 'utente in scadenza' : 'utenti in scadenza';
  }

  getExpiredUsersLabel(): string {
    const count = this.dashboard?.expiredUsersCount ?? 0;
    return count === 1 ? 'utente scaduto' : 'utenti scaduti';
  }
}