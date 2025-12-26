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
  CalendarDays
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
    title: "Requisiciones de Compra",
    url: "/requisiciones",
    icon: ShoppingCart,
  },
  {
    title: "Diligenciar Requisiciones",
    url: "/diligenciar",
    icon: FileText,
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

  return (
    <Sidebar
      className={`bg-gradient-sidebar border-r border-sidebar-border ${
        isCollapsed ? "w-16" : "w-64"
      } transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-corporate-primary rounded-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">Big Machine</h2>
              <p className="text-xs text-sidebar-foreground/70">Sistema Corporativo</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider mb-2">
            {!isCollapsed ? "Módulos" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0">
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-3 rounded-lg transition-corporate ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="text-sm font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <Button 
          variant="ghost" 
          size={isCollapsed ? "icon" : "default"}
          className="text-sidebar-foreground hover:bg-destructive hover:text-white justify-start w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
