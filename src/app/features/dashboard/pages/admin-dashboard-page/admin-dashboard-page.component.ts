import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService } from '../../../../core/services/admin-dashboard.service';
import {
  AdminDashboardResponse,
  AdminDashboardGymResponse
} from '../../../../core/models/admin-dashboard.models';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrls: ['./admin-dashboard-page.component.scss']
})
export class AdminDashboardPageComponent implements OnInit {
  private adminDashboardService = inject(AdminDashboardService);

  dashboard: AdminDashboardResponse | null = null;
  isLoading = true;
  errorMessage = '';

  showCreateGymPanel = false;
  isCreatingGym = false;
  createGymErrorMessage = '';
  createGymSuccessMessage = '';

  newGymName = '';
  newGymCity = '';
  newGymMaxUsers = '';
  newManagerFirstName = '';
  newManagerLastName = '';
  newManagerEmail = '';
  newManagerPassword = '';

  updatingGymId: number | null = null;

  openResetPasswordGymId: number | null = null;
  newManagerResetPassword = '';
  resetPasswordErrorMessage = '';
  resetPasswordSuccessMessage = '';
  isResettingManagerPassword = false;

  showRenewModal = false;
  renewGymId: number | null = null;
  renewGymName = '';
  selectedRenewMonths = 1;
  selectedRenewStartDate = '';
  renewErrorMessage = '';
  isRenewingGym = false;

