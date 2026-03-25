export interface UserWorkoutExerciseResponse {
  id: number;
  exerciseId: number;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number | null;
  orderNumber: number;
}

export interface UserWorkoutDayResponse {
  dayNumber: number;
  title: string;
  exercises: UserWorkoutExerciseResponse[];
}

export interface UserWorkoutPlanResponse {
  workoutPlanId: number;
  title: string;
  days: UserWorkoutDayResponse[];
}

export interface UpdateExerciseWeightRequest {
  weight: number | null;
}