import { API_BASE_URL, fetchWithAuth } from "@/lib/api";
import type {
  ApiError,
  GenerarSugeridoRequest,
  StatusSugerido,
  SugeridoCompras,
  SugeridoComprasCreate,
  SugeridoComprasListResponse,
  SugeridoComprasUpdate,
  UpdateStatusRequest,
  SugeridoProveedorItem,
  SugeridoBulkUpdateResponse,
  BulkExportResponse,
  ReporteSugeridoResponse,
} from "@/types/api";

class SugeridoComprasService {
  private baseUrl = `${API_BASE_URL}/sugerido-compras`;

  /**
   * Genera sugerido de compras basado en movimientos de inventario
   */
  async generar(data: GenerarSugeridoRequest): Promise<SugeridoComprasListResponse> {
    const response = await fetchWithAuth(`${this.baseUrl}/generar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errMsg = "Error al generar sugerido de compras";
      try {
        const error: ApiError = await response.json();
        errMsg = error.detail || errMsg;
      } catch {
        // ignore
      }
      throw new Error(errMsg);
    }
    return response.json();
  }

  /**
   * Lista todos los sugeridos con paginación
   */
  async list(skip = 0, limit = 100): Promise<SugeridoComprasListResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    const response = await fetchWithAuth(`${this.baseUrl}/?${params}`);
    if (!response.ok) {
      throw new Error("Error al obtener sugerido de compras");
    }
    return response.json();
  }

  /**
   * Obtiene sugeridos por status
   */
  async getByStatus(status: StatusSugerido): Promise<SugeridoComprasListResponse> {
    const response = await fetchWithAuth(`${this.baseUrl}/by-status/${status}`);
    if (!response.ok) {
      throw new Error(`Error al obtener sugeridos con status ${status}`);
    }
    return response.json();
  }

  /**
   * Obtiene sugeridos con status "Requested"
   * @param identificacionTercero - Opcional: filtra por NIT del proveedor
   */
  async getRequested(identificacionTercero?: string): Promise<SugeridoComprasListResponse> {
    const params = new URLSearchParams();
    if (identificacionTercero) {
      params.append("identificacion_tercero", identificacionTercero);
    }
    const queryString = params.toString();
    const url = `${this.baseUrl}/requested${queryString ? "?" + queryString : ""}`;

    const response = await fetchWithAuth(url);
    if (!response.ok) {
      throw new Error("Error al obtener sugeridos solicitados");
    }
    return response.json();
  }

  /**
   * Obtiene sugeridos con status "Processed"
   */
  async getProcessed(): Promise<SugeridoComprasListResponse> {
    const response = await fetchWithAuth(`${this.baseUrl}/processed`);
    if (!response.ok) {
      throw new Error("Error al obtener sugeridos procesados");
    }
    return response.json();
  }

  /**
   * Actualiza múltiples sugeridos con datos del proveedor
   * Cambia el status a "Processed"
   */
  async bulkUpdateProveedor(items: SugeridoProveedorItem[]): Promise<SugeridoBulkUpdateResponse> {
    // Validación cliente antes de enviar
    for (const item of items) {
      if (item.cantidad_proveedor <= 0) {
        throw new Error('cantidad_proveedor debe ser mayor a 0');
      }
      if (item.valor_unitario_proveedor <= 0) {
        throw new Error('valor_unitario_proveedor debe ser mayor a 0');
      }
    }

    const response = await fetchWithAuth(`${this.baseUrl}/bulk-update-proveedor`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      let errMsg = "Error al actualizar los registros";
      try {
        const error = await response.json();
        if (error.detail) {
          errMsg = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
        }
      } catch {
        // ignore parse error
      }
      throw new Error(errMsg);
    }

    return response.json();
  }

  /**
   * Obtiene un sugerido por ID
   */
  async get(id: string): Promise<SugeridoCompras> {
    const response = await fetchWithAuth(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error("Registro no encontrado");
      throw new Error("Error al obtener el registro");
    }
    return response.json();
  }

  /**
   * Crea un registro manual
   */
  async create(data: SugeridoComprasCreate): Promise<SugeridoCompras> {
    const response = await fetchWithAuth(`${this.baseUrl}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errMsg = "Error al crear el registro";
      try {
        const error: ApiError = await response.json();
        errMsg = error.detail || errMsg;
      } catch {
        // ignore
      }
      throw new Error(errMsg);
    }
    return response.json();
  }

