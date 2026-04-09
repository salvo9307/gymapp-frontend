import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { CreateManagedUserRequest, UserSummaryResponse } from '../../../../core/models/user.models';
import { LoadingSpinnerComponent } from '../../../../core/loading/loading-spinner.component';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './user-list-page.component.html',
  styleUrls: ['./user-list-page.component.scss']
})
export class UserListPageComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  users = signal<UserSummaryResponse[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');
  deletingUserId = signal<number | null>(null);

  searchTerm = signal('');
  selectedStatus = signal<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  showCreateUserPanel = signal(false);
  isCreatingUser = signal(false);
  createUserErrorMessage = signal('');
  createUserSuccessMessage = signal('');

  newUserFirstName = signal('');
  newUserLastName = signal('');
  newUserEmail = signal('');
  newUserPassword = signal('');

  filteredUsers = computed(() => {
    const term = this.normalizeText(this.searchTerm());
    const showActive = this.selectedStatus() === 'ACTIVE';

    return this.users().filter(user => {
      const matchesStatus = showActive ? !!user.active : !user.active;

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      const searchableText = this.buildSearchableText(user);
      return searchableText.includes(term);
    });
  });

  activeUsersCount = computed(() =>
    this.users().filter(user => !!user.active).length
  );

  inactiveUsersCount = computed(() =>
    this.users().filter(user => !user.active).length
  );

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.userService.getUsersForManagement().subscribe({
      next: response => {
        this.users.set(response ?? []);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('USERS ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nel caricamento utenti');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  performSearch(value: string): void {
    this.searchTerm.set(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  showActiveUsers(): void {
    this.selectedStatus.set('ACTIVE');
  }

  showInactiveUsers(): void {
    this.selectedStatus.set('INACTIVE');
  }

  openUserDetail(userId: number): void {
    this.router.navigate(['/manager/users', userId]);
  }

  toggleCreateUserPanel(): void {
    this.showCreateUserPanel.update(value => !value);
    this.createUserErrorMessage.set('');
    this.createUserSuccessMessage.set('');

    if (!this.showCreateUserPanel()) {
      this.resetCreateUserForm();
    }
  }

  resetCreateUserForm(): void {
    this.newUserFirstName.set('');
    this.newUserLastName.set('');
    this.newUserEmail.set('');
    this.newUserPassword.set('');
  }

  onFirstNameChange(value: string): void {
    this.newUserFirstName.set(value);
  }

  onLastNameChange(value: string): void {
    this.newUserLastName.set(value);
  }

  onEmailChange(value: string): void {
    this.newUserEmail.set(value);
  }

  onPasswordChange(value: string): void {
    this.newUserPassword.set(value);
  }

  getSubscriptionLabel(
    status?: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'NONE',
    endDate?: string | null
  ): string {
    switch (status) {
      case 'ACTIVE':
        return 'Attivo';
      case 'EXPIRING':
        return 'In scadenza';
      case 'EXPIRED':
        return 'Scaduto';
      case 'NONE':
      default:
        return 'Nessun abbonamento';
    }
  }

  getSubscriptionClass(
    status?: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'NONE'
  ): string {
    switch (status) {
      case 'ACTIVE':
        return 'subscription-active';
      case 'EXPIRING':
        return 'subscription-expiring';
      case 'EXPIRED':
      case 'NONE':
      default:
        return 'subscription-expired';
    }
  }

  submitCreateUser(): void {
    const firstName = this.newUserFirstName().trim();
    const lastName = this.newUserLastName().trim();
    const email = this.newUserEmail().trim();
    const password = this.newUserPassword().trim();

    this.createUserErrorMessage.set('');
    this.createUserSuccessMessage.set('');
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!firstName || !lastName || !email || !password) {
      this.createUserErrorMessage.set('Compila tutti i campi');
      return;
    }

    if (password.length < 6) {
      this.createUserErrorMessage.set('La password deve contenere almeno 6 caratteri');
      return;
    }

    if (this.isCreatingUser()) {
      return;
    }

    const request: CreateManagedUserRequest = {
      firstName,
      lastName,
      email,
      password
    };

    this.isCreatingUser.set(true);

    this.userService.createUserForManager(request).subscribe({
      next: () => {
        this.isCreatingUser.set(false);
        this.createUserSuccessMessage.set('Utente creato con successo');
        this.createUserErrorMessage.set('');
        this.successMessage.set('');
        this.errorMessage.set('');
        this.resetCreateUserForm();
        this.showCreateUserPanel.set(false);
        this.loadUsers();
      },
      error: err => {
        console.error('CREATE USER ERROR', err);
        this.isCreatingUser.set(false);
        this.createUserErrorMessage.set(
          err?.error?.message || 'Errore durante la creazione dell’utente'
        );
      }
    });
  }

  deleteUser(user: UserSummaryResponse): void {
    if (this.deletingUserId() !== null) {
      return;
    }

    const fullName = `${user.firstName} ${user.lastName}`.trim();
    const confirmed = window.confirm(
      `Vuoi eliminare definitivamente l'utente "${fullName}"?\n\nVerranno eliminati anche la sua eventuale scheda e i dati collegati.`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.deletingUserId.set(user.id);

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.deletingUserId.set(null);
        this.successMessage.set('Utente eliminato con successo');
        this.users.update(users => users.filter(existingUser => existingUser.id !== user.id));
      },
      error: err => {
        console.error('DELETE USER ERROR', err);
        this.deletingUserId.set(null);
        this.errorMessage.set(err?.error?.message || 'Errore durante l’eliminazione dell’utente');
      }
    });
  }

  isDeletingUser(userId: number): boolean {
    return this.deletingUserId() === userId;
  }

  formatDateForView(date: string): string {
    return new Date(date).toLocaleDateString('it-IT');
  }

  private buildSearchableText(user: UserSummaryResponse): string {
    return this.normalizeText([
      user.firstName,
      user.lastName,
      `${user.firstName ?? ''} ${user.lastName ?? ''}`,
      user.email,
      user.latestWorkoutPlanTitle,
      this.getSubscriptionLabel(user.subscriptionStatus, user.subscriptionEndDate)
    ].join(' '));
  }

  private normalizeText(value: string | null | undefined): string {
    return (value ?? '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }
}