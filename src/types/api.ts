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
  created_at: string;
  updated_at: string;
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

export interface ProveedorDiasEntregaOption {
  nit_proveedor: string;
  nombre_proveedor: string;
}

export interface ProveedorDiasEntregaListResponse {
  items: ProveedorDiasEntregaOption[];
  total: number;
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
export type StatusSugerido = "Created" | "Requested" | "Processed" | "Exported";

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
  cantidad_proveedor: number | null;   // Cantidad confirmada por el proveedor
  valor_unitario_proveedor: number | null; // Precio unitario del proveedor
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

// Bulk Update Proveedor
export interface SugeridoProveedorItem {
  id: string;
  cantidad_proveedor: number;
  valor_unitario_proveedor: number;
}

export interface SugeridoBulkUpdateRequest {
  items: SugeridoProveedorItem[];
}

export interface SugeridoBulkUpdateResponse {
  message: string;
  updated_count: number;
  updated_ids: string[];
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

// Bulk Export
export interface BulkExportRequest {
  ids: string[];
}

export interface OrdenCompraEncabezado {
  empresa: string;
  tipo_documento: string;
  prefijo: string;
  documento_numero: string;
  fecha: string;
  tercero_interno: string;
  tercero_externo: string;
  prefijo_dto_ext: string;
  numero_dto_ext: number;
  nota: string;
  forma_pago: string;
  verificado: number;
  anulado: number;
  fecha_emision: string;
  personalizado_1: string;
  personalizado_2: string;
  personalizado_3: string;
  personalizado_4: string;
  personalizado_5: string;
  personalizado_6: string;
  personalizado_7: string;
  personalizado_8: string;
  personalizado_9: string;
  personalizado_10: string;
  personalizado_11: string;
  personalizado_12: string;
  personalizado_13: string;
  personalizado_14: string;
  personalizado_15: string;
  importacion: string;
  sucursal: string;
  clasificacion: string;
}

export interface OrdenCompraDetalle {
  producto: string;
  bodega: string;
  unidad_de_medida: string;
  cantidad: number;
  iva: number;
  valor_unitario: number;
  descuento: number;
  vencimiento: string;
  nota: string;
  centro_costos: string;
  codigo_centro_costos: string;
  personalizado_1: string;
  personalizado_2: string;
  personalizado_3: string;
  personalizado_4: string;
  personalizado_5: string;
  personalizado_6: string;
  personalizado_7: string;
  personalizado_8: string;
  personalizado_9: string;
  personalizado_10: string;
  personalizado_11: string;
  personalizado_12: string;
  personalizado_13: string;
  personalizado_14: string;
  personalizado_15: string;
}

export interface OrdenCompra {
  encabezado: OrdenCompraEncabezado;
  detalles: OrdenCompraDetalle[];
}

export interface BulkExportResponse {
  message: string;
  updated_count: number;
  updated_ids: string[];
  ordenes_compra: OrdenCompra[];
}

// Reporte Sugerido de Compras
export interface ReporteSugeridoItem {
  empresa: string | null;
  proveedor: string | null;
  cod_prod: string | null;
  descripcion: string | null;
  unidad_medida: string | null;
  cantidad_proveedor: number | null;
  valor_unitario_proveedor: number | null;
  tipo_doc_exp: string | null;
  prefijo_exp: string | null;
  num_doc_exp: string | null;
  updated_at: string | null;
}

export interface ReporteSugeridoResponse {
  items: ReporteSugeridoItem[];
  total: number;
}