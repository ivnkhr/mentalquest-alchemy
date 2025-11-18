import { Injectable } from '@angular/core';
import { db, SyncQueueItem } from './db';
import { Rock, Edge, User } from 'shared/types';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  // ============ Rocks ============

  async getRocks(): Promise<Rock[]> {
    return db.rocks.filter((rock) => !rock.is_deleted).toArray();
  }

  async getRock(id: string): Promise<Rock | undefined> {
    return db.rocks.get(id);
  }

  async saveRock(rock: Rock): Promise<string> {
    return db.rocks.put(rock);
  }

  async deleteRock(id: string): Promise<void> {
    const rock = await db.rocks.get(id);
    if (rock) {
      rock.is_deleted = true;
      rock.deleted_at = new Date();
      await db.rocks.put(rock);
    }
  }

  // ============ Edges ============

  async getEdges(rockId: string): Promise<Edge[]> {
    return db.edges.filter((edge) => edge.rock_id === rockId && !edge.is_deleted).toArray();
  }

  async getEdge(id: string): Promise<Edge | undefined> {
    return db.edges.get(id);
  }

  async saveEdge(edge: Edge): Promise<string> {
    return db.edges.put(edge);
  }

  async deleteEdge(id: string): Promise<void> {
    const edge = await db.edges.get(id);
    if (edge) {
      edge.is_deleted = true;
      edge.deleted_at = new Date();
      await db.edges.put(edge);
    }
  }

  // ============ User ============

  async saveUser(user: User): Promise<string> {
    return db.user.put(user);
  }

  async getUser(id: string): Promise<User | undefined> {
    return db.user.get(id);
  }

  async getCurrentUser(): Promise<User | undefined> {
    return db.user.toCollection().first();
  }

  async clearUser(): Promise<void> {
    await db.user.clear();
  }

  // ============ Sync Queue ============

  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'synced'>): Promise<number> {
    const queueItem: SyncQueueItem = {
      ...item,
      synced: false,
    };
    return db.syncQueue.add(queueItem);
  }

  async getUnsyncedItems(): Promise<SyncQueueItem[]> {
    return db.syncQueue.filter((item) => !item.synced).sortBy('client_timestamp');
  }

  async markAsSynced(id: number): Promise<void> {
    await db.syncQueue.update(id, { synced: true });
  }

  async clearSyncedItems(): Promise<void> {
    await db.syncQueue.filter((item) => item.synced).delete();
  }

  // ============ Utilities ============

  async clearAllData(): Promise<void> {
    await db.rocks.clear();
    await db.edges.clear();
    await db.syncQueue.clear();
    await db.user.clear();
  }

  async initializeFromServer(rocks: Rock[], user: User): Promise<void> {
    await db.rocks.bulkPut(rocks);
    await db.user.put(user);
  }
}
