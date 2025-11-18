import { createAction, props } from '@ngrx/store';
import { User, LoginRequest, RegisterRequest } from 'shared/types';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ request: LoginRequest }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Register Actions
export const register = createAction(
  '[Auth] Register',
  props<{ request: RegisterRequest }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: User; token: string }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// Logout Action
export const logout = createAction('[Auth] Logout');

// Load Profile Actions
export const loadProfile = createAction('[Auth] Load Profile');

export const loadProfileSuccess = createAction(
  '[Auth] Load Profile Success',
  props<{ user: User }>()
);

export const loadProfileFailure = createAction(
  '[Auth] Load Profile Failure',
  props<{ error: string }>()
);

// Clear Error Action
export const clearError = createAction('[Auth] Clear Error');
