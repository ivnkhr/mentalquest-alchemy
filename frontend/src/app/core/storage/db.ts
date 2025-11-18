import Dexie, { Table } from 'dexie';
import { Rock, Edge, User } from 'shared/types';

export interface SyncQueueItem {
  id?: number;
  entity_type: 'rock' | 'edge';
  entity_id: string;
  operation: 'create' | 'update' | 'delete';
  payload: any;
  client_timestamp: Date;
  synced: boolean;
}

export class ProductivityDatabase extends Dexie {
  rocks!: Table<Rock, string>;
  edges!: Table<Edge, string>;
  syncQueue!: Table<SyncQueueItem, number>;
  user!: Table<User, string>;

  constructor() {
    super('ProductivityApp');

    this.version(1).stores({
      rocks: 'id, user_id, status, updated_at',
      edges: 'id, rock_id, updated_at',
      syncQueue: '++id, synced, entity_type, client_timestamp',
      user: 'id',
    });
  }
}

export const db = new ProductivityDatabase();
