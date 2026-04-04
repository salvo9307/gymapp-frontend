export interface AppWorkoutExerciseResponse {
  id: number;
  exerciseName: string;
  exerciseOrder: number;
  sets: number | null;
  reps: string | null;
  restSeconds: number | null;
  lastWeight: number | null;
}

export interface AppWorkoutDayResponse {
  id: number;
  dayOrder: number;
  title: string;
  exercises: AppWorkoutExerciseResponse[];
}

export interface AppWorkoutPlanResponse {
  id: number;
  title: string;
  days: AppWorkoutDayResponse[];
  subscriptionEndDate?: string | null;
}

export interface AppUpdateWeightRequest {
  weight: number | null;
}