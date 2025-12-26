import { API_BASE_URL, fetchWithAuth } from '@/lib/api';
import type { User, UserCreate, UserUpdate, ChangePasswordRequest } from '@/types/api';

class UsersService {
  async getUsers(skip = 0, limit = 100, includeInactive = false): Promise<User[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      include_inactive: includeInactive.toString(),
    });

    const response = await fetchWithAuth(`${API_BASE_URL}/users?${params}`);

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    return response.json();
  }

  async getUser(userId: number): Promise<User> {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      throw new Error('Error al obtener usuario');
    }

    return response.json();
  }

  async createUser(user: UserCreate): Promise<User> {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 400) {
        throw new Error('El nombre de usuario ya existe');
      }
      throw new Error(error.detail || 'Error al crear usuario');
    }

    return response.json();
  }

  async updateUser(userId: number, user: UserUpdate): Promise<User> {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al actualizar usuario');
    }

    return response.json();
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al desactivar usuario');
    }

    return response.json();
  }

  async changePassword(userId: number, data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 400) {
        throw new Error('Contraseña actual incorrecta');
      }
      throw new Error(error.detail || 'Error al cambiar contraseña');
    }

    return response.json();
  }
}

export const usersService = new UsersService();
