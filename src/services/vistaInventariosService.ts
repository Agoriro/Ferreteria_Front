import { API_BASE_URL, fetchWithAuth } from "@/lib/api";
import type { VistaInventariosListResponse } from "@/types/api";

class VistaInventariosService {
  /**
   * Lista productos del inventario con campos básicos.
   * @param skip - Registros a saltar (paginación)
   * @param limit - Máximo de registros
   * @param empresa - Filtrar por empresa (opcional)
   */
  async list(
    skip = 0,
    limit = 100,
    empresa?: string
  ): Promise<VistaInventariosListResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (empresa) {
      params.append("empresa", empresa);
    }

    const response = await fetchWithAuth(
      `${API_BASE_URL}/vista-inventarios/?${params}`
    );

    if (!response.ok) {
      throw new Error("Error al obtener inventarios");
    }

    return response.json();
  }

  /**
   * Obtiene la lista de empresas únicas disponibles en el inventario.
   * Carga todos los registros (o un límite alto) y extrae empresas únicas.
   */
  async getEmpresas(): Promise<string[]> {
    // Cargar un lote grande para obtener empresas únicas
    // En producción podrías tener un endpoint dedicado para esto
    const data = await this.list(0, 5000);
    const empresasSet = new Set(data.items.map((item) => item.empresa));
    return Array.from(empresasSet).sort();
  }

  /**
   * Obtiene productos filtrados por empresa.
   */
  async getProductosPorEmpresa(
    empresa: string
  ): Promise<{ codigo_producto: string; descripcion: string }[]> {
    const data = await this.list(0, 5000, empresa);
    return data.items.map((item) => ({
      codigo_producto: item.codigo_producto,
      descripcion: item.descripcion,
    }));
  }
}

export const vistaInventariosService = new VistaInventariosService();

