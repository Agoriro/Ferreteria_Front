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
}

export const sugeridoComprasService = new SugeridoComprasService();




