import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { CreateManagedUserRequest, UserSummaryResponse } from '../../../../core/models/user.models';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list-page.component.html',
  styleUrl: './user-list-page.component.scss'
})
export class UserListPageComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  users = signal<UserSummaryResponse[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
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
    const term = this.searchTerm().trim().toLowerCase();
    const allUsers = this.users();
    const showActive = this.selectedStatus() === 'ACTIVE';

    return allUsers.filter(user => {
      const isUserActive = this.isUserActiveBySubscription(user.subscriptionStatus);
      const matchesStatus = showActive ? isUserActive : !isUserActive;

      const matchesSearch =
        !term ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        String(user.gymId).includes(term) ||
        (user.latestWorkoutPlanTitle ?? '').toLowerCase().includes(term) ||
        this.getSubscriptionLabel(user.subscriptionStatus, user.subscriptionEndDate)
          .toLowerCase()
          .includes(term);

      return matchesStatus && matchesSearch;
    });
  });

  activeUsersCount = computed(() =>
    this.users().filter(user => this.isUserActiveBySubscription(user.subscriptionStatus)).length
  );

  inactiveUsersCount = computed(() =>
    this.users().filter(user => !this.isUserActiveBySubscription(user.subscriptionStatus)).length
  );

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService.getUsersForManagement().subscribe({
      next: response => {
        this.users.set(response);
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

  private isUserActiveBySubscription(
    status?: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'NONE'
  ): boolean {
    return status === 'ACTIVE' || status === 'EXPIRING';
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

  formatDateForView(date: string): string {
    return new Date(date).toLocaleDateString('it-IT');
  }
}