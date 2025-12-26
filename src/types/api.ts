// Tipos compartidos para comunicación con el backend (API REST)

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

// Inventario Excluido
export interface InventarioExcluidoRecord {
  id: string; // UUID
  codigo_producto: string;
  empresa: string;
  status: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface InventarioExcluidoListResponse {
  items: InventarioExcluidoRecord[];
  total: number;
  skip: number;
  limit: number;
}

export interface InventarioExcluidoCreate {
  codigo_producto: string;
  empresa: string;
  status?: boolean;
}

export interface InventarioExcluidoUpdate {
  codigo_producto?: string;
  empresa?: string;
  status?: boolean;
}

export interface ToggleStatusRequest {
  status: boolean;
}

// Días de Entrega por Proveedor
export interface DiasEntregaProveedorRecord {
  id: string; // UUID
  empresa: string;
  nit_proveedor: string;
  dias_entrega: number;
}

export interface DiasEntregaProveedorListResponse {
  items: DiasEntregaProveedorRecord[];
  total: number;
  skip: number;
  limit: number;
}

export interface DiasEntregaProveedorCreate {
  empresa: string;
  nit_proveedor: string;
  dias_entrega: number;
}

export interface DiasEntregaProveedorUpdate {
  empresa?: string;
  nit_proveedor?: string;
  dias_entrega?: number;
}

// Vista Inventarios
export interface VistaInventarioItem {
  empresa: string;
  codigo_producto: string;
  descripcion: string;
}

export interface VistaInventariosListResponse {
  items: VistaInventarioItem[];
  total: number;
  skip: number;
  limit: number;
}


