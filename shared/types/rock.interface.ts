export enum RockStatus {
  ACTIVE = 'active',
  GEM = 'gem',
  ARCHIVED = 'archived',
}

export interface Rock {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: RockStatus;
  progress: number;
  version_vector?: Record<string, number>;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  archived_at?: Date;
  is_deleted: boolean;
  deleted_at?: Date;
}

export interface CreateRockDto {
  title: string;
  description?: string;
}

export interface UpdateRockDto {
  title?: string;
  description?: string;
  status?: RockStatus;
  progress?: number;
}
