import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ShoppingCart, 
  FileText, 
  Download, 
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const quickStats = [
  {
    title: "Usuarios Activos",
    value: "127",
    change: "+12%",
    icon: Users,
    color: "text-corporate-primary",
    bgColor: "bg-corporate-primary/10"
  },
  {
    title: "Requisiciones Pendientes",
    value: "24",
    change: "-8%",
    icon: Clock,
    color: "text-corporate-accent",
    bgColor: "bg-corporate-accent/10"
  },
  {
    title: "Compras Completadas",
    value: "89",
    change: "+15%",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    title: "Reportes Generados",
    value: "156",
    change: "+23%",
    icon: TrendingUp,
    color: "text-corporate-primary",
    bgColor: "bg-corporate-primary/10"
  }
];

const quickActions = [
  {
    title: "Gestionar Usuarios",
    description: "Crear, editar y administrar usuarios del sistema",
    icon: Users,
    path: "/usuarios",
    color: "bg-corporate-primary"
  },
  {
    title: "Nueva Requisición",
    description: "Generar una nueva requisición de compra",
    icon: ShoppingCart,
    path: "/requisiciones",
    color: "bg-corporate-accent"
  },
  {
    title: "Diligenciar Requisiciones",
    description: "Completar requisiciones pendientes de proveedores",
    icon: FileText,
    path: "/diligenciar",
    color: "bg-corporate-medium"
  },
  {
    title: "Generar Reporte",
    description: "Crear reportes detallados del sistema",
    icon: BarChart3,
    path: "/reportes",
    color: "bg-corporate-primary"
  }
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-primary text-white rounded-xl p-6 shadow-corporate">
          <h1 className="text-2xl font-bold mb-2">Panel de Control - Big Machine</h1>
          <p className="text-white/90">
            Gestiona eficientemente todos los procesos corporativos desde un solo lugar
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat) => (
            <Card key={stat.title} className="bg-gradient-card shadow-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className={`text-sm font-medium mt-1 ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-corporate-primary'
                    }`}>
                      {stat.change} vs mes anterior
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Card key={action.title} className="bg-gradient-card shadow-card border-0 hover:shadow-lg transition-corporate cursor-pointer"
                  onClick={() => navigate(action.path)}>
              <CardHeader className="pb-4">
                <div className={`p-3 rounded-lg ${action.color} w-fit mb-3`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {action.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="corporate-outline" size="sm" className="w-full">
                  Acceder
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Nueva requisición creada", user: "María González", time: "Hace 2 horas", type: "create" },
                { action: "Usuario editado", user: "Carlos Rodríguez", time: "Hace 4 horas", type: "edit" },
                { action: "Reporte generado", user: "Ana Martín", time: "Hace 6 horas", type: "report" },
                { action: "Requisición completada", user: "Luis Pérez", time: "Hace 1 día", type: "complete" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'create' ? 'bg-corporate-primary/10' :
                    activity.type === 'edit' ? 'bg-corporate-accent/10' :
                    activity.type === 'report' ? 'bg-corporate-medium/10' :
                    'bg-green-100'
                  }`}>
                    {activity.type === 'create' && <ShoppingCart className="h-4 w-4 text-corporate-primary" />}
                    {activity.type === 'edit' && <Users className="h-4 w-4 text-corporate-accent" />}
                    {activity.type === 'report' && <BarChart3 className="h-4 w-4 text-corporate-medium" />}
                    {activity.type === 'complete' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">Por {activity.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}