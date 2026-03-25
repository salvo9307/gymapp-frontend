export interface AppWorkoutExerciseResponse {
  id: number;
  exerciseId: number;
  exerciseName: string;
  exerciseOrder: number;
  sets: number | null;
  reps: string | null;
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
}

export interface AppUpdateWeightRequest {
  weight: number | null;
}