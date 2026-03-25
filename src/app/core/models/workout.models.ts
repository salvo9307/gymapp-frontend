export interface WorkoutExerciseResponse {
  id: number;
  exerciseId?: number | null;
  exerciseName: string;
  exerciseOrder: number;
  sets: number | null;
  reps: string | null;
  lastWeight: number | null;
}

export interface WorkoutDayResponse {
  id: number;
  dayOrder: number;
  title: string;
  exercises: WorkoutExerciseResponse[];
}

export interface WorkoutPlanResponse {
  id: number;
  title: string;
  active: boolean;
  userId: number;
  days: WorkoutDayResponse[];
}

export interface WorkoutExerciseRequest {
  exerciseId: number;
  exerciseOrder: number;
  sets: number | null;
  reps: string | null;
}

export interface WorkoutDayRequest {
  dayOrder: number;
  title: string;
  exercises: WorkoutExerciseRequest[];
}

export interface CreateWorkoutPlanRequest {
  userId: number;
  title: string;
  days: WorkoutDayRequest[];
}