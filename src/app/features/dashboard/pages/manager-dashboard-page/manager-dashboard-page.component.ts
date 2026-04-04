import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { ManagerDashboardResponse } from '../../../../core/models/dashboard.models';

@Component({
  selector: 'app-manager-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-dashboard-page.component.html',
  styleUrls: ['./manager-dashboard-page.component.scss']
})
export class ManagerDashboardPageComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private platformId = inject(PLATFORM_ID);

  dashboard: ManagerDashboardResponse | null = null;
  isLoading = true;
  errorMessage = '';

  showSubscriptionPopup = false;
  showMaxUsersPopup = false;

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

        if (isPlatformBrowser(this.platformId)) {
          this.checkSubscriptionPopup();
          this.checkMaxUsersPopup();
        }
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

  hasReachedMaxUsers(): boolean {
    if (!this.dashboard || this.dashboard.maxUsers == null) {
      return false;
    }

    return this.dashboard.activeUsersCount >= this.dashboard.maxUsers;
  }

  getExpiringUsersLabel(): string {
    const count = this.dashboard?.expiringUsersCount ?? 0;
    return count === 1 ? 'utente in scadenza' : 'utenti in scadenza';
  }

  getExpiredUsersLabel(): string {
    const count = this.dashboard?.expiredUsersCount ?? 0;
    return count === 1 ? 'utente scaduto' : 'utenti scaduti';
  }

  closeSubscriptionPopup(): void {
    this.showSubscriptionPopup = false;
  }

  closeMaxUsersPopup(): void {
    this.showMaxUsersPopup = false;
  }

  getGymSubscriptionDaysLeft(): number | null {
    if (!this.dashboard?.subscriptionEndDate) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(this.dashboard.subscriptionEndDate);
    end.setHours(0, 0, 0, 0);

    const diffMs = end.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  getGymSubscriptionWarningMessage(): string {
    const daysLeft = this.getGymSubscriptionDaysLeft();

    if (daysLeft === null) {
      return '';
    }

    if (daysLeft < 0) {
      return 'L’abbonamento della palestra è scaduto.';
    }

    if (daysLeft === 0) {
      return 'L’abbonamento della palestra scade oggi.';
    }

    if (daysLeft === 1) {
      return 'L’abbonamento della palestra scade tra 1 giorno.';
    }

    return `L’abbonamento della palestra scade tra ${daysLeft} giorni.`;
  }

  getMaxUsersWarningMessage(): string {
    if (!this.dashboard || this.dashboard.maxUsers == null) {
      return '';
    }

    return `Hai raggiunto il numero massimo di utenti attivi previsto dal tuo pacchetto (${this.dashboard.maxUsers}). Non puoi aggiungere nuovi utenti finché non liberi posti o aumenti il limite.`;
  }

  private checkSubscriptionPopup(): void {
    const daysLeft = this.getGymSubscriptionDaysLeft();

    if (daysLeft === null || daysLeft > 7) {
      return;
    }

    const storageKey = this.getSubscriptionPopupStorageKey();
    const alreadyShown = sessionStorage.getItem(storageKey);

    if (!alreadyShown) {
      this.showSubscriptionPopup = true;
      sessionStorage.setItem(storageKey, 'true');
    }
  }

  private checkMaxUsersPopup(): void {
    if (!this.dashboard || this.dashboard.maxUsers == null) {
      return;
    }

    if (!this.hasReachedMaxUsers()) {
      return;
    }

    const storageKey = this.getMaxUsersPopupStorageKey();
    const alreadyShown = sessionStorage.getItem(storageKey);

    if (!alreadyShown) {
      this.showMaxUsersPopup = true;
      sessionStorage.setItem(storageKey, 'true');
    }
  }

  private getSubscriptionPopupStorageKey(): string {
    const endDate = this.dashboard?.subscriptionEndDate ?? 'none';
    return `manager-gym-subscription-popup-${endDate}`;
  }

  private getMaxUsersPopupStorageKey(): string {
    if (!this.dashboard) {
      return 'manager-max-users-popup';
    }

    return `manager-max-users-popup-${this.dashboard.gymId}-${this.dashboard.maxUsers}-${this.dashboard.activeUsersCount}`;
  }
}