import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  RefreshCcw,
  Loader2,
  Play,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  FileCheck,
  Filter,
  X,
  Save,
  Eye,
  ChevronsUpDown,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SendHorizonal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { sugeridoComprasService } from "@/services/sugeridoComprasService";
import { gruposService } from "@/services/gruposService";
import type {
  SugeridoCompras,
  StatusSugerido,
  GenerarSugeridoRequest,
  GruposResponse,
} from "@/types/api";

const STATUS_OPTIONS: { value: StatusSugerido; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "Created", label: "Creado", icon: <Clock className="h-3 w-3" />, color: "bg-blue-500" },
  { value: "Requested", label: "Solicitado", icon: <FileCheck className="h-3 w-3" />, color: "bg-yellow-500" },
  { value: "Processed", label: "Procesado", icon: <CheckCircle2 className="h-3 w-3" />, color: "bg-green-500" },
];

export default function SugeridoCompras() {
  const { toast } = useToast();

  // Data state
  const [items, setItems] = useState<SugeridoCompras[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(50);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<StatusSugerido | "all">("all");
  const [busqueda, setBusqueda] = useState("");

  // Sort states
  const [sortField, setSortField] = useState<"proveedor" | "cod_prod" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const toggleSort = (field: "proveedor" | "cod_prod") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Modal states
  const [modalGenerarAbierto, setModalGenerarAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
  const [itemEditando, setItemEditando] = useState<SugeridoCompras | null>(null);
  const [itemDetalles, setItemDetalles] = useState<SugeridoCompras | null>(null);
  const [cantidadAPedir, setCantidadAPedir] = useState<number>(0);

  // Form state for generation
  const [generarForm, setGenerarForm] = useState<GenerarSugeridoRequest>({
    fecha_inicial: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
    fecha_final: new Date().toISOString().split("T")[0],
    grupo3: "",
    grupo4: "",
    grupo5: "",
  });

  // Grupos state
  const [grupos, setGrupos] = useState<GruposResponse | null>(null);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [openGrupo3, setOpenGrupo3] = useState(false);
  const [openGrupo4, setOpenGrupo4] = useState(false);
  const [openGrupo5, setOpenGrupo5] = useState(false);

  // Load grupos when modal opens
  const loadGrupos = async () => {
    if (grupos) return; // Already loaded
    setLoadingGrupos(true);
    try {
      const data = await gruposService.getGrupos();
      setGrupos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los grupos",
        variant: "destructive",
      });
    } finally {
      setLoadingGrupos(false);
    }
  };

  // Handle modal open
  const handleOpenModalGenerar = () => {
    setModalGenerarAbierto(true);
    loadGrupos();
  };

  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    try {
      let data;
      if (statusFilter === "all") {
        data = await sugeridoComprasService.list(skip, limit);
      } else {
        data = await sugeridoComprasService.getByStatus(statusFilter);
      }
      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo cargar el sugerido de compras",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, limit, statusFilter]);

  // Reset pagination when filter changes
  useEffect(() => {
    setSkip(0);
  }, [statusFilter]);

  // Filter and sort items
  const itemsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let filtered = items;
    if (q) {
      filtered = items.filter(
        (it) =>
          it.cod_prod.toLowerCase().includes(q) ||
          it.descripcion?.toLowerCase().includes(q) ||
          it.proveedor?.toLowerCase().includes(q) ||
          it.grupo3?.toLowerCase().includes(q) ||
          it.grupo4?.toLowerCase().includes(q) ||
          it.grupo5?.toLowerCase().includes(q)
      );
    }
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const valA = (sortField === "proveedor" ? (a.proveedor || a.proveedor1 || "") : a.cod_prod).toLowerCase();
        const valB = (sortField === "proveedor" ? (b.proveedor || b.proveedor1 || "") : b.cod_prod).toLowerCase();
        const cmp = valA.localeCompare(valB);
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }
    return filtered;
  }, [items, busqueda, sortField, sortDirection]);

  // Generate suggested purchases
  const handleGenerar = async () => {
    if (!generarForm.fecha_inicial || !generarForm.fecha_final) {
      toast({
        title: "Error",
        description: "Las fechas inicial y final son requeridas",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const requestData: GenerarSugeridoRequest = {
        fecha_inicial: generarForm.fecha_inicial,
        fecha_final: generarForm.fecha_final,
      };
      if (generarForm.grupo3?.trim()) requestData.grupo3 = generarForm.grupo3.trim();
      if (generarForm.grupo4?.trim()) requestData.grupo4 = generarForm.grupo4.trim();
      if (generarForm.grupo5?.trim()) requestData.grupo5 = generarForm.grupo5.trim();

      const result = await sugeridoComprasService.generar(requestData);
      toast({
        title: "Sugerido generado",
        description: `Se generaron ${result.total} registros`,
      });
      setModalGenerarAbierto(false);
      setSkip(0);
      setStatusFilter("Created");
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo generar el sugerido",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Update status
  const handleUpdateStatus = async (item: SugeridoCompras, newStatus: StatusSugerido) => {
    try {
      const updated = await sugeridoComprasService.updateStatus(item.id, newStatus);
      setItems((prev) => prev.map((x) => (x.id === item.id ? updated : x)));
      toast({
        title: "Estado actualizado",
        description: `Registro marcado como ${STATUS_OPTIONS.find((s) => s.value === newStatus)?.label}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo cambiar el estado",
        variant: "destructive",
      });
    }
  };

  // Open edit modal
  const abrirModalEditar = (item: SugeridoCompras) => {
    setItemEditando(item);
    setCantidadAPedir(item.cantidad_a_pedir);
    setModalEditarAbierto(true);
  };

  // Open details modal
  const abrirModalDetalles = (item: SugeridoCompras) => {
    setItemDetalles(item);
    setModalDetallesAbierto(true);
  };

  // Save edited quantity
  const guardarCantidad = async () => {
    if (!itemEditando) return;

    setIsSaving(true);
    try {
      // Si la cantidad es > 0, el estado pasa a "Requested", si es 0 queda como "Created"
      const newStatus: StatusSugerido = cantidadAPedir > 0 ? "Requested" : "Created";

      const updated = await sugeridoComprasService.update(itemEditando.id, {
        cantidad_a_pedir: cantidadAPedir,
        status: newStatus,
      });
      setItems((prev) => prev.map((x) => (x.id === itemEditando.id ? updated : x)));
      toast({
        title: "Actualizado",
        description: cantidadAPedir > 0
          ? `Cantidad actualizada y marcado como Solicitado`
          : `Cantidad actualizada y marcado como Creado`,
      });
      setModalEditarAbierto(false);
      setItemEditando(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete single record
  const eliminar = async (id: string) => {
    try {
      await sugeridoComprasService.delete(id);
      toast({
        title: "Eliminado",
        description: "Registro eliminado correctamente",
      });
      const nextItems = items.filter((x) => x.id !== id);
      if (nextItems.length === 0 && skip > 0) {
        setSkip(Math.max(0, skip - limit));
      } else {
        setItems(nextItems);
      }
      setTotal((t) => Math.max(0, t - 1));
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar",
        variant: "destructive",
      });
    }
  };

  // Delete all by status
  const eliminarPorStatus = async (status: StatusSugerido) => {
    try {
      const result = await sugeridoComprasService.deleteByStatus(status);
      toast({
        title: "Eliminados",
        description: result.message,
      });
      setSkip(0);
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar",
        variant: "destructive",
      });
    }
  };

  // Badge variant based on status
  const getStatusBadge = (status: StatusSugerido) => {
    const statusConfig = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <Badge className={`${statusConfig?.color} text-white gap-1`}>
        {statusConfig?.icon}
        {statusConfig?.label}
      </Badge>
    );
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format number
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("es-CO").format(value);
  };

  // Confirmar todos los registros Created → Requested
  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const result = await sugeridoComprasService.confirm();
      toast({
        title: "Registros confirmados",
        description: result.message,
      });
      setSkip(0);
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron confirmar los registros",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-corporate-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Sugerido de Compras
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestiona el sugerido de compras basado en movimientos de inventario
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadData} disabled={isLoading}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refrescar
            </Button>
            <Button variant="corporate" onClick={handleOpenModalGenerar}>
              <Play className="h-4 w-4 mr-2" />
              Generar Sugerido
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatNumber(total)}</p>
            </CardContent>
          </Card>
          {STATUS_OPTIONS.map((status) => (
            <Card
              key={status.value}
              className={`bg-gradient-card shadow-card border-0 cursor-pointer transition-all hover:scale-105 ${statusFilter === status.value ? "ring-2 ring-corporate-primary" : ""
                }`}
              onClick={() => setStatusFilter(statusFilter === status.value ? "all" : status.value)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {status.icon}
                  {status.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatNumber(items.filter((i) => i.status === status.value).length)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="flex-1">
                <Label htmlFor="busqueda">Buscar</Label>
                <Input
                  id="busqueda"
                  placeholder="Código, descripción, proveedor o grupo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Label>Filtrar por estado</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as StatusSugerido | "all")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <span className="flex items-center gap-2">
                          {s.icon}
                          {s.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {statusFilter !== "all" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar {STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eliminar registros</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará todos los registros con estado "{STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label}". Esta operación no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => eliminarPorStatus(statusFilter as StatusSugerido)}
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Registros ({itemsFiltrados.length})
              </CardTitle>
              <CardDescription>
                Mostrando página {currentPage} de {totalPages} (total: {total})
              </CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="corporate"
                  size="sm"
                  disabled={isConfirming || isLoading}
                >
                  {isConfirming ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <SendHorizonal className="h-4 w-4 mr-2" />
                  )}
                  Procesar Todos
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se van a procesar todos los registros con estado "Creado" y pasarán a estado "Solicitado". Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirm}>
                    Aceptar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-center">#</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead className="w-[120px] cursor-pointer select-none" onClick={() => toggleSort("proveedor")}>
                      <span className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Proveedor
                        {sortField === "proveedor" ? (
                          sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("cod_prod")}>
                      <span className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Código
                        {sortField === "cod_prod" ? (
                          sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </span>
                    </TableHead>
                    <TableHead className="w-[150px]">Descripción</TableHead>
                    <TableHead>U.M.</TableHead>
                    <TableHead className="text-right">Exist.</TableHead>
                    <TableHead className="text-right">Exist. MC</TableHead>
                    <TableHead className="text-right">Vtas. Ant.</TableHead>
                    <TableHead className="text-right">Vtas. Act.</TableHead>
                    <TableHead className="text-right">Sugerido</TableHead>
                    <TableHead className="text-right">A Pedir</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsFiltrados.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center text-muted-foreground font-mono text-sm">
                        {skip + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.empresa || "-"}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[120px] block text-sm">
                              {item.proveedor || item.proveedor1 || "-"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.proveedor || item.proveedor1}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {item.cod_prod}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[150px] block">
                              {item.descripcion || "-"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.descripcion}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.unidad_medida || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.exist)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.exist_mc)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.cantidad_ventas_anterior)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.cantidad_ventas_actual)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-blue-600">
                        {formatNumber(item.sugerido_compras)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatNumber(item.cantidad_a_pedir)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => abrirModalEditar(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar cantidad a pedir</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => abrirModalDetalles(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver todos los detalles</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {itemsFiltrados.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <p>No hay registros para mostrar.</p>
                <p className="text-sm">
                  Intenta generar un nuevo sugerido o cambiar los filtros.
                </p>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setSkip(Math.max(0, skip - limit))}
                disabled={skip === 0}
              >
                Anterior
              </Button>
              <div className="text-sm text-muted-foreground">
                Página {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setSkip(skip + limit)}
                disabled={skip + limit >= total}
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal: Generar Sugerido */}
        <Dialog open={modalGenerarAbierto} onOpenChange={setModalGenerarAbierto}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Generar Sugerido de Compras</DialogTitle>
              <DialogDescription>
                Ejecuta el proceso de generación basado en movimientos de inventario.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha_inicial">Fecha Inicial *</Label>
                  <Input
                    id="fecha_inicial"
                    type="date"
                    value={generarForm.fecha_inicial}
                    onChange={(e) =>
                      setGenerarForm((p) => ({ ...p, fecha_inicial: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="fecha_final">Fecha Final *</Label>
                  <Input
                    id="fecha_final"
                    type="date"
                    value={generarForm.fecha_final}
                    onChange={(e) =>
                      setGenerarForm((p) => ({ ...p, fecha_final: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Filtros opcionales (dejar vacío para todos):
                </p>

                {loadingGrupos ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Cargando grupos...</span>
                  </div>
                ) : (
                  <>
                    {/* Grupo 3 */}
                    <div>
                      <Label>Grupo 3</Label>
                      <Popover open={openGrupo3} onOpenChange={setOpenGrupo3}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openGrupo3}
                            className="w-full justify-between font-normal"
                          >
                            {generarForm.grupo3 || "Seleccionar grupo 3..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar grupo 3..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron grupos.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value=""
                                  onSelect={() => {
                                    setGenerarForm((p) => ({ ...p, grupo3: "" }));
                                    setOpenGrupo3(false);
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", !generarForm.grupo3 ? "opacity-100" : "opacity-0")} />
                                  <span className="text-muted-foreground">(Todos)</span>
                                </CommandItem>
                                {grupos?.Grupo_Tres.map((grupo) => (
                                  <CommandItem
                                    key={grupo}
                                    value={grupo}
                                    onSelect={() => {
                                      setGenerarForm((p) => ({ ...p, grupo3: grupo }));
                                      setOpenGrupo3(false);
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", generarForm.grupo3 === grupo ? "opacity-100" : "opacity-0")} />
                                    {grupo}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Grupo 4 */}
                    <div>
                      <Label>Grupo 4</Label>
                      <Popover open={openGrupo4} onOpenChange={setOpenGrupo4}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openGrupo4}
                            className="w-full justify-between font-normal"
                          >
                            {generarForm.grupo4 || "Seleccionar grupo 4..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar grupo 4..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron grupos.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value=""
                                  onSelect={() => {
                                    setGenerarForm((p) => ({ ...p, grupo4: "" }));
                                    setOpenGrupo4(false);
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", !generarForm.grupo4 ? "opacity-100" : "opacity-0")} />
                                  <span className="text-muted-foreground">(Todos)</span>
                                </CommandItem>
                                {grupos?.Grupo_Cuatro.map((grupo) => (
                                  <CommandItem
                                    key={grupo}
                                    value={grupo}
                                    onSelect={() => {
                                      setGenerarForm((p) => ({ ...p, grupo4: grupo }));
                                      setOpenGrupo4(false);
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", generarForm.grupo4 === grupo ? "opacity-100" : "opacity-0")} />
                                    {grupo}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Grupo 5 */}
                    <div>
                      <Label>Grupo 5</Label>
                      <Popover open={openGrupo5} onOpenChange={setOpenGrupo5}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openGrupo5}
                            className="w-full justify-between font-normal"
                          >
                            {generarForm.grupo5 || "Seleccionar grupo 5..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar grupo 5..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron grupos.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value=""
                                  onSelect={() => {
                                    setGenerarForm((p) => ({ ...p, grupo5: "" }));
                                    setOpenGrupo5(false);
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", !generarForm.grupo5 ? "opacity-100" : "opacity-0")} />
                                  <span className="text-muted-foreground">(Todos)</span>
                                </CommandItem>
                                {grupos?.Grupo_Cinco.map((grupo) => (
                                  <CommandItem
                                    key={grupo}
                                    value={grupo}
                                    onSelect={() => {
                                      setGenerarForm((p) => ({ ...p, grupo5: grupo }));
                                      setOpenGrupo5(false);
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", generarForm.grupo5 === grupo ? "opacity-100" : "opacity-0")} />
                                    {grupo}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="corporate"
                  onClick={handleGenerar}
                  className="flex-1"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Generar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setModalGenerarAbierto(false)}
                  className="flex-1"
                  disabled={isGenerating}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal: Editar Cantidad */}
        <Dialog open={modalEditarAbierto} onOpenChange={setModalEditarAbierto}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Cantidad a Pedir</DialogTitle>
              <DialogDescription>
                Producto: <span className="font-medium">{itemEditando?.cod_prod}</span>
                <br />
                {itemEditando?.descripcion}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Existencia actual:</p>
                  <p className="font-medium">{formatNumber(itemEditando?.exist || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sugerido:</p>
                  <p className="font-medium text-blue-600">
                    {formatNumber(itemEditando?.sugerido_compras || 0)}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="cantidad_a_pedir">Cantidad a Pedir</Label>
                <Input
                  id="cantidad_a_pedir"
                  type="number"
                  min="0"
                  value={cantidadAPedir}
                  onChange={(e) => setCantidadAPedir(Number(e.target.value))}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="corporate"
                  onClick={guardarCantidad}
                  className="flex-1"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setModalEditarAbierto(false)}
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Panel lateral: Ver Detalles */}
        <Sheet open={modalDetallesAbierto} onOpenChange={setModalDetallesAbierto}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Detalles del Producto</SheetTitle>
              <SheetDescription>
                {itemDetalles ? (
                  <>
                    <span className="font-mono font-medium">{itemDetalles.cod_prod}</span>
                    {itemDetalles.descripcion && ` - ${itemDetalles.descripcion}`}
                  </>
                ) : (
                  "Cargando..."
                )}
              </SheetDescription>
            </SheetHeader>

            {itemDetalles ? (
              <div className="space-y-6 mt-6">
                {/* Información General */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    Información General
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">ID</span>
                      <span className="font-mono text-xs">{itemDetalles.id}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Estado</span>
                      <span>{getStatusBadge(itemDetalles.status)}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Fecha</span>
                      <span className="font-medium">{itemDetalles.fecha || "-"}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Num. Doc</span>
                      <span className="font-medium">{itemDetalles.num_doc || "-"}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded col-span-2">
                      <span className="text-muted-foreground text-xs block">Creado</span>
                      <span className="font-medium">{itemDetalles.created_at ? new Date(itemDetalles.created_at).toLocaleString() : "-"}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Grupos */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    Clasificación
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Grupo 3</span>
                      <span className="font-medium">{itemDetalles.grupo3 || "-"}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Grupo 4</span>
                      <span className="font-medium">{itemDetalles.grupo4 || "-"}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Grupo 5</span>
                      <span className="font-medium">{itemDetalles.grupo5 || "-"}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Proveedores */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    Proveedores
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Proveedor Principal</span>
                      <span className="font-medium">{itemDetalles.proveedor || "-"}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Proveedor 1</span>
                      <span className="font-medium">{itemDetalles.proveedor1 || "-"}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Proveedor 2</span>
                      <span className="font-medium">{itemDetalles.proveedor2 || "-"}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Proveedor 3</span>
                      <span className="font-medium">{itemDetalles.proveedor3 || "-"}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Proveedor 4</span>
                      <span className="font-medium">{itemDetalles.proveedor4 || "-"}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Movimientos - Compras */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    Movimientos de Compras
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Compras Período</span>
                      <span className="font-medium">{formatNumber(itemDetalles.compras_en_el_periodo)}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Total Entradas</span>
                      <span className="font-medium">{formatNumber(itemDetalles.total_entradas_en_el_periodo)}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Últ. Compra</span>
                      <span className="font-medium">{itemDetalles.ultima_fecha_compra || "-"}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Movimientos - Ventas */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    Movimientos de Ventas
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Ventas Período</span>
                      <span className="font-medium">{formatNumber(itemDetalles.ventas_en_el_periodo)}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Total Salidas</span>
                      <span className="font-medium">{formatNumber(itemDetalles.total_salidas_en_el_periodo)}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Últ. Venta</span>
                      <span className="font-medium">{itemDetalles.ultima_fecha_venta || "-"}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Saldos e Inventario */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    Saldos e Inventario
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Saldo Actual</span>
                      <span className="font-medium">{formatNumber(itemDetalles.saldo_actual)}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Existencia</span>
                      <span className="font-medium">{formatNumber(itemDetalles.exist)}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Existencia MC</span>
                      <span className="font-medium">{formatNumber(itemDetalles.exist_mc)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Valores y Precios */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    Valores y Precios
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Valor Unitario</span>
                      <span className="font-medium">{formatCurrency(itemDetalles.val_unit)}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Descuento</span>
                      <span className="font-medium">{formatCurrency(itemDetalles.dcto)}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Valor Neto</span>
                      <span className="font-medium text-green-600">{formatCurrency(itemDetalles.val_neto)}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Precio 1</span>
                      <span className="font-medium">{formatCurrency(itemDetalles.precio1)}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Utilidad 1</span>
                      <span className="font-medium">{Number(itemDetalles.util_1 ?? 0).toFixed(2)}%</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground text-xs block">Precio 2</span>
                      <span className="font-medium">{formatCurrency(itemDetalles.precio2)}</span>
                    </div>
                    <div className="p-2 bg-muted/50 rounded col-span-3">
                      <span className="text-muted-foreground text-xs block">Utilidad 2</span>
                      <span className="font-medium">{Number(itemDetalles.util_2 ?? 0).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
}




