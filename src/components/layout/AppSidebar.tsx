import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  ShoppingCart,
  FileText,
  Download,
  BarChart3,
  LogOut,
  Building2,
  PackageX,
  CalendarDays,
  ClipboardList,
  Loader2
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePermisos } from "@/contexts/PermisosContext";

// Mapeo de URLs a nombres de formularios del backend
const urlToFormularioMap: Record<string, string> = {
  "/usuarios": "Administración de usuarios",
  "/inventario-excluido": "Inventario Excluido",
  "/dias-entrega-proveedor": "Días Entrega Proveedor",
  "/sugerido-compras": "Sugerido de compras",
  "/requisiciones": "Requisición de compras",
  "/diligenciar": "Requisición de compras", // Diligenciar es parte de requisiciones
  "/exportar": "Exportar Requisiciones",
  "/reportes": "Reportes",
};

const navigationItems = [
  {
    title: "Administración de Usuarios",
    url: "/usuarios",
    icon: Users,
  },
  {
    title: "Inventario Excluido",
    url: "/inventario-excluido",
    icon: PackageX,
  },
  {
    title: "Días Entrega Proveedor",
    url: "/dias-entrega-proveedor",
    icon: CalendarDays,
  },
  {
    title: "Sugerido de Compras",
    url: "/sugerido-compras",
    icon: ClipboardList,
  },
  {
    title: "Requisiciones de Compra",
    url: "/requisiciones",
    icon: ShoppingCart,
  },
  {
    title: "Exportar Requisiciones",
    url: "/exportar",
    icon: Download,
  },
  {
    title: "Reportes",
    url: "/reportes",
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { formularios, isLoading } = usePermisos();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  // Filtrar items de navegación según permisos
  const filteredNavigationItems = navigationItems.filter(item => {
    const nombreFormulario = urlToFormularioMap[item.url];
    if (!nombreFormulario) return true; // Si no hay mapeo, mostrar por defecto

    // Verificar si el formulario está en la lista de permisos
    return formularios.some(
      f => f.nombre_formulario.toLowerCase() === nombreFormulario.toLowerCase() && f.puede_leer
    );
  });

  return (
    <Sidebar
      className="bg-gradient-sidebar border-r border-sidebar-border transition-all duration-300"
      collapsible="icon"
    >
      <SidebarHeader className={`border-b border-sidebar-border ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className={`${isCollapsed ? 'p-1.5' : 'p-2'} bg-corporate-primary rounded-lg`}>
            <Building2 className={`${isCollapsed ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">Big Machine</h2>
              <p className="text-xs text-sidebar-foreground/70">Sistema Corporativo</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={`${isCollapsed ? 'px-1' : 'px-3'} py-4`}>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider mb-2">
            {!isCollapsed ? "Módulos" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-sidebar-foreground/60" />
              </div>
            ) : (
              <SidebarMenu className="space-y-1">
                {filteredNavigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-auto p-0">
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg transition-corporate ${getNavCls({ isActive })}`
                        }
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="text-sm font-medium leading-tight whitespace-normal">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          className={`text-sidebar-foreground hover:bg-destructive hover:text-white ${isCollapsed ? 'justify-center' : 'justify-start'} w-full`}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
