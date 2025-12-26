// User types
export interface User {
  id: number;
  username: string;
  nombres: string;
  apellidos: string;
  id_proveedor: number | null;
  estado: boolean;
  rol_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface UserCreate {
  username: string;
  password: string;
  nombres: string;
  apellidos: string;
  rol_id: number;
  id_proveedor?: number | null;
}

export interface UserUpdate {
  nombres?: string;
  apellidos?: string;
  id_proveedor?: number | null;
  estado?: boolean;
  rol_id?: number;
}

// Role types
export interface Role {
  id_rol: number;
  nombre_rol: string;
  descripcion: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface RoleCreate {
  nombre_rol: string;
  descripcion?: string;
}

export interface RoleUpdate {
  nombre_rol?: string;
  descripcion?: string;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// API Error
export interface ApiError {
  detail: string;
}
