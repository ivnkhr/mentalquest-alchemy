export interface Edge {
  id: string;
  rock_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  order_index: number;
  version_vector?: Record<string, number>;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  is_deleted: boolean;
  deleted_at?: Date;
}

export interface CreateEdgeDto {
  title: string;
  description?: string;
  order_index?: number;
}

export interface UpdateEdgeDto {
  title?: string;
  description?: string;
  is_completed?: boolean;
  order_index?: number;
}
