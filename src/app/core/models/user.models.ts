export interface UserSummaryResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gymId: number;
  hasWorkoutPlan: boolean;
  latestWorkoutPlanId: number | null;
  latestWorkoutPlanTitle: string | null;
  active: boolean;
  subscriptionEndDate?: string | null;
  subscriptionActive?: boolean;
  subscriptionStatus?: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'NONE';
}

export interface UserDetailResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gymId: number;
  hasWorkoutPlan: boolean;
  latestWorkoutPlanId: number | null;
  latestWorkoutPlanTitle: string | null;
  active: boolean;
  subscriptionEndDate?: string | null;
  subscriptionActive?: boolean;
}

export interface UpdateUserStatusRequest {
  active: boolean;
}

export interface ResetUserPasswordRequest {
  newPassword: string;
}

export interface CreateManagedUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}