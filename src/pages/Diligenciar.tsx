import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Send, Clock, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductoProveedor {
  id: string;
  requisicionId: string;
  producto: string;
  unidadMedida: string;
  cantidadSolicitada: number;
  cantidadDespachada: number;
  precioPorUnidad: number;
  fechaSolicitud: string;
  empresa: string;
}

const requisicionesPendientes: ProductoProveedor[] = [
  {
    id: "1",
    requisicionId: "REQ001",
    producto: "Tornillo M8x20",
    unidadMedida: "Unidad",
    cantidadSolicitada: 500,
    cantidadDespachada: 0,
    precioPorUnidad: 0,
    fechaSolicitud: "2024-01-15",
    empresa: "Big Machine Corp"
  },
  {
    id: "2",
    requisicionId: "REQ001",
    producto: "Tuerca M8",
    unidadMedida: "Unidad",
    cantidadSolicitada: 200,
    cantidadDespachada: 0,
    precioPorUnidad: 0,
    fechaSolicitud: "2024-01-15",
    empresa: "Big Machine Corp"
  },
  {
    id: "3",
    requisicionId: "REQ002",
    producto: "Aceite Hidráulico ISO 68",
    unidadMedida: "Litro",
    cantidadSolicitada: 50,
    cantidadDespachada: 0,
    precioPorUnidad: 0,
    fechaSolicitud: "2024-01-16",
    empresa: "Big Machine Corp"
  }
];

export default function Diligenciar() {
  const [productos, setProductos] = useState<ProductoProveedor[]>(requisicionesPendientes);
  const { toast } = useToast();

  const actualizarProducto = (id: string, campo: keyof ProductoProveedor, valor: number) => {
    setProductos(prev => prev.map(p => 
      p.id === id ? { ...p, [campo]: valor } : p
    ));
  };

  const enviarRespuesta = () => {
    // Validar que todos los productos tengan cantidad despachada y precio
    const productosIncompletos = productos.some(p => 
      p.cantidadDespachada <= 0 || p.precioPorUnidad <= 0
    );

    if (productosIncompletos) {
      toast({
        title: "Información incompleta",
        description: "Complete la cantidad despachada y el precio para todos los productos",
        variant: "destructive",
      });
      return;
    }

    // Validar que la cantidad despachada no sea mayor a la solicitada
    const cantidadExcedida = productos.some(p => 
      p.cantidadDespachada > p.cantidadSolicitada
    );

    if (cantidadExcedida) {
      toast({
        title: "Cantidad excedida",
        description: "La cantidad despachada no puede ser mayor a la solicitada",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Respuesta enviada",
      description: "La información ha sido enviada exitosamente",
    });

    // Limpiar o resetear los productos procesados
    setProductos([]);
  };

  const calcularTotalPorProducto = (producto: ProductoProveedor) => {
    return producto.cantidadDespachada * producto.precioPorUnidad;
  };

  const calcularTotalGeneral = () => {
    return productos.reduce((total, p) => total + calcularTotalPorProducto(p), 0);
  };

  const agruparPorRequisicion = () => {
    const agrupados = productos.reduce((acc, producto) => {
      if (!acc[producto.requisicionId]) {
        acc[producto.requisicionId] = [];
      }
      acc[producto.requisicionId].push(producto);
      return acc;
    }, {} as Record<string, ProductoProveedor[]>);
    return agrupados;
  };

  const requisicionesAgrupadas = agruparPorRequisicion();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Diligenciamiento de Requisiciones</h1>
          <p className="text-muted-foreground mt-2">
            Complete la información de despacho y precios para las requisiciones pendientes
          </p>
        </div>

        {/* Información del Proveedor */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Información del Proveedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Proveedor</Label>
                <p className="font-medium text-foreground">Suministros Técnicos XYZ</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                <Badge className="mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Pendiente de completar
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Requisiciones asignadas</Label>
                <p className="font-medium text-foreground">{Object.keys(requisicionesAgrupadas).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {productos.length === 0 ? (
          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="text-center py-12">
              <div className="mb-4">
                <Package className="h-12 w-12 text-muted-foreground mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No hay requisiciones pendientes</h3>
              <p className="text-muted-foreground">
                Todas las requisiciones han sido procesadas exitosamente
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Productos por Requisición */}
            {Object.entries(requisicionesAgrupadas).map(([requisicionId, productosReq]) => (
              <Card key={requisicionId} className="bg-gradient-card shadow-card border-0">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Requisición {requisicionId}</CardTitle>
                      <CardDescription>
                        Fecha de solicitud: {new Date(productosReq[0].fechaSolicitud).toLocaleDateString()}
                        • Empresa: {productosReq[0].empresa}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {productosReq.length} producto{productosReq.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Unidad de Medida</TableHead>
                          <TableHead>Cantidad Solicitada</TableHead>
                          <TableHead>Cantidad a Despachar</TableHead>
                          <TableHead>Precio por Unidad</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productosReq.map((producto) => (
                          <TableRow key={producto.id}>
                            <TableCell className="font-medium">{producto.producto}</TableCell>
                            <TableCell>{producto.unidadMedida}</TableCell>
                            <TableCell>{producto.cantidadSolicitada}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={producto.cantidadDespachada || ""}
                                onChange={(e) => actualizarProducto(producto.id, 'cantidadDespachada', parseInt(e.target.value) || 0)}
                                className="w-24"
                                min="0"
                                max={producto.cantidadSolicitada}
                                placeholder="0"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="relative">
                                <span className="absolute left-3 top-3 text-sm text-muted-foreground">$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={producto.precioPorUnidad || ""}
                                  onChange={(e) => actualizarProducto(producto.id, 'precioPorUnidad', parseFloat(e.target.value) || 0)}
                                  className="w-32 pl-8"
                                  min="0"
                                  placeholder="0.00"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              ${calcularTotalPorProducto(producto).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Resumen y Enviar */}
            <Card className="bg-gradient-card shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Despacho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Total de productos: <span className="font-medium text-foreground">{productos.length}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cantidad total a despachar: <span className="font-medium text-foreground">
                        {productos.reduce((total, p) => total + p.cantidadDespachada, 0)} unidades
                      </span>
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      Valor Total: <span className="text-corporate-primary">${calcularTotalGeneral().toFixed(2)}</span>
                    </p>
                  </div>
                  <Button variant="corporate" size="lg" onClick={enviarRespuesta}>
                    <Send className="h-5 w-5 mr-2" />
                    Enviar Respuesta
                  </Button>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Instrucciones:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Complete la cantidad que puede despachar para cada producto</li>
                    <li>• Ingrese el precio por unidad actual de cada producto</li>
                    <li>• La cantidad despachada no puede exceder la cantidad solicitada</li>
                    <li>• Una vez enviada la respuesta, no podrá modificar la información</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}