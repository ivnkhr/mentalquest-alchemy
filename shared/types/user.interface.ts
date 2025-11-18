export interface User {
  id: string;
  email: string;
  username: string;
  created_at: Date;
  updated_at?: Date;
  last_sync_at?: Date;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}
