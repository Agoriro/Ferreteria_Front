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
import { Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductoRequisicion {
  id: string;
  proveedor: string;
  cantidad: number;
  empresa: string;
  producto: string;
  unidadMedida: string;
  grupo3: string;
  grupo4: string;
  grupo5: string;
  valorUnitario: number;
  existencias: number;
}

const proveedores = [
  "Proveedor Industrial ABC",
  "Suministros Técnicos XYZ", 
  "Materiales del Norte",
  "Distribuidora Central"
];

const productosDisponibles = [
  {
    producto: "Tornillo M8x20",
    unidadMedida: "Unidad",
    grupo3: "Ferretería",
    grupo4: "Tornillería",
    grupo5: "Métrica",
    valorUnitario: 0.25,
    existencias: 1500
  },
  {
    producto: "Tuerca M8",
    unidadMedida: "Unidad", 
    grupo3: "Ferretería",
    grupo4: "Tornillería",
    grupo5: "Métrica",
    valorUnitario: 0.15,
    existencias: 800
  },
  {
    producto: "Aceite Hidráulico ISO 68",
    unidadMedida: "Litro",
    grupo3: "Lubricantes",
    grupo4: "Hidráulicos",
    grupo5: "Sintético",
    valorUnitario: 12.50,
    existencias: 200
  }
];

export default function Requisiciones() {
  const [productos, setProductos] = useState<ProductoRequisicion[]>([]);
  const [empresa] = useState("Big Machine Corp");
  const { toast } = useToast();

  const agregarProducto = () => {
    const nuevoProducto: ProductoRequisicion = {
      id: Date.now().toString(),
      proveedor: "",
      cantidad: 0,
      empresa: empresa,
      producto: "",
      unidadMedida: "",
      grupo3: "",
      grupo4: "",
      grupo5: "",
      valorUnitario: 0,
      existencias: 0
    };

    setProductos(prev => [...prev, nuevoProducto]);
  };

  const eliminarProducto = (id: string) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  const actualizarProducto = (id: string, campo: keyof ProductoRequisicion, valor: any) => {
    setProductos(prev => prev.map(p => {
      if (p.id === id) {
        const actualizado = { ...p, [campo]: valor };
        
        // Si se selecciona un producto, autocompletar campos
        if (campo === 'producto') {
          const productoInfo = productosDisponibles.find(prod => prod.producto === valor);
          if (productoInfo) {
            return {
              ...actualizado,
              unidadMedida: productoInfo.unidadMedida,
              grupo3: productoInfo.grupo3,
              grupo4: productoInfo.grupo4,
              grupo5: productoInfo.grupo5,
              valorUnitario: productoInfo.valorUnitario,
              existencias: productoInfo.existencias
            };
          }
        }
        
        return actualizado;
      }
      return p;
    }));
  };

  const guardarRequisicion = () => {
    if (productos.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un producto a la requisición",
        variant: "destructive",
      });
      return;
    }

    const productosIncompletos = productos.some(p => !p.proveedor || !p.producto || p.cantidad <= 0);
    if (productosIncompletos) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos (proveedor, producto, cantidad)",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Requisición guardada",
      description: `Se guardó la requisición con ${productos.length} productos`,
    });

    // Limpiar formulario
    setProductos([]);
  };

  const calcularTotal = () => {
    return productos.reduce((total, p) => total + (p.cantidad * p.valorUnitario), 0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Generación de Requisiciones de Compra</h1>
          <p className="text-muted-foreground mt-2">
            Crea nuevas requisiciones de compra especificando productos y proveedores
          </p>
        </div>

        {/* Información de la Empresa */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Empresa</Label>
                <Input value={empresa} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Fecha de Requisición</Label>
                <Input value={new Date().toLocaleDateString()} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Estado</Label>
                <Input value="Borrador" disabled className="bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productos de la Requisición */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Productos Solicitados</CardTitle>
              <CardDescription>
                Agregue los productos necesarios para esta requisición
              </CardDescription>
            </div>
            <Button variant="corporate" onClick={agregarProducto}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </CardHeader>
          <CardContent>
            {productos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No hay productos agregados</p>
                <p className="text-sm">Haga clic en "Agregar Producto" para comenzar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>U. Medida</TableHead>
                      <TableHead>Grupo 3</TableHead>
                      <TableHead>Grupo 4</TableHead>
                      <TableHead>Grupo 5</TableHead>
                      <TableHead>Valor Unit.</TableHead>
                      <TableHead>Existencias</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productos.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell>
                          <Select
                            value={producto.proveedor}
                            onValueChange={(value) => actualizarProducto(producto.id, 'proveedor', value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {proveedores.map((prov) => (
                                <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={producto.cantidad || ""}
                            onChange={(e) => actualizarProducto(producto.id, 'cantidad', parseInt(e.target.value) || 0)}
                            className="w-24"
                            min="1"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={producto.producto}
                            onValueChange={(value) => actualizarProducto(producto.id, 'producto', value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {productosDisponibles.map((prod) => (
                                <SelectItem key={prod.producto} value={prod.producto}>
                                  {prod.producto}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input value={producto.unidadMedida} disabled className="w-20 bg-muted" />
                        </TableCell>
                        <TableCell>
                          <Input value={producto.grupo3} disabled className="w-24 bg-muted" />
                        </TableCell>
                        <TableCell>
                          <Input value={producto.grupo4} disabled className="w-24 bg-muted" />
                        </TableCell>
                        <TableCell>
                          <Input value={producto.grupo5} disabled className="w-24 bg-muted" />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={producto.valorUnitario.toFixed(2)}
                            disabled 
                            className="w-24 bg-muted"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={producto.existencias}
                            disabled 
                            className="w-24 bg-muted"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          ${(producto.cantidad * producto.valorUnitario).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => eliminarProducto(producto.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen y Guardar */}
        {productos.length > 0 && (
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de la Requisición</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Total de productos: <span className="font-medium text-foreground">{productos.length}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total de unidades: <span className="font-medium text-foreground">
                      {productos.reduce((total, p) => total + p.cantidad, 0)}
                    </span>
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    Valor Total: <span className="text-corporate-primary">${calcularTotal().toFixed(2)}</span>
                  </p>
                </div>
                <Button variant="corporate" size="lg" onClick={guardarRequisicion}>
                  <Save className="h-5 w-5 mr-2" />
                  Guardar Requisición
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}