  editingMaxUsersGymId: number | null = null;
  editingMaxUsersValue = '';
  maxUsersErrorMessage = '';
  maxUsersSuccessMessage = '';
  isSavingMaxUsers = false;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminDashboardService.getAdminDashboard().subscribe({
      next: response => {
        this.dashboard = response;
        this.isLoading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Errore nel caricamento dashboard';
        this.isLoading = false;
      }
    });
  }

  toggleCreateGymPanel(): void {
    this.showCreateGymPanel = !this.showCreateGymPanel;
    this.createGymErrorMessage = '';
    this.createGymSuccessMessage = '';

    if (!this.showCreateGymPanel) {
      this.resetCreateGymForm();
    }
  }

  resetCreateGymForm(): void {
    this.newGymName = '';
    this.newGymCity = '';
    this.newGymMaxUsers = '';
    this.newManagerFirstName = '';
    this.newManagerLastName = '';
    this.newManagerEmail = '';
    this.newManagerPassword = '';
  }

  submitCreateGym(): void {
    const parsedMaxUsers = this.parseMaxUsers(this.newGymMaxUsers);

    const payload = {
      gymName: this.newGymName.trim(),
      city: this.newGymCity.trim(),
      maxUsers: parsedMaxUsers,
      managerFirstName: this.newManagerFirstName.trim(),
      managerLastName: this.newManagerLastName.trim(),
      managerEmail: this.newManagerEmail.trim(),
      managerPassword: this.newManagerPassword.trim()
    };

    this.createGymErrorMessage = '';
    this.createGymSuccessMessage = '';

    if (!payload.gymName || !payload.managerFirstName || !payload.managerEmail || !payload.managerPassword) {
      this.createGymErrorMessage = 'Compila tutti i campi obbligatori';
      return;
    }

    if (payload.managerPassword.length < 6) {
      this.createGymErrorMessage = 'Password troppo corta';
      return;
    }

    if (this.newGymMaxUsers.trim() !== '' && parsedMaxUsers === null) {
      this.createGymErrorMessage = 'Il limite utenti deve essere un numero valido';
      return;
    }

    this.isCreatingGym = true;

    this.adminDashboardService.createGymWithManager(payload).subscribe({
      next: () => {
        this.isCreatingGym = false;
        this.createGymSuccessMessage = 'Palestra creata';
        this.showCreateGymPanel = false;
        this.resetCreateGymForm();
        this.loadDashboard();
      },
      error: err => {
        console.error(err);
        this.isCreatingGym = false;
        this.createGymErrorMessage = err?.error?.message || 'Errore creazione palestra';
      }
    });
  }

  toggleGymStatus(gym: AdminDashboardGymResponse): void {
    if (this.updatingGymId !== null) return;

    const newStatus = !gym.active;
    this.updatingGymId = gym.id;

    this.adminDashboardService.updateGymStatus(gym.id, newStatus).subscribe({
      next: () => {
        if (this.dashboard) {
          this.dashboard = {
            ...this.dashboard,
            gyms: this.dashboard.gyms.map(g =>
              g.id === gym.id ? { ...g, active: newStatus } : g
            )
          };
        }

        this.updatingGymId = null;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Errore aggiornamento stato';
        this.updatingGymId = null;
      }
    });
  }

  openRenewGymModal(gym: AdminDashboardGymResponse, months: number): void {
    this.renewErrorMessage = '';
    this.renewGymId = gym.id;
    this.renewGymName = gym.name;
    this.selectedRenewMonths = months;
    this.selectedRenewStartDate = this.getTodayDateString();
    this.showRenewModal = true;
  }

  closeRenewGymModal(): void {
    if (this.isRenewingGym) return;

    this.showRenewModal = false;
    this.renewGymId = null;
    this.renewGymName = '';
    this.selectedRenewMonths = 1;
    this.selectedRenewStartDate = '';
    this.renewErrorMessage = '';
  }

  confirmRenewGym(): void {
    if (!this.renewGymId) return;

    if (!this.selectedRenewStartDate) {
      this.renewErrorMessage = 'Seleziona una data di inizio';
      return;
    }

    if (!this.selectedRenewMonths || this.selectedRenewMonths <= 0) {
      this.renewErrorMessage = 'Seleziona una durata valida';
      return;
    }

    this.isRenewingGym = true;
    this.renewErrorMessage = '';

    this.adminDashboardService.renewGymSubscription(this.renewGymId, {
      months: this.selectedRenewMonths,
      startDate: this.selectedRenewStartDate
    }).subscribe({
      next: () => {
        this.isRenewingGym = false;
        this.closeRenewGymModal();
        this.loadDashboard();
      },
      error: err => {
        console.error(err);
        this.isRenewingGym = false;
        this.renewErrorMessage = err?.error?.message || 'Errore rinnovo palestra';
      }
    });
  }

  toggleResetManagerPasswordPanel(gymId: number): void {
    this.openResetPasswordGymId =
      this.openResetPasswordGymId === gymId ? null : gymId;

    this.newManagerResetPassword = '';
    this.resetPasswordErrorMessage = '';
    this.resetPasswordSuccessMessage = '';
  }

  submitResetManagerPassword(gym: AdminDashboardGymResponse): void {
    const password = this.newManagerResetPassword.trim();

    if (!gym.managerId) {
      this.resetPasswordErrorMessage = 'Nessun manager';
      return;
    }

    if (!password || password.length < 6) {
      this.resetPasswordErrorMessage = 'Password non valida';
      return;
    }

    this.isResettingManagerPassword = true;

    this.adminDashboardService
      .resetGymManagerPassword(gym.id, password)
      .subscribe({
        next: () => {
          this.isResettingManagerPassword = false;
          this.resetPasswordSuccessMessage = 'Password aggiornata';
          this.openResetPasswordGymId = null;
        },
        error: err => {
          console.error(err);
          this.isResettingManagerPassword = false;
          this.resetPasswordErrorMessage = 'Errore reset password';
        }
      });
  }

  startEditMaxUsers(gym: AdminDashboardGymResponse): void {
    this.editingMaxUsersGymId = gym.id;
    this.editingMaxUsersValue = gym.maxUsers != null ? String(gym.maxUsers) : '';
    this.maxUsersErrorMessage = '';
    this.maxUsersSuccessMessage = '';
  }

  cancelEditMaxUsers(): void {
    this.editingMaxUsersGymId = null;
    this.editingMaxUsersValue = '';
    this.maxUsersErrorMessage = '';
  }

  saveGymMaxUsers(gym: AdminDashboardGymResponse): void {
    const parsedMaxUsers = this.parseMaxUsers(this.editingMaxUsersValue);

    if (this.editingMaxUsersValue.trim() !== '' && parsedMaxUsers === null) {
      this.maxUsersErrorMessage = 'Inserisci un numero valido o lascia vuoto per illimitato';
      return;
    }

    this.isSavingMaxUsers = true;
    this.maxUsersErrorMessage = '';
    this.maxUsersSuccessMessage = '';

    this.adminDashboardService.updateGymMaxUsers(gym.id, {
      maxUsers: parsedMaxUsers
    }).subscribe({
      next: () => {
        this.isSavingMaxUsers = false;
        this.maxUsersSuccessMessage = 'Limite utenti aggiornato';
        this.editingMaxUsersGymId = null;
        this.editingMaxUsersValue = '';
        this.loadDashboard();
      },
      error: err => {
        console.error(err);
        this.isSavingMaxUsers = false;
        this.maxUsersErrorMessage = err?.error?.message || 'Errore aggiornamento limite utenti';
      }
    });
  }

  getMaxUsersLabel(gym: AdminDashboardGymResponse): string {
    return gym.maxUsers == null ? 'Illimitato' : String(gym.maxUsers);
  }

  getAvailableSlotsLabel(gym: AdminDashboardGymResponse): string {
    return gym.availableSlots == null ? '∞' : String(gym.availableSlots);
  }

  isGymExpiringSoon(endDate?: string | null): boolean {
    if (!endDate) return false;

    const end = new Date(endDate);
    const today = new Date();

    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const toleranceStart = new Date(today);
    toleranceStart.setDate(today.getDate() - 2);

    const warningEnd = new Date(today);
    warningEnd.setDate(today.getDate() + 5);

    return end >= toleranceStart && end <= warningEnd;
  }

  getGymStatusLabel(gym: AdminDashboardGymResponse): string {
    if (!gym.subscriptionEndDate) {
      return 'Nessun abbonamento';
    }

    if (!gym.active) {
      return 'Scaduta';
    }

    if (this.isGymExpiringSoon(gym.subscriptionEndDate)) {
      return 'In scadenza';
    }

    return 'Attiva';
  }

  getGymStatusClass(gym: AdminDashboardGymResponse): string {
    if (!gym.subscriptionEndDate) {
      return 'inactive';
    }

    if (this.isGymExpiringSoon(gym.subscriptionEndDate)) {
      return 'expiring';
    }

    if (!gym.active) {
      return 'inactive';
    }

    return 'active';
  }

  getRenewPreviewEndDate(): string {
    if (!this.selectedRenewStartDate || !this.selectedRenewMonths) {
      return '';
    }

    const date = new Date(this.selectedRenewStartDate);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    date.setMonth(date.getMonth() + this.selectedRenewMonths);
    return new Intl.DateTimeFormat('it-IT').format(date);
  }

  private getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseMaxUsers(value: string): number | null {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed);

    if (!Number.isInteger(parsed) || parsed < 0) {
      return null;
    }

    return parsed;
  }
}