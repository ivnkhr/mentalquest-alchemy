import { Injectable } from '@angular/core';

export type VersionVector = Record<string, number>;

export enum CompareResult {
  EQUAL = 'equal',
  LESS_THAN = 'less_than',
  GREATER_THAN = 'greater_than',
  CONCURRENT = 'concurrent',
}

@Injectable({
  providedIn: 'root',
})
export class VersionVectorService {
  /**
   * Increment the version for a specific client
   */
  increment(clientId: string, vector: VersionVector = {}): VersionVector {
    return {
      ...vector,
      [clientId]: (vector[clientId] || 0) + 1,
    };
  }

  /**
   * Compare two version vectors
   * Returns:
   * - EQUAL: v1 == v2
   * - LESS_THAN: v1 < v2 (v2 is newer)
   * - GREATER_THAN: v1 > v2 (v1 is newer)
   * - CONCURRENT: v1 and v2 are concurrent (conflict)
   */
  compare(v1: VersionVector = {}, v2: VersionVector = {}): CompareResult {
    const allKeys = new Set([...Object.keys(v1), ...Object.keys(v2)]);

    let v1GreaterExists = false;
    let v2GreaterExists = false;

    for (const key of allKeys) {
      const val1 = v1[key] || 0;
      const val2 = v2[key] || 0;

      if (val1 > val2) {
        v1GreaterExists = true;
      } else if (val2 > val1) {
        v2GreaterExists = true;
      }
    }

    if (!v1GreaterExists && !v2GreaterExists) {
      return CompareResult.EQUAL;
    }

    if (v1GreaterExists && !v2GreaterExists) {
      return CompareResult.GREATER_THAN;
    }

    if (v2GreaterExists && !v1GreaterExists) {
      return CompareResult.LESS_THAN;
    }

    return CompareResult.CONCURRENT;
  }

  /**
   * Merge two version vectors (take max for each client)
   */
  merge(v1: VersionVector = {}, v2: VersionVector = {}): VersionVector {
    const allKeys = new Set([...Object.keys(v1), ...Object.keys(v2)]);
    const merged: VersionVector = {};

    for (const key of allKeys) {
      merged[key] = Math.max(v1[key] || 0, v2[key] || 0);
    }

    return merged;
  }

  /**
   * Check if server version is newer and can be applied
   */
  canApply(local: VersionVector = {}, server: VersionVector = {}): boolean {
    const result = this.compare(local, server);
    return result === CompareResult.LESS_THAN || result === CompareResult.EQUAL;
  }

  /**
   * Check if there's a conflict
   */
  hasConflict(local: VersionVector = {}, server: VersionVector = {}): boolean {
    return this.compare(local, server) === CompareResult.CONCURRENT;
  }
}
