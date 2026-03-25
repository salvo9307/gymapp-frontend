export interface ManagerDashboardResponse {
  id: number;
  gymName: string;
  totalUsers: number;
  usersWithActivePlan: number;
  usersWithoutActivePlan: number;
  totalExercises: number;
  activeSubscriptionsCount?: number;
  expiringUsersCount?: number;
  expiredUsersCount?: number;
}