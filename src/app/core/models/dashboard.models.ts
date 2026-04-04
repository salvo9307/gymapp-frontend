export interface ManagerDashboardResponse {
  gymId: number;
  gymName: string;
  totalUsers: number;
  activeUsersCount: number;
  usersWithActivePlan: number;
  usersWithoutActivePlan: number;
  totalExercises: number;
  activeSubscriptionsCount: number;
  expiringUsersCount: number;
  expiredUsersCount: number;
  subscriptionEndDate: string | null;
  maxUsers: number | null;
  availableSlots: number | null;
}