import { API_BASE_URL, fetchWithAuth } from '@/lib/api';
import type { ProveedorDropdownItem } from '@/types/api';

class ProveedoresService {
    async getProveedoresDropdown(): Promise<ProveedorDropdownItem[]> {
        const response = await fetchWithAuth(`${API_BASE_URL}/proveedores/dropdown`);

        if (!response.ok) {
            throw new Error('Error al obtener proveedores');
        }

        return response.json();
    }
}

export const proveedoresService = new ProveedoresService();
