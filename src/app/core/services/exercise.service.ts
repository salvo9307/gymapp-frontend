import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {CreateExerciseRequest, ExerciseResponse, UpdateExerciseRequest} from '../models/exercise.models';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/catalog/exercises`;

  getExercises(name?: string): Observable<ExerciseResponse[]> {
    let params = new HttpParams();

    if (name && name.trim()) {
      params = params.set('name', name.trim());
    }

    return this.http.get<ExerciseResponse[]>(this.baseUrl, { params });
  }

  createExercise(request: CreateExerciseRequest): Observable<ExerciseResponse> {
    return this.http.post<ExerciseResponse>(this.baseUrl, request);
  }

  updateExercise(id: number, request: UpdateExerciseRequest): Observable<ExerciseResponse> {
    return this.http.put<ExerciseResponse>(`${this.baseUrl}/${id}`, request);
  }

  deleteExercise(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}