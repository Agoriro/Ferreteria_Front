import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileSpreadsheet, FileText, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReporteData {
  id: string;
  fecha: string;
  proveedor: string;
  producto: string;
  cantidad: number;
  valorUnitario: number;
  total: number;
  estado: "Completado" | "Pendiente" | "Cancelado";
}

const reportesData: ReporteData[] = [
  {
    id: "REQ001",
    fecha: "2024-01-15",
    proveedor: "Proveedor Industrial ABC",
    producto: "Tornillo M8x20",
    cantidad: 500,
    valorUnitario: 0.25,
    total: 125.00,
    estado: "Completado"
  },
  {
    id: "REQ002", 
    fecha: "2024-01-16",
    proveedor: "Suministros Técnicos XYZ",
    producto: "Aceite Hidráulico ISO 68",
    cantidad: 50,
    valorUnitario: 12.50,
    total: 625.00,
    estado: "Pendiente"
  },
  {
    id: "REQ003",
    fecha: "2024-01-17",
    proveedor: "Materiales del Norte",
    producto: "Tuerca M8",
    cantidad: 200,
    valorUnitario: 0.15,
    total: 30.00,
    estado: "Completado"
  },
  {
    id: "REQ004",
    fecha: "2024-01-18",
    proveedor: "Distribuidora Central",
    producto: "Tornillo M8x20",
    cantidad: 300,
    valorUnitario: 0.25,
    total: 75.00,
    estado: "Cancelado"
  }
];

const tiposReporte = [
  { value: "requisiciones", label: "Reporte de Requisiciones" },
  { value: "proveedores", label: "Reporte por Proveedores" },
  { value: "productos", label: "Reporte por Productos" }
];

const proveedores = [
  "Todos los proveedores",
  "Proveedor Industrial ABC",
  "Suministros Técnicos XYZ", 
  "Materiales del Norte",
  "Distribuidora Central"
];

export default function Reportes() {
  const [filtros, setFiltros] = useState({
    fechaInicial: "",
    fechaFinal: "",
    proveedor: "",
    tipoReporte: ""
  });
  const [datosReporte, setDatosReporte] = useState<ReporteData[]>([]);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const { toast } = useToast();

  const generarReporte = () => {
    if (!filtros.fechaInicial || !filtros.fechaFinal || !filtros.tipoReporte) {
      toast({
        title: "Campos requeridos",
        description: "Por favor complete las fechas y seleccione el tipo de reporte",
        variant: "destructive",
      });
      return;
    }

    // Filtrar datos según los criterios
    let datosFiltrados = [...reportesData];

    // Filtrar por fechas
    datosFiltrados = datosFiltrados.filter(item => {
      const fechaItem = new Date(item.fecha);
      const fechaInicio = new Date(filtros.fechaInicial);
      const fechaFin = new Date(filtros.fechaFinal);
      return fechaItem >= fechaInicio && fechaItem <= fechaFin;
    });

    // Filtrar por proveedor si se seleccionó uno específico
    if (filtros.proveedor && filtros.proveedor !== "Todos los proveedores") {
      datosFiltrados = datosFiltrados.filter(item => item.proveedor === filtros.proveedor);
    }

    setDatosReporte(datosFiltrados);
    setMostrarReporte(true);

    toast({
      title: "Reporte generado",
      description: `Se encontraron ${datosFiltrados.length} registros`,
    });
  };

  const exportarExcel = () => {
    toast({
      title: "Exportando a Excel",
      description: "El archivo se descargará automáticamente",
    });
  };

  const exportarPDF = () => {
    toast({
      title: "Exportando a PDF",
      description: "El archivo se descargará automáticamente",
    });
  };

  const getBadgeVariant = (estado: ReporteData["estado"]) => {
    switch (estado) {
      case "Completado":
        return "default";
      case "Pendiente":
        return "secondary";
      case "Cancelado":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const calcularTotalReporte = () => {
    return datosReporte.reduce((total, item) => total + item.total, 0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground mt-2">
            Genere reportes detallados con filtros personalizados
          </p>
        </div>

        {/* Filtros */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
            <CardDescription>
              Configure los parámetros para generar el reporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="fechaInicial">Fecha Inicial</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fechaInicial"
                    type="date"
                    value={filtros.fechaInicial}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fechaInicial: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="fechaFinal">Fecha Final</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fechaFinal"
                    type="date"
                    value={filtros.fechaFinal}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fechaFinal: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="proveedor">Proveedor</Label>
                <Select 
                  value={filtros.proveedor} 
                  onValueChange={(value) => setFiltros(prev => ({ ...prev, proveedor: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((prov) => (
                      <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipoReporte">Tipo de Informe</Label>
                <Select 
                  value={filtros.tipoReporte} 
                  onValueChange={(value) => setFiltros(prev => ({ ...prev, tipoReporte: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de reporte" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposReporte.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="corporate" onClick={generarReporte}>
                <Search className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
              {mostrarReporte && (
                <>
                  <Button variant="corporate-outline" onClick={exportarExcel}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                  <Button variant="corporate-outline" onClick={exportarPDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resultados del Reporte */}
        {mostrarReporte && (
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {tiposReporte.find(t => t.value === filtros.tipoReporte)?.label || "Resultados del Reporte"}
                </CardTitle>
                <CardDescription>
                  {datosReporte.length} registros encontrados
                  {filtros.fechaInicial && filtros.fechaFinal && 
                    ` desde ${filtros.fechaInicial} hasta ${filtros.fechaFinal}`
                  }
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total General</p>
                <p className="text-xl font-bold text-corporate-primary">
                  ${calcularTotalReporte().toFixed(2)}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Requisición</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Valor Unitario</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datosReporte.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{new Date(item.fecha).toLocaleDateString()}</TableCell>
                        <TableCell>{item.proveedor}</TableCell>
                        <TableCell>{item.producto}</TableCell>
                        <TableCell>{item.cantidad}</TableCell>
                        <TableCell>${item.valorUnitario.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">${item.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(item.estado)}>
                            {item.estado}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {datosReporte.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No se encontraron registros con los filtros aplicados</p>
                  <p className="text-sm">Intente modificar los criterios de búsqueda</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}