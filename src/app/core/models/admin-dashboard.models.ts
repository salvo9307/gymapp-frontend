export interface AdminDashboardGymResponse {
  id: number;
  name: string;
  city: string | null;
  totalUsers: number;
  usersWithActivePlan: number;
  usersWithoutActivePlan: number;
  totalExercises: number;
  active: boolean;
  managerId: number | null;
  managerFirstName: string | null;
  managerLastName: string | null;
  managerEmail: string | null;
  subscriptionEndDate: string | null;
}

export interface AdminDashboardResponse {
  totalGyms: number;
  totalManagers: number;
  totalUsers: number;
  totalExercises: number;
  gyms: AdminDashboardGymResponse[];
}