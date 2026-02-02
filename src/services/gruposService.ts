import { API_BASE_URL, fetchWithAuth } from "@/lib/api";
import type { GruposResponse } from "@/types/api";

class GruposService {
  /**
   * Obtiene todos los grupos (Tres, Cuatro y Cinco)
   */
  async getGrupos(): Promise<GruposResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/grupos`);
    if (!response.ok) {
      throw new Error("Error al obtener los grupos");
    }
    return response.json();
  }
}

export const gruposService = new GruposService();
