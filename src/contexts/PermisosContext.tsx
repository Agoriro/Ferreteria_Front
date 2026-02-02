import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { permisosService } from '@/services/permisosService';
import { rolesService } from '@/services/rolesService';
import { useAuth } from '@/contexts/AuthContext';
import type { FormularioPermiso } from '@/types/api';

interface PermisosContextType {
    formularios: FormularioPermiso[];
    isLoading: boolean;
    error: string | null;
    tieneAcceso: (nombreFormulario: string) => boolean;
    tieneAccesoRuta: (ruta: string) => boolean;
    puedeCrear: (nombreFormulario: string) => boolean;
    puedeEditar: (nombreFormulario: string) => boolean;
    puedeEliminar: (nombreFormulario: string) => boolean;
    recargarPermisos: () => Promise<void>;
}

const PermisosContext = createContext<PermisosContextType | undefined>(undefined);

export function PermisosProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const [formularios, setFormularios] = useState<FormularioPermiso[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cargarPermisos = useCallback(async () => {
        if (!user || !isAuthenticated) {
            setFormularios([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Obtener el nombre del rol del usuario
            const rol = await rolesService.getRole(user.rol_id);
            const nombreRol = rol.nombre_rol;

            // Obtener formularios permitidos para el rol
            const response = await permisosService.getFormulariosPorRol(nombreRol);
            setFormularios(response.formularios);
        } catch (err) {
            console.error('Error al cargar permisos:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar permisos');
            setFormularios([]);
        } finally {
            setIsLoading(false);
        }
    }, [user, isAuthenticated]);

    // Cargar permisos cuando el usuario cambia
    useEffect(() => {
        if (isAuthenticated && user) {
            cargarPermisos();
        } else {
            setFormularios([]);
        }
    }, [isAuthenticated, user, cargarPermisos]);

    // Verificar si tiene acceso a un formulario por nombre
    const tieneAcceso = useCallback((nombreFormulario: string): boolean => {
        return formularios.some(
            f => f.nombre_formulario.toLowerCase() === nombreFormulario.toLowerCase() && f.puede_leer
        );
    }, [formularios]);

    // Verificar si tiene acceso a una ruta
    const tieneAccesoRuta = useCallback((ruta: string): boolean => {
        return formularios.some(
            f => f.ruta === ruta && f.puede_leer
        );
    }, [formularios]);

    // Verificar permisos específicos
    const puedeCrear = useCallback((nombreFormulario: string): boolean => {
        const form = formularios.find(
            f => f.nombre_formulario.toLowerCase() === nombreFormulario.toLowerCase()
        );
        return form?.puede_crear ?? false;
    }, [formularios]);

    const puedeEditar = useCallback((nombreFormulario: string): boolean => {
        const form = formularios.find(
            f => f.nombre_formulario.toLowerCase() === nombreFormulario.toLowerCase()
        );
        return form?.puede_editar ?? false;
    }, [formularios]);

    const puedeEliminar = useCallback((nombreFormulario: string): boolean => {
        const form = formularios.find(
            f => f.nombre_formulario.toLowerCase() === nombreFormulario.toLowerCase()
        );
        return form?.puede_eliminar ?? false;
    }, [formularios]);

    return (
        <PermisosContext.Provider
            value={{
                formularios,
                isLoading,
                error,
                tieneAcceso,
                tieneAccesoRuta,
                puedeCrear,
                puedeEditar,
                puedeEliminar,
                recargarPermisos: cargarPermisos
            }}
        >
            {children}
        </PermisosContext.Provider>
    );
}

export function usePermisos() {
    const context = useContext(PermisosContext);
    if (context === undefined) {
        throw new Error('usePermisos must be used within a PermisosProvider');
    }
    return context;
}
