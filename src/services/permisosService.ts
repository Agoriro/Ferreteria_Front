import { API_BASE_URL, fetchWithAuth } from '@/lib/api';
import type { PermisosResponse } from '@/types/api';

class PermisosService {
    async getFormulariosPorRol(nombreRol: string): Promise<PermisosResponse> {
        const response = await fetchWithAuth(
            `${API_BASE_URL}/permisos/formularios/${encodeURIComponent(nombreRol)}`
        );

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('No autorizado');
            }
            if (response.status === 403) {
                throw new Error('Usuario inactivo');
            }
            throw new Error('Error al obtener permisos');
        }

        return response.json();
    }
}

export const permisosService = new PermisosService();
