import { API_BASE_URL, fetchWithAuth } from "@/lib/api";
import type {
  ApiError,
  InventarioExcluidoCreate,
  InventarioExcluidoListResponse,
  InventarioExcluidoRecord,
  InventarioExcluidoUpdate,
  ToggleStatusRequest,
} from "@/types/api";

class InventarioExcluidoService {
  async list(skip = 0, limit = 100, includeInactive = false): Promise<InventarioExcluidoListResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      include_inactive: includeInactive.toString(),
    });

    // El backend puede redirigir si falta el slash final. Lo incluimos para evitar redirects (y problemas de CORS).
    const response = await fetchWithAuth(`${API_BASE_URL}/inventario-excluido/?${params}`);
    if (!response.ok) {
      throw new Error("Error al obtener inventario excluido");
    }
    return response.json();
  }

  async get(recordId: string): Promise<InventarioExcluidoRecord> {
    const response = await fetchWithAuth(`${API_BASE_URL}/inventario-excluido/${recordId}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error("Registro no encontrado");
      throw new Error("Error al obtener el registro");
    }
    return response.json();
  }

  async create(data: InventarioExcluidoCreate): Promise<InventarioExcluidoRecord> {
    // Usamos slash final para evitar redirects del backend.
    const response = await fetchWithAuth(`${API_BASE_URL}/inventario-excluido/`, {
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
      if (response.status === 400) {
        errMsg = "La combinación empresa + código de producto ya existe";
      }
      throw new Error(errMsg);
    }
    return response.json();
  }

  async update(recordId: string, data: InventarioExcluidoUpdate): Promise<InventarioExcluidoRecord> {
    const response = await fetchWithAuth(`${API_BASE_URL}/inventario-excluido/${recordId}`, {
      method: "PATCH",
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

  async toggleStatus(recordId: string, status: boolean): Promise<InventarioExcluidoRecord> {
    const body: ToggleStatusRequest = { status };
    const response = await fetchWithAuth(`${API_BASE_URL}/inventario-excluido/${recordId}/toggle-status`, {
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

  async delete(recordId: string): Promise<{ message: string }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/inventario-excluido/${recordId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error("Registro no encontrado");
      throw new Error("Error al eliminar el registro");
    }

    return response.json();
  }
}

export const inventarioExcluidoService = new InventarioExcluidoService();


