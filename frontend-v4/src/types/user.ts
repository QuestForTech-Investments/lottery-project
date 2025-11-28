import type { ChangeEvent, FormEvent } from 'react';
import type { SelectChangeEvent } from '@mui/material';

// User entity
export interface User {
  userId: number;
  username: string;
  fullName?: string;
  email?: string;
  createdAt?: string;
  isActive?: boolean;
  zoneIds?: number[];
  bettingPoolId?: number | null;
  permissions?: Permission[];
}

// Permission entity
export interface Permission {
  permissionId: number;
  name: string;
  permissionName?: string; // Alternative name field from API
  description?: string;
}

// Permission category
export interface PermissionCategory {
  category: string;
  permissions: Permission[];
}

// User form data
export interface UserFormData {
  username: string;
  password?: string;
  confirmPassword?: string;
  permissionIds: number[];
  zoneIds: number[];
  assignBanca: boolean;
  bettingPoolId: number | null;
}

// Form errors
export interface FormErrors {
  username?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
  permissions?: string | null;
  zones?: string | null;
  bettingPool?: string | null;
  submit?: string | null;
  general?: string | null;
  [key: string]: string | null | undefined;
}

// Sort order type
export type SortOrder = 'asc' | 'desc';

// User list sort fields
export type UserSortField = 'userId' | 'username' | 'fullName' | 'email' | 'createdAt';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Event handler types
export type InputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void;
export type SelectChangeHandler = (event: SelectChangeEvent<string>) => void;
export type FormSubmitHandler = (event: FormEvent<HTMLFormElement>) => void;
export type CheckboxChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void;