  /**
   * Actualiza un registro (campos parciales)
   */
  async update(id: string, data: SugeridoComprasUpdate): Promise<SugeridoCompras> {
    const response = await fetchWithAuth(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errMsg = "Error al actualizar el registro";
      try {
        const error: ApiError = await response.json();
        errMsg = error.detail || errMsg;
      } catch {
        // ignore
      }
      if (response.status === 404) errMsg = "Registro no encontrado";
      throw new Error(errMsg);
    }
    return response.json();
  }

  /**
   * Actualiza solo el status de un registro
   */
  async updateStatus(id: string, status: StatusSugerido): Promise<SugeridoCompras> {
    const body: UpdateStatusRequest = { status };
    const response = await fetchWithAuth(`${this.baseUrl}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errMsg = "Error al cambiar el estado";
      try {
        const error: ApiError = await response.json();
        errMsg = error.detail || errMsg;
      } catch {
        // ignore
      }
      if (response.status === 404) errMsg = "Registro no encontrado";
      throw new Error(errMsg);
    }
    return response.json();
  }

  /**
   * Elimina un registro por ID
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await fetchWithAuth(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error("Registro no encontrado");
      throw new Error("Error al eliminar el registro");
    }
    return response.json();
  }

  /**
   * Elimina todos los registros por status
   */
  async deleteByStatus(status: StatusSugerido): Promise<{ message: string }> {
    const response = await fetchWithAuth(`${this.baseUrl}/by-status/${status}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar registros con status ${status}`);
    }
    return response.json();
  }

  /**
   * Exporta registros y genera órdenes de compra
   * Actualiza el status a 'Exported' y retorna los JSONs de las OC
   */
  async bulkExport(ids: string[]): Promise<BulkExportResponse> {
    if (ids.length === 0) {
      throw new Error('Debe seleccionar al menos un registro para exportar');
    }

    const response = await fetchWithAuth(`${this.baseUrl}/bulk-export`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      let errMsg = "Error al exportar los registros";
      try {
        const error = await response.json();
        if (error.detail) {
          errMsg = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
        }
      } catch {
        // ignore parse error
      }
      throw new Error(errMsg);
    }

    return response.json();
  }

  /**
   * Obtiene el reporte de sugerido de compras con filtros
   * @param fechaInicial - Fecha inicio (YYYY-MM-DD, requerido)
   * @param fechaFinal - Fecha fin (YYYY-MM-DD, requerido)
   * @param identificacionTercero - NIT del proveedor (opcional)
   * @param status - Estado del registro (opcional)
   */
  async getReporte(
    fechaInicial: string,
    fechaFinal: string,
    identificacionTercero?: string,
    status?: string
  ): Promise<ReporteSugeridoResponse> {
    const params = new URLSearchParams({
      fecha_inicial: fechaInicial,
      fecha_final: fechaFinal,
    });
    if (identificacionTercero) {
      params.append("identificacion_tercero", identificacionTercero);
    }
    if (status) {
      params.append("status", status);
    }

    const response = await fetchWithAuth(`${this.baseUrl}/reporte?${params}`);

    if (!response.ok) {
      let errMsg = "Error al obtener el reporte";
      try {
        const error = await response.json();
        if (error.detail) {
          errMsg = typeof error.detail === "string" ? error.detail : JSON.stringify(error.detail);
        }
      } catch {
        // ignore parse error
      }
      throw new Error(errMsg);
    }

    return response.json();
  }
}

export const sugeridoComprasService = new SugeridoComprasService();




