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
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, RefreshCcw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { inventarioExcluidoService } from "@/services/inventarioExcluidoService";
import { vistaInventariosService } from "@/services/vistaInventariosService";
import type {
  InventarioExcluidoRecord,
  InventarioExcluidoCreate,
  InventarioExcluidoUpdate,
} from "@/types/api";

interface ProductoOption {
  codigo_producto: string;
  descripcion: string;
}

export default function InventarioExcluido() {
  const { toast } = useToast();

  const [items, setItems] = useState<InventarioExcluidoRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<InventarioExcluidoRecord | null>(
    null
  );

  // Estados para los selectores en cascada
  const [empresasDisponibles, setEmpresasDisponibles] = useState<string[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<
    ProductoOption[]
  >([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);

  const [formData, setFormData] = useState({
    codigo_producto: "",
    empresa: "",
    status: true,
  });

  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await inventarioExcluidoService.list(
        skip,
        limit,
        includeInactive
      );
      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo cargar inventario excluido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar empresas disponibles
  const loadEmpresas = async () => {
    setLoadingEmpresas(true);
    try {
      const empresas = await vistaInventariosService.getEmpresas();
      setEmpresasDisponibles(empresas);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las empresas",
        variant: "destructive",
      });
    } finally {
      setLoadingEmpresas(false);
    }
  };

  // Cargar productos cuando cambie la empresa seleccionada
  const loadProductos = async (empresa: string) => {
    if (!empresa) {
      setProductosDisponibles([]);
      return;
    }
    setLoadingProductos(true);
    try {
      const productos =
        await vistaInventariosService.getProductosPorEmpresa(empresa);
      setProductosDisponibles(productos);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoadingProductos(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, limit, includeInactive]);

  // Cuando cambie includeInactive, volvemos a la primera página
  useEffect(() => {
    setSkip(0);
  }, [includeInactive]);

  const itemsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.codigo_producto.toLowerCase().includes(q) ||
        it.empresa.toLowerCase().includes(q)
    );
  }, [items, busqueda]);

  const abrirModal = async (item?: InventarioExcluidoRecord) => {
    // Cargar empresas si aún no se han cargado
    if (empresasDisponibles.length === 0) {
      await loadEmpresas();
    }

    if (item) {
      setEditando(item);
      setFormData({
        codigo_producto: item.codigo_producto,
        empresa: item.empresa,
        status: item.status,
      });
      // Cargar productos de la empresa del item
      await loadProductos(item.empresa);
    } else {
      setEditando(null);
      setFormData({ codigo_producto: "", empresa: "", status: true });
      setProductosDisponibles([]);
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setFormData({ codigo_producto: "", empresa: "", status: true });
    setProductosDisponibles([]);
  };

  const handleEmpresaChange = async (empresa: string) => {
    setFormData((p) => ({ ...p, empresa, codigo_producto: "" }));
    await loadProductos(empresa);
  };

  const guardar = async () => {
    const codigo = formData.codigo_producto.trim();
    const empresa = formData.empresa.trim();

    if (!empresa) {
      toast({
        title: "Error",
        description: "Debe seleccionar una empresa",
        variant: "destructive",
      });
      return;
    }
    if (!codigo) {
      toast({
        title: "Error",
        description: "Debe seleccionar un producto",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editando) {
        const payload: InventarioExcluidoUpdate = {
          codigo_producto: codigo,
          empresa: empresa,
          status: formData.status,
        };
        const updated = await inventarioExcluidoService.update(
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
        const payload: InventarioExcluidoCreate = {
          codigo_producto: codigo,
          empresa: empresa,
          status: formData.status,
        };
        await inventarioExcluidoService.create(payload);
        toast({ title: "Creado", description: "Registro creado correctamente" });
        cerrarModal();
        setSkip(0);
        await inventarioExcluidoService
          .list(0, limit, includeInactive)
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

  const toggleStatus = async (item: InventarioExcluidoRecord) => {
    try {
      const updated = await inventarioExcluidoService.toggleStatus(
        item.id,
        !item.status
      );
      setItems((prev) => prev.map((x) => (x.id === item.id ? updated : x)));
      toast({
        title: "Estado actualizado",
        description: updated.status ? "Marcado como activo" : "Marcado como inactivo",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "No se pudo cambiar el estado",
        variant: "destructive",
      });
    }
  };

  const eliminar = async (recordId: string) => {
    try {
      await inventarioExcluidoService.delete(recordId);
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

  const badgeVariant = (status: boolean) => (status ? "default" : "secondary");

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
              Inventario Excluido
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestiona productos que deben ser excluidos del inventario
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
                      ? "Actualiza la empresa, producto y/o estado."
                      : "Selecciona la empresa y el producto a excluir."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Selector de Empresa */}
                  <div>
                    <Label htmlFor="empresa">Empresa</Label>
                    {loadingEmpresas ? (
                      <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Cargando empresas...
                        </span>
                      </div>
                    ) : (
                      <Select
                        value={formData.empresa}
                        onValueChange={handleEmpresaChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {empresasDisponibles.map((emp) => (
                            <SelectItem key={emp} value={emp}>
                              {emp}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Selector de Producto */}
                  <div>
                    <Label htmlFor="codigo_producto">Producto</Label>
                    {loadingProductos ? (
                      <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Cargando productos...
                        </span>
                      </div>
                    ) : (
                      <Select
                        value={formData.codigo_producto}
                        onValueChange={(value) =>
                          setFormData((p) => ({ ...p, codigo_producto: value }))
                        }
                        disabled={!formData.empresa || productosDisponibles.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !formData.empresa
                                ? "Primero selecciona una empresa"
                                : productosDisponibles.length === 0
                                  ? "No hay productos disponibles"
                                  : "Selecciona un producto"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {productosDisponibles.map((prod) => (
                            <SelectItem
                              key={prod.codigo_producto}
                              value={prod.codigo_producto}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {prod.codigo_producto}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {prod.descripcion}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {formData.codigo_producto && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {productosDisponibles.find(
                          (p) => p.codigo_producto === formData.codigo_producto
                        )?.descripcion || ""}
                      </p>
                    )}
                  </div>

                  {/* Switch de Estado */}
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Activo</p>
                      <p className="text-xs text-muted-foreground">
                        Si está inactivo, no aplica la exclusión
                      </p>
                    </div>
                    <Switch
                      checked={formData.status}
                      onCheckedChange={(checked) =>
                        setFormData((p) => ({ ...p, status: checked }))
                      }
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
            <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
              <div className="flex-1">
                <Label htmlFor="busqueda">Buscar por empresa o código</Label>
                <Input
                  id="busqueda"
                  placeholder="Ej: Ferreteria Central o PROD-001"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <Label>Incluir inactivos</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={includeInactive}
                      onCheckedChange={setIncludeInactive}
                    />
                    <span className="text-sm text-muted-foreground">
                      {includeInactive ? "Sí" : "No"}
                    </span>
                  </div>
                </div>
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
                    <TableHead>Código</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead>Actualizado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsFiltrados.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.empresa}</TableCell>
                      <TableCell className="font-medium">
                        {item.codigo_producto}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={badgeVariant(item.status)}>
                            {item.status ? "Activo" : "Inactivo"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(item)}
                          >
                            Cambiar
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {item.updated_at
                          ? new Date(item.updated_at).toLocaleString()
                          : "-"}
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
                                    {item.empresa} - {item.codigo_producto}
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
