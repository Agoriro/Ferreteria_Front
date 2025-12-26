import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileSpreadsheet, Clock, Package, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RequisicionPendiente {
  id: string;
  fecha: string;
  proveedor: string;
  empresa: string;
  totalProductos: number;
  valorTotal: number;
  estado: "Completada" | "Parcial" | "Pendiente";
  productos: {
    producto: string;
    cantidadSolicitada: number;
    cantidadDespachada: number;
    valorUnitario: number;
  }[];
}

const requisicionesPendientes: RequisicionPendiente[] = [
  {
    id: "REQ001",
    fecha: "2024-01-15",
    proveedor: "Proveedor Industrial ABC",
    empresa: "Big Machine Corp",
    totalProductos: 2,
    valorTotal: 155.00,
    estado: "Completada",
    productos: [
      {
        producto: "Tornillo M8x20",
        cantidadSolicitada: 500,
        cantidadDespachada: 500,
        valorUnitario: 0.25
      },
      {
        producto: "Tuerca M8",
        cantidadSolicitada: 200,
        cantidadDespachada: 200,
        valorUnitario: 0.15
      }
    ]
  },
  {
    id: "REQ002",
    fecha: "2024-01-16",
    proveedor: "Suministros Técnicos XYZ",
    empresa: "Big Machine Corp",
    totalProductos: 1,
    valorTotal: 625.00,
    estado: "Completada",
    productos: [
      {
        producto: "Aceite Hidráulico ISO 68",
        cantidadSolicitada: 50,
        cantidadDespachada: 50,
        valorUnitario: 12.50
      }
    ]
  },
  {
    id: "REQ003",
    fecha: "2024-01-17",
    proveedor: "Materiales del Norte",
    empresa: "Big Machine Corp",
    totalProductos: 3,
    valorTotal: 420.50,
    estado: "Parcial",
    productos: [
      {
        producto: "Rodamiento 6205",
        cantidadSolicitada: 20,
        cantidadDespachada: 15,
        valorUnitario: 18.50
      },
      {
        producto: "Correa A-50",
        cantidadSolicitada: 10,
        cantidadDespachada: 8,
        valorUnitario: 25.00
      },
      {
        producto: "Filtro de aceite",
        cantidadSolicitada: 5,
        cantidadDespachada: 5,
        valorUnitario: 35.00
      }
    ]
  },
  {
    id: "REQ004",
    fecha: "2024-01-18",
    proveedor: "Distribuidora Central",
    empresa: "Big Machine Corp",
    totalProductos: 2,
    valorTotal: 890.00,
    estado: "Pendiente",
    productos: [
      {
        producto: "Motor eléctrico 2HP",
        cantidadSolicitada: 2,
        cantidadDespachada: 0,
        valorUnitario: 350.00
      },
      {
        producto: "Variador de frecuencia",
        cantidadSolicitada: 1,
        cantidadDespachada: 0,
        valorUnitario: 190.00
      }
    ]
  }
];

