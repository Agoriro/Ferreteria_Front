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

// Sugerido de Compras
export type StatusSugerido = "Created" | "Requested" | "Processed";

export interface SugeridoCompras {
  id: string;                          // UUID
  empresa: string;
  fecha: string | null;                // "YYYY-MM-DD"
  num_doc: string | null;
  proveedor: string | null;
  grupo3: string | null;
  grupo4: string | null;
  grupo5: string | null;
  cod_prod: string;
  descripcion: string | null;
  unidad_medida: string | null;
  exist: number;                       // Existencia actual
  exist_mc: number;                    // Existencia MC
  cantidad_ventas_anterior: number;    // Ventas año anterior
  cantidad_ventas_actual: number;      // Ventas año actual
  sugerido_compras: number;            // Cantidad sugerida
  cantidad_a_pedir: number;            // Editable por usuario
  proveedor1: string | null;
  proveedor2: string | null;
  proveedor3: string | null;
  proveedor4: string | null;
  compras_en_el_periodo: number;
  total_entradas_en_el_periodo: number;
  ultima_fecha_compra: string | null;  // "YYYY-MM-DD"
  ventas_en_el_periodo: number;
  total_salidas_en_el_periodo: number;
  ultima_fecha_venta: string | null;   // "YYYY-MM-DD"
  saldo_actual: number;
  val_unit: number;                    // Valor unitario
  dcto: number;                        // Descuento
  val_neto: number;                    // Valor neto
  precio1: number;
  util_1: number;                      // Utilidad % precio 1
  precio2: number;
  util_2: number;                      // Utilidad % precio 2
  status: StatusSugerido;
  created_at: string;                  // ISO datetime
}

export interface GenerarSugeridoRequest {
  fecha_inicial: string;  // "YYYY-MM-DD" (requerido)
  fecha_final: string;    // "YYYY-MM-DD" (requerido)
  grupo3?: string;        // Opcional
  grupo4?: string;        // Opcional
  grupo5?: string;        // Opcional
}

export interface SugeridoComprasListResponse {
  items: SugeridoCompras[];
  total: number;
}

export interface SugeridoComprasCreate {
  empresa: string;
  cod_prod: string;
  fecha?: string;
  descripcion?: string;
  status?: StatusSugerido;
}

export interface SugeridoComprasUpdate {
  cantidad_a_pedir?: number;
  status?: StatusSugerido;
  [key: string]: unknown;
}

export interface UpdateStatusRequest {
  status: StatusSugerido;
}

// Grupos para Sugerido de Compras
export interface GruposResponse {
  Grupo_Tres: string[];
  Grupo_Cuatro: string[];
  Grupo_Cinco: string[];
}

// Proveedor Dropdown
export interface ProveedorDropdownItem {
  identificacion: string;
  nombre_completo: string;
}

// Permisos
export interface FormularioPermiso {
  id_formulario: number;
  nombre_formulario: string;
  descripcion: string;
  ruta: string;
  puede_leer: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
}

export interface PermisosResponse {
  rol: string;
  formularios: FormularioPermiso[];
}