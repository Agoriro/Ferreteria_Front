import { useState, useEffect } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  FileSpreadsheet,
  Filter,
  Search,
  Loader2,
  Check,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sugeridoComprasService } from "@/services/sugeridoComprasService";
import { proveedoresService } from "@/services/proveedoresService";
import { cn } from "@/lib/utils";
import type { ReporteSugeridoItem, ProveedorDropdownItem } from "@/types/api";

const ITEMS_PER_PAGE = 50;

const statusOptions = [
  { value: "Created", label: "Created" },
  { value: "Requested", label: "Requested" },
  { value: "Processed", label: "Processed" },
  { value: "Exported", label: "Exported" },
];

const getBadgeVariant = (status: string | null) => {
  switch (status) {
    case "Created":
      return "secondary";
    case "Requested":
      return "outline";
    case "Processed":
      return "default";
    case "Exported":
      return "default";
    default:
      return "secondary";
  }
};

const getBadgeClass = (status: string | null) => {
  switch (status) {
    case "Created":
      return "bg-slate-100 text-slate-700";
    case "Requested":
      return "bg-amber-100 text-amber-700 border-amber-300";
    case "Processed":
      return "bg-blue-100 text-blue-700";
    case "Exported":
      return "bg-green-100 text-green-700";
    default:
      return "";
  }
};

