import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { ApiService } from '../../../core/api/api.service';
import { IndexedDBService } from '../../../core/storage/indexeddb.service';
import { ClientIdService } from '../../../core/storage/client-id.service';
import { VersionVectorService } from '../../../core/sync/version-vector.service';
import { SyncService } from '../../../core/sync/sync.service';
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
  private indexedDB = inject(IndexedDBService);
  private clientIdService = inject(ClientIdService);
  private versionVectorService = inject(VersionVectorService);
  private syncService = inject(SyncService);

  /**
   * Get all rocks from IndexedDB (offline-first)
   */
  getRocks(status?: RockStatus): Observable<Rock[]> {
    return from(this.indexedDB.getRocks()).pipe(
      map((rocks) => {
        if (status) {
          return rocks.filter((rock) => rock.status === status);
        }
        return rocks;
      }),
      catchError((error) => {
        console.error('Failed to get rocks from IndexedDB:', error);
        return of([]);
      })
    );
  }

  /**
   * Get a single rock by ID from IndexedDB
   */
  getRock(id: string): Observable<Rock | undefined> {
    return from(this.indexedDB.getRock(id));
  }

  /**
   * Create a new rock (offline-first)
   */
  createRock(rockDto: CreateRockDto): Observable<Rock> {
    return from(this.clientIdService.getClientId()).pipe(
      switchMap(async (clientId) => {
        // Generate UUID and create rock object
        const rock: Rock = {
          id: uuidv4(),
          user_id: '', // Will be set by backend
          title: rockDto.title,
          description: rockDto.description,
          status: RockStatus.ACTIVE,
          progress: 0,
          version_vector: this.versionVectorService.increment(clientId, {}),
          created_at: new Date(),
          updated_at: new Date(),
          is_deleted: false,
        };

        // Save to IndexedDB first
        await this.indexedDB.saveRock(rock);

        // Add to sync queue
        await this.indexedDB.addToSyncQueue({
          entity_type: 'rock',
          entity_id: rock.id,
          operation: 'create',
          payload: rockDto,
          client_timestamp: new Date(),
        });

        // Attempt to sync if online
        if (this.syncService.isOnline()) {
          this.syncService.syncNow().catch((err) => {
            console.error('Background sync failed:', err);
          });
        }

        return rock;
      })
    );
  }

  /**
   * Update a rock (offline-first)
   */
  updateRock(id: string, rockDto: UpdateRockDto): Observable<Rock> {
    return from(this.clientIdService.getClientId()).pipe(
      switchMap(async (clientId) => {
        const existingRock = await this.indexedDB.getRock(id);
        if (!existingRock) {
          throw new Error('Rock not found');
        }

        // Update rock with new version vector
        const updatedRock: Rock = {
          ...existingRock,
          ...rockDto,
          version_vector: this.versionVectorService.increment(
            clientId,
            existingRock.version_vector || {}
          ),
          updated_at: new Date(),
        };

        // Save to IndexedDB
        await this.indexedDB.saveRock(updatedRock);

        // Add to sync queue
        await this.indexedDB.addToSyncQueue({
          entity_type: 'rock',
          entity_id: id,
          operation: 'update',
          payload: rockDto,
          client_timestamp: new Date(),
        });

        // Attempt to sync if online
        if (this.syncService.isOnline()) {
          this.syncService.syncNow().catch((err) => {
            console.error('Background sync failed:', err);
          });
        }

        return updatedRock;
      })
    );
  }

  /**
   * Delete a rock (offline-first / soft delete)
   */
  deleteRock(id: string): Observable<{ message: string }> {
    return from(this.clientIdService.getClientId()).pipe(
      switchMap(async (clientId) => {
        // Soft delete in IndexedDB
        await this.indexedDB.deleteRock(id);

        // Add to sync queue
        await this.indexedDB.addToSyncQueue({
          entity_type: 'rock',
          entity_id: id,
          operation: 'delete',
          payload: {},
          client_timestamp: new Date(),
        });

        // Attempt to sync if online
        if (this.syncService.isOnline()) {
          this.syncService.syncNow().catch((err) => {
            console.error('Background sync failed:', err);
          });
        }

        return { message: 'Rock deleted successfully' };
      })
    );
  }

  /**
   * Get all edges for a rock from IndexedDB
   */
  getEdges(rockId: string): Observable<Edge[]> {
    return from(this.indexedDB.getEdges(rockId));
  }

  /**
   * Create a new edge (offline-first)
   */
  createEdge(rockId: string, edgeDto: CreateEdgeDto): Observable<Edge> {
    return from(this.clientIdService.getClientId()).pipe(
      switchMap(async (clientId) => {
        const edge: Edge = {
          id: uuidv4(),
          rock_id: rockId,
          title: edgeDto.title,
          description: edgeDto.description,
          is_completed: false,
          order_index: edgeDto.order_index || 0,
          version_vector: this.versionVectorService.increment(clientId, {}),
          created_at: new Date(),
          updated_at: new Date(),
          is_deleted: false,
        };

        await this.indexedDB.saveEdge(edge);

        await this.indexedDB.addToSyncQueue({
          entity_type: 'edge',
          entity_id: edge.id,
          operation: 'create',
          payload: { ...edgeDto, rock_id: rockId },
          client_timestamp: new Date(),
        });

        if (this.syncService.isOnline()) {
          this.syncService.syncNow().catch((err) => {
            console.error('Background sync failed:', err);
          });
        }

        return edge;
      })
    );
  }

  /**
   * Update an edge (offline-first)
   */
  updateEdge(id: string, edgeDto: UpdateEdgeDto): Observable<Edge> {
    return from(this.clientIdService.getClientId()).pipe(
      switchMap(async (clientId) => {
        const existingEdge = await this.indexedDB.getEdge(id);
        if (!existingEdge) {
          throw new Error('Edge not found');
        }

        const updatedEdge: Edge = {
          ...existingEdge,
          ...edgeDto,
          version_vector: this.versionVectorService.increment(
            clientId,
            existingEdge.version_vector || {}
          ),
          updated_at: new Date(),
        };

        // Update completed_at timestamp
        if (edgeDto.is_completed !== undefined) {
          updatedEdge.completed_at = edgeDto.is_completed ? new Date() : undefined;
        }

        await this.indexedDB.saveEdge(updatedEdge);

        await this.indexedDB.addToSyncQueue({
          entity_type: 'edge',
          entity_id: id,
          operation: 'update',
          payload: edgeDto,
          client_timestamp: new Date(),
        });

        if (this.syncService.isOnline()) {
          this.syncService.syncNow().catch((err) => {
            console.error('Background sync failed:', err);
          });
        }

        // Update rock progress
        await this.updateRockProgress(updatedEdge.rock_id);

        return updatedEdge;
      })
    );
  }

  /**
   * Delete an edge (offline-first / soft delete)
   */
  deleteEdge(id: string): Observable<{ message: string }> {
    return from(this.indexedDB.getEdge(id)).pipe(
      switchMap(async (edge) => {
        if (!edge) {
          throw new Error('Edge not found');
        }

        await this.indexedDB.deleteEdge(id);

        await this.indexedDB.addToSyncQueue({
          entity_type: 'edge',
          entity_id: id,
          operation: 'delete',
          payload: {},
          client_timestamp: new Date(),
        });

        if (this.syncService.isOnline()) {
          this.syncService.syncNow().catch((err) => {
            console.error('Background sync failed:', err);
          });
        }

        // Update rock progress
        await this.updateRockProgress(edge.rock_id);

        return { message: 'Edge deleted successfully' };
      })
    );
  }

  /**
   * Update rock progress based on completed edges
   */
  private async updateRockProgress(rockId: string): Promise<void> {
    const edges = await this.indexedDB.getEdges(rockId);
    const rock = await this.indexedDB.getRock(rockId);

    if (!rock || edges.length === 0) {
      return;
    }

    const completedCount = edges.filter((edge) => edge.is_completed).length;
    const progress = Math.round((completedCount / edges.length) * 100);

    if (rock.progress !== progress) {
      const clientId = await this.clientIdService.getClientId();
      rock.progress = progress;
      rock.version_vector = this.versionVectorService.increment(
        clientId,
        rock.version_vector || {}
      );
      rock.updated_at = new Date();

      await this.indexedDB.saveRock(rock);

      // Add progress update to sync queue
      await this.indexedDB.addToSyncQueue({
        entity_type: 'rock',
        entity_id: rockId,
        operation: 'update',
        payload: { progress },
        client_timestamp: new Date(),
      });
    }
  }
}