export default function Exportar() {
  const [requisicionesSeleccionadas, setRequisicionesSeleccionadas] = useState<string[]>([]);
  const [todasSeleccionadas, setTodasSeleccionadas] = useState(false);
  const { toast } = useToast();

  const toggleRequisicion = (id: string) => {
    setRequisicionesSeleccionadas(prev => {
      const nuevasSeleccionadas = prev.includes(id)
        ? prev.filter(reqId => reqId !== id)
        : [...prev, id];
      
      setTodasSeleccionadas(nuevasSeleccionadas.length === requisicionesPendientes.length);
      return nuevasSeleccionadas;
    });
  };

  const toggleTodasRequisiciones = () => {
    if (todasSeleccionadas) {
      setRequisicionesSeleccionadas([]);
      setTodasSeleccionadas(false);
    } else {
      setRequisicionesSeleccionadas(requisicionesPendientes.map(req => req.id));
      setTodasSeleccionadas(true);
    }
  };

  const generarExcel = () => {
    if (requisicionesSeleccionadas.length === 0) {
      toast({
        title: "Selección requerida",
        description: "Debe seleccionar al menos una requisición para exportar",
        variant: "destructive",
      });
      return;
    }

    const requisicionesExportar = requisicionesPendientes.filter(req => 
      requisicionesSeleccionadas.includes(req.id)
    );

    toast({
      title: "Generando archivo Excel",
      description: `Exportando ${requisicionesExportar.length} requisiciones. El archivo se descargará automáticamente.`,
    });

    // Aquí iría la lógica real de generación del archivo Excel
    // Por ahora simularemos el proceso
    setTimeout(() => {
      toast({
        title: "Exportación completada",
        description: "El archivo Excel ha sido descargado exitosamente",
      });
    }, 2000);
  };

  const getBadgeVariant = (estado: RequisicionPendiente["estado"]) => {
    switch (estado) {
      case "Completada":
        return "default";
      case "Parcial":
        return "secondary";
      case "Pendiente":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getEstadoIcon = (estado: RequisicionPendiente["estado"]) => {
    switch (estado) {
      case "Completada":
        return <Check className="h-3 w-3" />;
      case "Parcial":
        return <Package className="h-3 w-3" />;
      case "Pendiente":
        return <Clock className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const calcularTotalSeleccionadas = () => {
    return requisicionesPendientes
      .filter(req => requisicionesSeleccionadas.includes(req.id))
      .reduce((total, req) => total + req.valorTotal, 0);
  };

  const calcularProductosSeleccionados = () => {
    return requisicionesPendientes
      .filter(req => requisicionesSeleccionadas.includes(req.id))
      .reduce((total, req) => total + req.totalProductos, 0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exportar Requisiciones Pendientes</h1>
          <p className="text-muted-foreground mt-2">
            Selecciona las requisiciones que deseas exportar a Excel con toda la información consolidada
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-corporate-primary/10 rounded-lg">
                  <FileSpreadsheet className="h-5 w-5 text-corporate-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Requisiciones</p>
                  <p className="text-2xl font-bold text-foreground">{requisicionesPendientes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-corporate-accent/10 rounded-lg">
                  <Check className="h-5 w-5 text-corporate-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {requisicionesPendientes.filter(r => r.estado === "Completada").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-corporate-medium/10 rounded-lg">
                  <Package className="h-5 w-5 text-corporate-medium" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Seleccionadas</p>
                  <p className="text-2xl font-bold text-foreground">{requisicionesSeleccionadas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Download className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${calcularTotalSeleccionadas().toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Requisiciones */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Requisiciones Disponibles para Exportar</CardTitle>
              <CardDescription>
                Selecciona las requisiciones que deseas incluir en el archivo Excel
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="corporate-outline" 
                onClick={toggleTodasRequisiciones}
                size="sm"
              >
                {todasSeleccionadas ? "Deseleccionar Todas" : "Seleccionar Todas"}
              </Button>
              <Button 
                variant="corporate" 
                onClick={generarExcel}
                disabled={requisicionesSeleccionadas.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Generar Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={todasSeleccionadas}
                        onCheckedChange={toggleTodasRequisiciones}
                      />
                    </TableHead>
                    <TableHead>ID Requisición</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Progreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requisicionesPendientes.map((requisicion) => (
                    <TableRow key={requisicion.id}>
                      <TableCell>
                        <Checkbox
                          checked={requisicionesSeleccionadas.includes(requisicion.id)}
                          onCheckedChange={() => toggleRequisicion(requisicion.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{requisicion.id}</TableCell>
                      <TableCell>{new Date(requisicion.fecha).toLocaleDateString()}</TableCell>
                      <TableCell>{requisicion.proveedor}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{requisicion.totalProductos} productos</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(requisicion.estado)} className="gap-1">
                          {getEstadoIcon(requisicion.estado)}
                          {requisicion.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">${requisicion.valorTotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="text-sm text-muted-foreground">
                            {requisicion.productos.reduce((desp, prod) => desp + prod.cantidadDespachada, 0)} / {" "}
                            {requisicion.productos.reduce((sol, prod) => sol + prod.cantidadSolicitada, 0)} unidades
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-corporate-primary h-2 rounded-full transition-all"
                              style={{
                                width: `${
                                  (requisicion.productos.reduce((desp, prod) => desp + prod.cantidadDespachada, 0) /
                                  requisicion.productos.reduce((sol, prod) => sol + prod.cantidadSolicitada, 0)) * 100
                                }%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de Exportación */}
        {requisicionesSeleccionadas.length > 0 && (
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Exportación</CardTitle>
              <CardDescription>
                Información consolidada de las requisiciones seleccionadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-corporate-primary">
                    {requisicionesSeleccionadas.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Requisiciones seleccionadas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-corporate-accent">
                    {calcularProductosSeleccionados()}
                  </p>
                  <p className="text-sm text-muted-foreground">Productos totales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-corporate-primary">
                    ${calcularTotalSeleccionadas().toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Valor total consolidado</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>El archivo Excel incluirá:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Información detallada de cada requisición</li>
                  <li>• Lista completa de productos con cantidades y precios</li>
                  <li>• Datos de proveedores y fechas de solicitud</li>
                  <li>• Totales consolidados por requisición y general</li>
                  <li>• Estado de cumplimiento de cada producto</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}