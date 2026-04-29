export interface CreateWorkoutPlanRequest {
  userId: number;
  title: string;
  days: WorkoutDayRequest[];
}

export interface WorkoutDayRequest {
  dayOrder: number;
  title: string;
  exercises: WorkoutExerciseRequest[];
}

export interface WorkoutExerciseRequest {
  exerciseId: number;
  exerciseOrder: number;
  sets: number | null;
  reps: string | null;
  restSeconds?: number | null;
}

export interface WorkoutPlanResponse {
  id: number;
  title: string;
  days: WorkoutDayResponse[];
  subscriptionEndDate?: string | null;
}

export interface WorkoutDayResponse {
  id: number;
  dayOrder: number;
  title: string;
  exercises: WorkoutExerciseResponse[];
}

export interface WorkoutExerciseResponse {
  workoutDayExerciseId: number;
  exerciseId?: number | null;
  exerciseName: string;
  exerciseOrder: number;
  sets: number | null;
  reps: string | null;
  restSeconds?: number | null;
  lastWeight?: number | null;
  weight?: number | null;
}

export interface WorkoutTemplateSummaryResponse {
  id: number;
  title: string;
}

export interface WorkoutTemplateResponse {
  id: number;
  title: string;
  days: WorkoutTemplateDayResponse[];
}

export interface WorkoutTemplateDayResponse {
  id: number;
  dayOrder: number;
  title: string;
  exercises: WorkoutTemplateExerciseResponse[];
}

export interface WorkoutTemplateExerciseResponse {
  id: number;
  exerciseId: number;
  exerciseName: string;
  exerciseOrder: number;
  sets: number | null;
  reps: string | null;
  restSeconds?: number | null;
}