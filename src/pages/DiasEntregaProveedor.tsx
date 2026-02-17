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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, RefreshCcw, Loader2, Search, Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { diasEntregaProveedorService } from "@/services/diasEntregaProveedorService";
import { cn } from "@/lib/utils";
import type {
  DiasEntregaProveedorRecord,
  DiasEntregaProveedorCreate,
  DiasEntregaProveedorUpdate,
  ProveedorDiasEntregaOption,
} from "@/types/api";

const EMPRESAS_DISPONIBLES = ["Cataño Ospina S.A.S.", "IMPERIO"];

export default function DiasEntregaProveedor() {
  const { toast } = useToast();

  const [items, setItems] = useState<DiasEntregaProveedorRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [filtroEmpresa, setFiltroEmpresa] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<DiasEntregaProveedorRecord | null>(
    null
  );
  const [proveedores, setProveedores] = useState<ProveedorDiasEntregaOption[]>([]);
  const [proveedorPopoverOpen, setProveedorPopoverOpen] = useState(false);
  const [loadingProveedores, setLoadingProveedores] = useState(false);

  const [formData, setFormData] = useState({
    empresa: "",
    nit_proveedor: "",
    dias_entrega: 0,
  });

  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const loadData = async () => {
    setIsLoading(true);
    try {
      const empresaParam = filtroEmpresa.trim() || undefined;
      const data = await diasEntregaProveedorService.list(
        skip,
        limit,
        empresaParam
      );
      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo cargar días de entrega",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar proveedores por empresa para el combobox
  const loadProveedores = async (empresa: string) => {
    if (!empresa) {
      setProveedores([]);
      return;
    }
    setLoadingProveedores(true);
    try {
      const data = await diasEntregaProveedorService.getProveedoresPorEmpresa(empresa);
      setProveedores(data.items);
    } catch {
      setProveedores([]);
    } finally {
      setLoadingProveedores(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, limit]);

  // Buscar cuando cambie el filtro de empresa (con debounce manual via botón)
  const buscarPorEmpresa = () => {
    setSkip(0);
    loadData();
  };

  const itemsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.empresa.toLowerCase().includes(q) ||
        it.nit_proveedor.toLowerCase().includes(q)
    );
  }, [items, busqueda]);

  const abrirModal = async (item?: DiasEntregaProveedorRecord) => {
    if (item) {
      setEditando(item);
      setFormData({
        empresa: item.empresa,
        nit_proveedor: item.nit_proveedor,
        dias_entrega: item.dias_entrega,
      });
      await loadProveedores(item.empresa);
    } else {
      setEditando(null);
      setFormData({ empresa: "", nit_proveedor: "", dias_entrega: 0 });
      setProveedores([]);
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setFormData({ empresa: "", nit_proveedor: "", dias_entrega: 0 });
    setProveedores([]);
  };

  const guardar = async () => {
    const empresa = formData.empresa.trim();
    const nit = formData.nit_proveedor.trim();
    const dias = formData.dias_entrega;

    if (!empresa) {
      toast({
        title: "Error",
        description: "Debe seleccionar una empresa",
        variant: "destructive",
      });
      return;
    }
    if (!nit) {
      toast({
        title: "Error",
        description: "Debe seleccionar un proveedor",
        variant: "destructive",
      });
      return;
    }
    if (dias < 0) {
      toast({
        title: "Error",
        description: "Los días de entrega deben ser 0 o mayor",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editando) {
        const payload: DiasEntregaProveedorUpdate = {
          empresa,
          nit_proveedor: nit,
          dias_entrega: dias,
        };
        const updated = await diasEntregaProveedorService.update(
          editando.id,
          payload
        );
        setItems((prev) =>
          prev.map((x) => (x.id === editando.id ? updated : x))
        );
        toast({
          title: "Actualizado",
          description: "Registro actualizado correctamente",
        });
      } else {
        const payload: DiasEntregaProveedorCreate = {
          empresa,
          nit_proveedor: nit,
          dias_entrega: dias,
        };
        await diasEntregaProveedorService.create(payload);
        toast({ title: "Creado", description: "Registro creado correctamente" });
        cerrarModal();
        setSkip(0);
        await diasEntregaProveedorService
          .list(0, limit, filtroEmpresa.trim() || undefined)
          .then((data) => {
            setItems(data.items);
            setTotal(data.total);
          });
        return;
      }
      cerrarModal();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const eliminar = async (recordId: string) => {
    try {
      await diasEntregaProveedorService.delete(recordId);
      toast({
        title: "Eliminado",
        description: "Registro eliminado correctamente",
      });
      const nextItems = items.filter((x) => x.id !== recordId);
      if (nextItems.length === 0 && skip > 0) {
        setSkip(Math.max(0, skip - limit));
      } else {
        setItems(nextItems);
      }
      setTotal((t) => Math.max(0, t - 1));
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "No se pudo eliminar",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Días de Entrega por Proveedor
            </h1>
            <p className="text-muted-foreground mt-2">
              Configura los días de entrega estimados por proveedor y empresa
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refrescar
            </Button>
            <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
              <DialogTrigger asChild>
                <Button variant="corporate" onClick={() => abrirModal()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editando ? "Editar registro" : "Crear registro"}
                  </DialogTitle>
                  <DialogDescription>
                    {editando
                      ? "Actualiza la empresa, NIT del proveedor y/o días de entrega."
                      : "Ingresa la empresa, NIT del proveedor y los días de entrega."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="empresa">Empresa</Label>
                    <Select
                      value={formData.empresa}
                      onValueChange={async (value) => {
                        setFormData((p) => ({ ...p, empresa: value, nit_proveedor: "" }));
                        await loadProveedores(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPRESAS_DISPONIBLES.map((emp) => (
                          <SelectItem key={emp} value={emp}>
                            {emp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="nit_proveedor">Proveedor</Label>
                    {loadingProveedores ? (
                      <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Cargando proveedores...
                        </span>
                      </div>
                    ) : (
                      <Popover open={proveedorPopoverOpen} onOpenChange={setProveedorPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={proveedorPopoverOpen}
                            className="w-full justify-between font-normal"
                            disabled={!formData.empresa || proveedores.length === 0}
                          >
                            {!formData.empresa
                              ? "Primero selecciona una empresa"
                              : proveedores.length === 0
                                ? "No hay proveedores disponibles"
                                : formData.nit_proveedor
                                  ? proveedores.find(p => p.nit_proveedor === formData.nit_proveedor)?.nombre_proveedor || formData.nit_proveedor
                                  : "Selecciona un proveedor"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar proveedor..." />
                            <CommandList>
                              <CommandEmpty>No se encontró proveedor.</CommandEmpty>
                              <CommandGroup>
                                {proveedores.map((prov) => (
                                  <CommandItem
                                    key={prov.nit_proveedor}
                                    value={`${prov.nit_proveedor} ${prov.nombre_proveedor}`}
                                    onSelect={() => {
                                      setFormData((p) => ({ ...p, nit_proveedor: prov.nit_proveedor }));
                                      setProveedorPopoverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.nit_proveedor === prov.nit_proveedor ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="grid grid-cols-[auto_1fr] gap-3 items-center min-w-0">
                                      <span className="font-mono font-medium text-sm whitespace-nowrap">
                                        {prov.nit_proveedor}
                                      </span>
                                      <span className="text-sm text-muted-foreground truncate">
                                        {prov.nombre_proveedor}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dias_entrega">Días de Entrega</Label>
                    <Input
                      id="dias_entrega"
                      type="number"
                      min={0}
                      value={formData.dias_entrega}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          dias_entrega: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="Ej: 5"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="corporate"
                      onClick={guardar}
                      className="flex-1"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : editando ? (
                        "Actualizar"
                      ) : (
                        "Crear"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cerrarModal}
                      className="flex-1"
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">Búsqueda y filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="flex-1">
                <Label htmlFor="filtroEmpresa">Filtrar por empresa (API)</Label>
                <div className="flex gap-2">
                  <Input
                    id="filtroEmpresa"
                    placeholder="Ej: Ferreteria Central"
                    value={filtroEmpresa}
                    onChange={(e) => setFiltroEmpresa(e.target.value)}
                  />
                  <Button variant="corporate" onClick={buscarPorEmpresa}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="busqueda">Buscar en resultados</Label>
                <Input
                  id="busqueda"
                  placeholder="Empresa o NIT..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">
              Registros ({itemsFiltrados.length})
            </CardTitle>
            <CardDescription>
              Mostrando página {currentPage} de {totalPages} (total: {total})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>NIT Proveedor</TableHead>
                    <TableHead>Días de Entrega</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsFiltrados.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.empresa}</TableCell>
                      <TableCell className="font-medium">
                        {item.nit_proveedor}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-corporate-primary/10 text-corporate-primary">
                          {item.dias_entrega} días
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => abrirModal(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Eliminar registro
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta operación es irreversible. Se eliminará
                                  el registro{" "}
                                  <span className="font-medium">
                                    {item.empresa} - {item.nit_proveedor}
                                  </span>
                                  .
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => eliminar(item.id)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                  Intenta cambiar los filtros o crea un registro nuevo.
                </p>
              </div>
            )}

            {/* Paginación */}
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
      </div>
    </DashboardLayout>
  );
}

