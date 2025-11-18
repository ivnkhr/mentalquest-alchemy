import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import {
  Rock,
  Edge,
  CreateRockDto,
  UpdateRockDto,
  CreateEdgeDto,
  UpdateEdgeDto,
  RockStatus,
} from 'shared/types';

@Injectable({
  providedIn: 'root',
})
export class RocksService {
  private apiService = inject(ApiService);

  /**
   * Get all rocks, optionally filtered by status
   */
  getRocks(status?: RockStatus): Observable<Rock[]> {
    const endpoint = status ? `rocks?status=${status}` : 'rocks';
    return this.apiService.get<Rock[]>(endpoint);
  }

  /**
   * Get a single rock by ID
   */
  getRock(id: string): Observable<Rock> {
    return this.apiService.get<Rock>(`rocks/${id}`);
  }

  /**
   * Create a new rock
   */
  createRock(rock: CreateRockDto): Observable<Rock> {
    return this.apiService.post<Rock>('rocks', rock);
  }

  /**
   * Update a rock
   */
  updateRock(id: string, rock: UpdateRockDto): Observable<Rock> {
    return this.apiService.patch<Rock>(`rocks/${id}`, rock);
  }

  /**
   * Delete a rock
   */
  deleteRock(id: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`rocks/${id}`);
  }

  /**
   * Get all edges for a rock
   */
  getEdges(rockId: string): Observable<Edge[]> {
    return this.apiService.get<Edge[]>(`rocks/${rockId}/edges`);
  }

  /**
   * Create a new edge
   */
  createEdge(rockId: string, edge: CreateEdgeDto): Observable<Edge> {
    return this.apiService.post<Edge>(`rocks/${rockId}/edges`, edge);
  }

  /**
   * Update an edge
   */
  updateEdge(id: string, edge: UpdateEdgeDto): Observable<Edge> {
    return this.apiService.patch<Edge>(`edges/${id}`, edge);
  }

  /**
   * Delete an edge
   */
  deleteEdge(id: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`edges/${id}`);
  }
}