export default function Reportes() {
  // Filters
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [statusSeleccionado, setStatusSeleccionado] = useState("");
  const [proveedorPopoverOpen, setProveedorPopoverOpen] = useState(false);

  // Data
  const [items, setItems] = useState<ReporteSugeridoItem[]>([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [proveedores, setProveedores] = useState<ProveedorDropdownItem[]>([]);
  const [mostrarReporte, setMostrarReporte] = useState(false);

  // Pagination
  const [paginaActual, setPaginaActual] = useState(1);

  // Loading
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();

  // Load providers on mount
  useEffect(() => {
    const loadProveedores = async () => {
      try {
        const data = await proveedoresService.getProveedoresDropdown();
        const sorted = data.sort((a, b) =>
          a.nombre_completo.localeCompare(b.nombre_completo)
        );
        setProveedores(sorted);
      } catch {
        // silently fail, dropdown will just be empty
      }
    };
    loadProveedores();
  }, []);

  const totalPaginas = Math.ceil(items.length / ITEMS_PER_PAGE);
  const itemsPaginados = items.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  const generarReporte = async () => {
    if (!fechaInicial || !fechaFinal) {
      toast({
        title: "Campos requeridos",
        description: "Las fechas inicial y final son obligatorias",
        variant: "destructive",
      });
      return;
    }

    if (fechaFinal < fechaInicial) {
      toast({
        title: "Fecha inválida",
        description: "La fecha final debe ser mayor o igual a la fecha inicial",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await sugeridoComprasService.getReporte(
        fechaInicial,
        fechaFinal,
        proveedorSeleccionado || undefined,
        statusSeleccionado || undefined
      );
      setItems(response.items);
      setTotalRegistros(response.total);
      setMostrarReporte(true);
      setPaginaActual(1);

      toast({
        title: "Reporte generado",
        description: `Se encontraron ${response.total} registros`,
      });
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al generar reporte";
      toast({
        title: "Error",
        description: mensaje,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportarExcel = async () => {
    if (items.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay registros para exportar",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const XLSX = await import("xlsx");

      const rows = items.map((item) => ({
        Empresa: item.empresa || "",
        Proveedor: item.proveedor || "",
        Codigo: item.cod_prod || "",
        Descripción: item.descripcion || "",
        "U Medida": item.unidad_medida || "",
        Cantidad: item.cantidad_proveedor ?? 0,
        Valor: item.valor_unitario_proveedor ?? 0,
        "Tipo Doc Exp": item.tipo_doc_exp || "",
        "Prefijo Exp": item.prefijo_exp || "",
        "Numero Doc Exp": item.num_doc_exp || "",
        "Fecha Act": item.updated_at
          ? new Date(item.updated_at).toLocaleString("es-CO")
          : "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

      const fechaHoy = new Date().toISOString().split("T")[0];
      XLSX.writeFile(workbook, `reporte_sugerido_compras_${fechaHoy}.xlsx`);

      toast({
        title: "Exportación completada",
        description: `Se exportaron ${items.length} registros a Excel`,
      });
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al exportar";
      toast({
        title: "Error",
        description: mensaje,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatearMoneda = (valor: number | null | undefined) => {
    if (valor === null || valor === undefined) return "$0.00";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(valor);
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "-";
    try {
      return new Date(fecha).toLocaleString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fecha;
    }
  };

  const proveedorNombre = proveedorSeleccionado
    ? proveedores.find((p) => p.identificacion === proveedorSeleccionado)
      ?.nombre_completo || proveedorSeleccionado
    : "";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground mt-2">
            Reporte de Sugerido de Compras — consulte por rango de fechas, proveedor y estado
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
              {/* Fecha Inicial */}
              <div>
                <Label htmlFor="fechaInicial">Fecha Inicial *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fechaInicial"
                    type="date"
                    value={fechaInicial}
                    onChange={(e) => setFechaInicial(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Fecha Final */}
              <div>
                <Label htmlFor="fechaFinal">Fecha Final *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fechaFinal"
                    type="date"
                    value={fechaFinal}
                    onChange={(e) => setFechaFinal(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Proveedor (searchable combobox) */}
              <div>
                <Label>Proveedor</Label>
                <Popover
                  open={proveedorPopoverOpen}
                  onOpenChange={setProveedorPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={proveedorPopoverOpen}
                      className="w-full justify-between font-normal"
                    >
                      {proveedorNombre || "Todos los proveedores"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar proveedor..." />
                      <CommandList>
                        <CommandEmpty>No se encontró proveedor.</CommandEmpty>
                        <CommandGroup>
                          {/* Opción para limpiar */}
                          <CommandItem
                            value="__TODOS__"
                            onSelect={() => {
                              setProveedorSeleccionado("");
                              setProveedorPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !proveedorSeleccionado
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            Todos los proveedores
                          </CommandItem>
                          {proveedores.map((prov) => (
                            <CommandItem
                              key={prov.identificacion}
                              value={prov.nombre_completo}
                              onSelect={() => {
                                setProveedorSeleccionado(prov.identificacion);
                                setProveedorPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  proveedorSeleccionado === prov.identificacion
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {prov.nombre_completo}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Estado (dropdown) */}
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={statusSeleccionado}
                  onValueChange={(value) =>
                    setStatusSeleccionado(value === "__TODOS__" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__TODOS__">Todos los estados</SelectItem>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="corporate"
                onClick={generarReporte}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </>
                )}
              </Button>
              {mostrarReporte && items.length > 0 && (
                <Button
                  variant="corporate-outline"
                  onClick={exportarExcel}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Exportar Excel
                    </>
                  )}
                </Button>
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
                  Resultados del Reporte
                </CardTitle>
                <CardDescription>
                  {totalRegistros} registros encontrados
                  {fechaInicial &&
                    fechaFinal &&
                    ` desde ${fechaInicial} hasta ${fechaFinal}`}
                </CardDescription>
              </div>
              {totalPaginas > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Página {paginaActual} de {totalPaginas}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No se encontraron registros con los filtros aplicados</p>
                  <p className="text-sm">
                    Intente modificar los criterios de búsqueda
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Proveedor</TableHead>
                          <TableHead>Codigo</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>U Medida</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead>Tipo Doc Exp</TableHead>
                          <TableHead>Prefijo Exp</TableHead>
                          <TableHead>Numero Doc Exp</TableHead>
                          <TableHead>Fecha Act</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itemsPaginados.map((item, idx) => (
                          <TableRow key={`${item.cod_prod}-${item.proveedor}-${idx}`}>
                            <TableCell>
                              <Badge variant="outline">
                                {item.empresa || "-"}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className="max-w-[200px] truncate"
                              title={item.proveedor || ""}
                            >
                              {item.proveedor || "-"}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {item.cod_prod || "-"}
                            </TableCell>
                            <TableCell
                              className="max-w-[250px] truncate"
                              title={item.descripcion || ""}
                            >
                              {item.descripcion || "-"}
                            </TableCell>
                            <TableCell>{item.unidad_medida || "-"}</TableCell>
                            <TableCell className="text-right">
                              {item.cantidad_proveedor?.toLocaleString() ?? "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatearMoneda(item.valor_unitario_proveedor)}
                            </TableCell>
                            <TableCell>{item.tipo_doc_exp || "-"}</TableCell>
                            <TableCell>{item.prefijo_exp || "-"}</TableCell>
                            <TableCell>{item.num_doc_exp || "-"}</TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {formatearFecha(item.updated_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginación inferior */}
                  {totalPaginas > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Mostrando {(paginaActual - 1) * ITEMS_PER_PAGE + 1} a{" "}
                        {Math.min(paginaActual * ITEMS_PER_PAGE, items.length)}{" "}
                        de {items.length} registros
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={paginaActual === 1}
                          onClick={() => setPaginaActual((p) => p - 1)}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>
                        <span className="text-sm font-medium px-2">
                          {paginaActual} / {totalPaginas}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={paginaActual === totalPaginas}
                          onClick={() => setPaginaActual((p) => p + 1)}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}