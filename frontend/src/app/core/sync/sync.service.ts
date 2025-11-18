import { Injectable, inject } from '@angular/core';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { IndexedDBService } from '../storage/indexeddb.service';
import { ClientIdService } from '../storage/client-id.service';
import { VersionVectorService, CompareResult } from './version-vector.service';
import { ApiService } from '../api/api.service';
import { Rock, Edge } from 'shared/types';

export interface SyncStatus {
  syncing: boolean;
  lastSyncAt: Date | null;
  pendingItems: number;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private indexedDB = inject(IndexedDBService);
  private clientIdService = inject(ClientIdService);
  private versionVectorService = inject(VersionVectorService);
  private apiService = inject(ApiService);

  private syncStatusSubject = new BehaviorSubject<SyncStatus>({
    syncing: false,
    lastSyncAt: null,
    pendingItems: 0,
    error: null,
  });

  syncStatus$ = this.syncStatusSubject.asObservable();

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }

  /**
   * Sync all pending changes to server
   */
  async syncNow(): Promise<void> {
    if (!this.isOnline()) {
      console.log('Device is offline, skipping sync');
      return;
    }

    const unsyncedItems = await this.indexedDB.getUnsyncedItems();

    if (unsyncedItems.length === 0) {
      console.log('No items to sync');
      this.updateSyncStatus({ syncing: false, pendingItems: 0 });
      return;
    }

    this.updateSyncStatus({ syncing: true, pendingItems: unsyncedItems.length });

    try {
      // Process each item in the sync queue
      for (const item of unsyncedItems) {
        try {
          await this.processSyncItem(item);
          await this.indexedDB.markAsSynced(item.id!);
        } catch (error) {
          console.error('Failed to sync item:', item, error);
          // Continue with next item even if one fails
        }
      }

      // Pull latest data from server
      await this.pullFromServer();

      this.updateSyncStatus({
        syncing: false,
        lastSyncAt: new Date(),
        pendingItems: 0,
        error: null,
      });

      // Clean up synced items older than 7 days
      await this.indexedDB.clearSyncedItems();
    } catch (error: any) {
      console.error('Sync failed:', error);
      this.updateSyncStatus({
        syncing: false,
        error: error.message || 'Sync failed',
      });
    }
  }

  /**
   * Process a single sync queue item
   */
  private async processSyncItem(item: any): Promise<void> {
    const { entity_type, operation, entity_id, payload } = item;

    if (entity_type === 'rock') {
      switch (operation) {
        case 'create':
          await this.apiService.post('rocks', payload).toPromise();
          break;
        case 'update':
          await this.apiService.patch(`rocks/${entity_id}`, payload).toPromise();
          break;
        case 'delete':
          await this.apiService.delete(`rocks/${entity_id}`).toPromise();
          break;
      }
    } else if (entity_type === 'edge') {
      switch (operation) {
        case 'create':
          await this.apiService.post(`rocks/${payload.rock_id}/edges`, payload).toPromise();
          break;
        case 'update':
          await this.apiService.patch(`edges/${entity_id}`, payload).toPromise();
          break;
        case 'delete':
          await this.apiService.delete(`edges/${entity_id}`).toPromise();
          break;
      }
    }
  }

  /**
   * Pull latest data from server and merge with local data
   */
  private async pullFromServer(): Promise<void> {
    try {
      // Fetch all rocks from server
      const rocks = await this.apiService.get<Rock[]>('rocks').toPromise();

      if (rocks) {
        for (const serverRock of rocks) {
          const localRock = await this.indexedDB.getRock(serverRock.id);

          if (!localRock) {
            // New rock from server, save it
            await this.indexedDB.saveRock(serverRock);
          } else {
            // Merge using version vectors
            const comparison = this.versionVectorService.compare(
              localRock.version_vector || {},
              serverRock.version_vector || {}
            );

            if (comparison === CompareResult.LESS_THAN) {
              // Server version is newer, update local
              await this.indexedDB.saveRock(serverRock);
            } else if (comparison === CompareResult.CONCURRENT) {
              // Conflict: use last-write-wins (server wins)
              console.warn('Conflict detected for rock:', serverRock.id);
              await this.indexedDB.saveRock(serverRock);
            }
            // If local is newer or equal, keep local version
          }
        }
      }
    } catch (error) {
      console.error('Failed to pull from server:', error);
      throw error;
    }
  }

  /**
   * Update sync status
   */
  private updateSyncStatus(updates: Partial<SyncStatus>): void {
    this.syncStatusSubject.next({
      ...this.syncStatusSubject.value,
      ...updates,
    });
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return this.syncStatusSubject.value;
  }

  /**
   * Initialize data from server (first sync)
   */
  async initializeFromServer(): Promise<void> {
    if (!this.isOnline()) {
      console.log('Device is offline, skipping initialization');
      return;
    }

    try {
      const rocks = await this.apiService.get<Rock[]>('rocks').toPromise();
      if (rocks) {
        await this.indexedDB.initializeFromServer(rocks, {} as any);
      }
    } catch (error) {
      console.error('Failed to initialize from server:', error);
    }
  }
}
