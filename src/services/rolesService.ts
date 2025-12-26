import { API_BASE_URL, fetchWithAuth } from '@/lib/api';
import type { Role, RoleCreate, RoleUpdate } from '@/types/api';

class RolesService {
  async getRoles(): Promise<Role[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/roles/`);

    if (!response.ok) {
      throw new Error('Error al obtener roles');
    }

    return response.json();
  }

  async getRole(roleId: number): Promise<Role> {
    const response = await fetchWithAuth(`${API_BASE_URL}/roles/${roleId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Rol no encontrado');
      }
      throw new Error('Error al obtener rol');
    }

    return response.json();
  }

  async createRole(role: RoleCreate): Promise<Role> {
    const response = await fetchWithAuth(`${API_BASE_URL}/roles/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(role),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al crear rol');
    }

    return response.json();
  }

  async updateRole(roleId: number, role: RoleUpdate): Promise<Role> {
    const response = await fetchWithAuth(`${API_BASE_URL}/roles/${roleId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(role),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al actualizar rol');
    }

    return response.json();
  }
}

export const rolesService = new RolesService();
