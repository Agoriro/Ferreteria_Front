import { API_BASE_URL, fetchWithAuth } from "@/lib/api";
import type {
  ApiError,
  DiasEntregaProveedorCreate,
  DiasEntregaProveedorListResponse,
  DiasEntregaProveedorRecord,
  DiasEntregaProveedorUpdate,
  ProveedorDiasEntregaListResponse,
} from "@/types/api";

class DiasEntregaProveedorService {
  async list(
    skip = 0,
    limit = 100,
    empresa?: string
  ): Promise<DiasEntregaProveedorListResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (empresa) {
      params.append("empresa", empresa);
    }

    const response = await fetchWithAuth(
      `${API_BASE_URL}/dias-entrega-proveedor/?${params}`
    );

    if (!response.ok) {
      throw new Error("Error al obtener días de entrega por proveedor");
    }

    return response.json();
  }

  async get(recordId: string): Promise<DiasEntregaProveedorRecord> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/dias-entrega-proveedor/${recordId}`
    );

    if (!response.ok) {
      if (response.status === 404) throw new Error("Registro no encontrado");
      throw new Error("Error al obtener el registro");
    }

    return response.json();
  }

  async create(
    data: DiasEntregaProveedorCreate
  ): Promise<DiasEntregaProveedorRecord> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/dias-entrega-proveedor/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      let errMsg = "Error al crear el registro";
      try {
        const error: ApiError = await response.json();
        errMsg = error.detail || errMsg;
      } catch {
        // ignore
      }
      if (response.status === 400) {
        errMsg = "La combinación empresa + NIT proveedor ya existe";
      }
      throw new Error(errMsg);
    }

    return response.json();
  }

  async update(
    recordId: string,
    data: DiasEntregaProveedorUpdate
  ): Promise<DiasEntregaProveedorRecord> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/dias-entrega-proveedor/${recordId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

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

  async delete(recordId: string): Promise<{ message: string }> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/dias-entrega-proveedor/${recordId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      if (response.status === 404) throw new Error("Registro no encontrado");
      throw new Error("Error al eliminar el registro");
    }

    return response.json();
  }

  async getProveedoresPorEmpresa(
    empresa: string,
    search?: string,
    limit = 50
  ): Promise<ProveedorDiasEntregaListResponse> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (search) {
      params.append("search", search);
    }

    const response = await fetchWithAuth(
      `${API_BASE_URL}/dias-entrega-proveedor/options/proveedores/${encodeURIComponent(empresa)}?${params}`
    );

    if (!response.ok) {
      throw new Error("Error al obtener proveedores");
    }

    return response.json();
  }
}

export const diasEntregaProveedorService = new DiasEntregaProveedorService();

