import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layout/components/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page.component').then(
        m => m.LoginPageComponent
      )
  },
  {
    path: 'app/login',
    loadComponent: () =>
      import('./features/user-app/pages/user-app-login-page/user-app-login-page.component').then(
        m => m.UserAppLoginPageComponent
      )
  },
  {
    path: 'install',
    loadComponent: () =>
      import('./features/user-app/pages/install-page/install-page.component').then(
        m => m.InstallPageComponent
      )
  },
  {
    path: 'app/workout',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['USER'] },
    loadComponent: () =>
      import('./features/user-app/pages/user-app-workout-page/user-app-workout-page.component').then(
        m => m.UserAppWorkoutPageComponent
      )
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'admin/dashboard',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/dashboard/pages/admin-dashboard-page/admin-dashboard-page.component').then(
            m => m.AdminDashboardPageComponent
          )
      },
      {
        path: 'manager/dashboard',
        canActivate: [roleGuard],
        data: { roles: ['MANAGER', 'ADMIN'] },
        loadComponent: () =>
          import('./features/dashboard/pages/manager-dashboard-page/manager-dashboard-page.component').then(
            m => m.ManagerDashboardPageComponent
          )
      },
      {
        path: 'manager/users',
        canActivate: [roleGuard],
        data: { roles: ['MANAGER', 'ADMIN'] },
        loadComponent: () =>
          import('./features/users/pages/user-list-page/user-list-page.component').then(
            m => m.UserListPageComponent
          )
      },
      {
        path: 'manager/users/:id',
        canActivate: [roleGuard],
        data: { roles: ['MANAGER', 'ADMIN'] },
        loadComponent: () =>
          import('./features/users/pages/user-detail-page/user-detail-page.component').then(
            m => m.UserDetailPageComponent
          )
      },
      {
        path: 'manager/users/:id/workout-plan',
        canActivate: [roleGuard],
        data: { roles: ['MANAGER', 'ADMIN'] },
        loadComponent: () =>
          import('./features/workout-plans/pages/user-workout-plan-page/user-workout-plan-page.component').then(
            m => m.UserWorkoutPlanPageComponent
          )
      },
      {
        path: 'manager/users/:id/workout-plan/new',
        canActivate: [roleGuard],
        data: { roles: ['MANAGER', 'ADMIN'] },
        loadComponent: () =>
          import('./features/workout-plans/pages/create-workout-plan-page/create-workout-plan-page.component').then(
            m => m.CreateWorkoutPlanPageComponent
          )
      },
      {
        path: 'manager/users/:id/workout-plan/edit',
        canActivate: [roleGuard],
        data: { roles: ['MANAGER', 'ADMIN'] },
        loadComponent: () =>
          import('./features/workout-plans/pages/create-workout-plan-page/create-workout-plan-page.component').then(
            m => m.CreateWorkoutPlanPageComponent
          )
      },
      {
        path: 'manager/exercises',
        canActivate: [roleGuard],
        data: { roles: ['MANAGER', 'ADMIN'] },
        loadComponent: () =>
          import('./features/exercises/pages/exercise-list-page/exercise-list-page.component').then(
            m => m.ExerciseListPageComponent
          )
      },
      {
        path: 'change-password',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/auth/pages/change-password-page/change-password-page.component').then(
            m => m.ChangePasswordPageComponent
          )
      },
      {
        path: '',
        redirectTo: 'manager/dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];