import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <header className="h-14 shrink-0 border-b bg-card shadow-card px-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="shrink-0" />
              <h1 className="text-lg font-semibold text-foreground truncate">Sistema de Gestión Corporativa</h1>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                Bienvenido, <span className="font-medium text-foreground">
                  {user ? `${user.nombres} ${user.apellidos}` : 'Usuario'}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 bg-muted/30 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
