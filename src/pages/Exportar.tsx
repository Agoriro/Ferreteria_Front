import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Download, FileSpreadsheet, Package, Loader2, RefreshCcw, ArrowUpDown, ArrowUp, ArrowDown, XCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sugeridoComprasService } from "@/services/sugeridoComprasService";
import type { SugeridoCompras } from "@/types/api";

type SortField = "empresa" | "proveedor" | null;
type SortDirection = "asc" | "desc" | null;

export default function Exportar() {
  const [sugeridos, setSugeridos] = useState<SugeridoCompras[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [todosSeleccionados, setTodosSeleccionados] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const { toast } = useToast();

  // Cargar datos del endpoint
  const cargarDatos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sugeridoComprasService.getProcessed();
      setSugeridos(response.items);
      setSeleccionados([]);
      setTodosSeleccionados(false);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al cargar los datos";
      setError(mensaje);
      toast({
        title: "Error",
        description: mensaje,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const toggleSeleccion = (id: string) => {
    setSeleccionados(prev => {
      const nuevosSeleccionados = prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id];

      setTodosSeleccionados(nuevosSeleccionados.length === sugeridos.length && sugeridos.length > 0);
      return nuevosSeleccionados;
    });
  };

  const toggleTodos = () => {
    if (todosSeleccionados) {
      setSeleccionados([]);
      setTodosSeleccionados(false);
    } else {
      setSeleccionados(sugeridos.map(s => s.id));
      setTodosSeleccionados(true);
    }
  };

  const generarExcel = async () => {
    if (seleccionados.length === 0) {
      toast({
        title: "Selección requerida",
        description: "Debe seleccionar al menos un registro para exportar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      toast({
        title: "Procesando exportación",
        description: `Exportando ${seleccionados.length} registros...`,
      });

      // Llamar al endpoint bulk-export
      const response = await sugeridoComprasService.bulkExport(seleccionados);

      // Importar xlsx dinámicamente
      const XLSX = await import("xlsx");

      // Generar filas para el Excel (una fila por cada encabezado + detalle)
      const rows: Record<string, unknown>[] = [];

      for (const orden of response.ordenes_compra) {
        const encab = orden.encabezado;
        for (const det of orden.detalles) {
          // Crear una fila combinando encabezado + detalle
          rows.push({
            // Encabezado
            "Encab: Empresa": encab.empresa,
            "Encab: Tipo Documento": encab.tipo_documento,
            "Encab: Prefijo": encab.prefijo,
            "Encab: Documento Numero": encab.documento_numero,
            "Encab: Fecha": encab.fecha,
            "Encab: Tercero Interno": encab.tercero_interno,
            "Encab: Tercero Externo": encab.tercero_externo,
            "Encab: Pref Dto Ext": encab.prefijo_dto_ext,
            "Encab: No. Dto Ext": encab.numero_dto_ext,
            "Encab: Nota": encab.nota,
            "Encab: Forma Pago": encab.forma_pago,
            "Encab: Verificado": encab.verificado,
            "Encab: Anulado": encab.anulado,
            "Encab: Fecha Emision": encab.fecha_emision,
            "Encab: Personalizado 1": encab.personalizado_1,
            "Encab: Personalizado 2": encab.personalizado_2,
            "Encab: Personalizado 3": encab.personalizado_3,
            "Encab: Personalizado 4": encab.personalizado_4,
            "Encab: Personalizado 5": encab.personalizado_5,
            "Encab: Personalizado 6": encab.personalizado_6,
            "Encab: Personalizado 7": encab.personalizado_7,
            "Encab: Personalizado 8": encab.personalizado_8,
            "Encab: Personalizado 9": encab.personalizado_9,
            "Encab: Personalizado 10": encab.personalizado_10,
            "Encab: Personalizado 11": encab.personalizado_11,
            "Encab: Personalizado 12": encab.personalizado_12,
            "Encab: Personalizado 13": encab.personalizado_13,
            "Encab: Personalizado 14": encab.personalizado_14,
            "Encab: Personalizado 15": encab.personalizado_15,
            "Encab: Importacion": encab.importacion,
            "Encab: Sucursal": encab.sucursal,
            "Encab: Clasificacion": encab.clasificacion,
            // Detalle
            "Detalle: Producto": det.producto,
            "Detalle: Bodega": det.bodega,
            "Detalle: UnidadDeMedida": det.unidad_de_medida,
            "Detalle: Cantidad": det.cantidad,
            "Detalle: IVA": det.iva,
            "Detalle: ValorUnitario": det.valor_unitario,
            "Detalle: Descuento": det.descuento,
            "Detalle: Vencimiento": det.vencimiento,
            "Detalle: Nota": det.nota,
            "Detalle: CentroCostos": det.centro_costos,
            "Detalle: CodigoCentroCostos": det.codigo_centro_costos,
            "Detalle: Personalizado 1": det.personalizado_1,
            "Detalle: Personalizado 2": det.personalizado_2,
            "Detalle: Personalizado 3": det.personalizado_3,
            "Detalle: Personalizado 4": det.personalizado_4,
            "Detalle: Personalizado 5": det.personalizado_5,
            "Detalle: Personalizado 6": det.personalizado_6,
            "Detalle: Personalizado 7": det.personalizado_7,
            "Detalle: Personalizado 8": det.personalizado_8,
            "Detalle: Personalizado 9": det.personalizado_9,
            "Detalle: Personalizado 10": det.personalizado_10,
            "Detalle: Personalizado 11": det.personalizado_11,
            "Detalle: Personalizado 12": det.personalizado_12,
            "Detalle: Personalizado 13": det.personalizado_13,
            "Detalle: Personalizado 14": det.personalizado_14,
            "Detalle: Personalizado 15": det.personalizado_15,
          });
        }
      }

      // Crear workbook y worksheet
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "OrdenesCompra");

      // Generar archivo y descargar
      const fechaHoy = new Date().toISOString().split("T")[0];
      XLSX.writeFile(workbook, `ordenes_compra_${fechaHoy}.xlsx`);

      toast({
        title: "Exportación completada",
        description: `Se generaron ${response.ordenes_compra.length} órdenes de compra con ${rows.length} líneas de detalle`,
      });

      // Recargar datos para reflejar el cambio de status a Exported
      await cargarDatos();
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al exportar";
      toast({
        title: "Error",
        description: mensaje,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Mismo campo: rotar dirección (asc -> desc -> null)
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      // Nuevo campo: iniciar con asc
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Obtener datos ordenados y filtrados
  const sugeridosOrdenados = [...sugeridos].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    const valorA = (a[sortField] || "").toLowerCase();
    const valorB = (b[sortField] || "").toLowerCase();

    if (valorA < valorB) return sortDirection === "asc" ? -1 : 1;
    if (valorA > valorB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Aplicar filtro por proveedor
  const sugeridosFiltrados = filtroProveedor
    ? sugeridosOrdenados.filter(s =>
      (s.proveedor || "").toLowerCase().includes(filtroProveedor.toLowerCase())
    )
    : sugeridosOrdenados;

  // Icono de ordenamiento
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    if (sortDirection === "asc") return <ArrowUp className="h-4 w-4 ml-1" />;
    if (sortDirection === "desc") return <ArrowDown className="h-4 w-4 ml-1" />;
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
  };
  const rechazarRegistro = async (id: string) => {
    setRejectingId(id);
    try {
      await sugeridoComprasService.reject(id);
      toast({
        title: "Registro rechazado",
        description: "El registro fue rechazado exitosamente",
      });
      // Quitar de seleccionados si estaba seleccionado
      setSeleccionados(prev => prev.filter(itemId => itemId !== id));
      // Recargar datos
      await cargarDatos();
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al rechazar el registro";
      toast({
        title: "Error",
        description: mensaje,
        variant: "destructive",
      });
    } finally {
      setRejectingId(null);
    }
  };

  const calcularTotalSeleccionados = () => {
    return sugeridos
      .filter(s => seleccionados.includes(s.id))
      .reduce((total, s) => total + (Number(s.cantidad_proveedor || 0) * Number(s.valor_unitario_proveedor || 0)), 0);
  };

  const formatearMoneda = (valor: number | null | undefined) => {
    if (valor === null || valor === undefined) return "$0.00";
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(valor);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Exportar Requisiciones</h1>
            <p className="text-muted-foreground mt-2">
              Selecciona los registros procesados que deseas exportar a Excel
            </p>
          </div>
          <Button
            variant="corporate-outline"
            onClick={cargarDatos}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Registros</p>
                  <p className="text-2xl font-bold text-foreground">{sugeridos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-corporate-accent/10 rounded-lg">
                  <Package className="h-5 w-5 text-corporate-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Seleccionados</p>
                  <p className="text-2xl font-bold text-foreground">{seleccionados.length}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Valor Total Selec.</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatearMoneda(calcularTotalSeleccionados())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="p-4 flex items-center justify-center h-full">
              <Button
                variant="corporate"
                onClick={generarExcel}
                disabled={seleccionados.length === 0 || isLoading}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Generar Excel
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Registros */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Registros Procesados</CardTitle>
              <CardDescription>
                Registros listos para exportar (status: Processed)
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filtrar por proveedor..."
                  value={filtroProveedor}
                  onChange={(e) => setFiltroProveedor(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              {sugeridos.length > 0 && (
                <Button
                  variant="corporate-outline"
                  onClick={toggleTodos}
                  size="sm"
                >
                  {todosSeleccionados ? "Deseleccionar Todos" : "Seleccionar Todos"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-corporate-primary" />
                <span className="ml-2 text-muted-foreground">Cargando registros...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button variant="corporate-outline" onClick={cargarDatos}>
                  Reintentar
                </Button>
              </div>
            ) : sugeridos.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay registros procesados
                </h3>
                <p className="text-muted-foreground">
                  No se encontraron registros con status "Processed" para exportar
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={todosSeleccionados}
                          onCheckedChange={toggleTodos}
                        />
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center hover:text-foreground transition-colors"
                          onClick={() => handleSort("empresa")}
                        >
                          Empresa
                          {getSortIcon("empresa")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center hover:text-foreground transition-colors"
                          onClick={() => handleSort("proveedor")}
                        >
                          Proveedor
                          {getSortIcon("proveedor")}
                        </button>
                      </TableHead>
                      <TableHead>Código Producto</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Val. Unitario</TableHead>
                      <TableHead className="text-right">Precio 1</TableHead>
                      <TableHead className="text-right">Precio 2</TableHead>
                      <TableHead className="text-right">Valor Unit. Prov.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sugeridosFiltrados.map((item) => {
                      const total = Number(item.cantidad_proveedor || 0) * Number(item.valor_unitario_proveedor || 0);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox
                              checked={seleccionados.includes(item.id)}
                              onCheckedChange={() => toggleSeleccion(item.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.empresa}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate" title={item.proveedor || ""}>
                            {item.proveedor || "-"}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.cod_prod}</TableCell>
                          <TableCell className="max-w-[250px] truncate" title={item.descripcion || ""}>
                            {item.descripcion || "-"}
                          </TableCell>
                          <TableCell>{item.unidad_medida || "-"}</TableCell>
                          <TableCell className="text-right">
                            {item.cantidad_proveedor?.toLocaleString() || "0"}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(item.val_unit)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(item.precio1)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(item.precio2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(item.valor_unitario_proveedor)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatearMoneda(total)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => rechazarRegistro(item.id)}
                              disabled={rejectingId === item.id || isLoading}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Rechazar registro"
                            >
                              {rejectingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen de Exportación */}
        {seleccionados.length > 0 && (
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Exportación</CardTitle>
              <CardDescription>
                Información consolidada de los registros seleccionados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-corporate-primary">
                    {seleccionados.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Registros seleccionados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-corporate-accent">
                    {sugeridos
                      .filter(s => seleccionados.includes(s.id))
                      .reduce((total, s) => total + Number(s.cantidad_proveedor || 0), 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Unidades totales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-corporate-primary">
                    {formatearMoneda(calcularTotalSeleccionados())}
                  </p>
                  <p className="text-sm text-muted-foreground">Valor total consolidado</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>El archivo Excel incluirá:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Información de empresa y proveedor</li>
                  <li>• Código y descripción de cada producto</li>
                  <li>• Cantidades y valores unitarios del proveedor</li>
                  <li>• Totales por producto y consolidado general</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}