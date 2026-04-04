export interface ManagerDashboardResponse {
  gymId: number;
  gymName: string;
  totalUsers: number;
  usersWithActivePlan: number;
  usersWithoutActivePlan: number;
  totalExercises: number;
  activeSubscriptionsCount: number;
  expiringUsersCount: number;
  expiredUsersCount: number;
  subscriptionEndDate: string | null;
  maxUsers: number | null;
  activeUsersCount: number;
  availableSlots: number | null;
}