import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { Loader2, Check, ChevronsUpDown, Filter, FileSpreadsheet, Camera } from "lucide-react";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePermisos } from "@/contexts/PermisosContext";
import { sugeridoComprasService } from "@/services/sugeridoComprasService";
import { proveedoresService } from "@/services/proveedoresService";
import type { SugeridoCompras, ProveedorDropdownItem } from "@/types/api";

export default function Requisiciones() {
  const { user } = useAuth();
  const { nombreRol, isLoading: isLoadingPermisos } = usePermisos();
  const { toast } = useToast();

  // Data state
  const [sugeridosRequested, setSugeridosRequested] = useState<SugeridoCompras[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Provider filter state (for ADMIN/USER only)
  const [proveedores, setProveedores] = useState<ProveedorDropdownItem[]>([]);
  const [selectedProveedor, setSelectedProveedor] = useState<string>("");
  const [proveedorPopoverOpen, setProveedorPopoverOpen] = useState(false);
  const [loadingProveedores, setLoadingProveedores] = useState(false);

  // Editable provider values state: { [itemId]: { cantidad_proveedor, valor_unitario_proveedor } }
  const [editedValues, setEditedValues] = useState<Record<string, { cantidad_proveedor: number; valor_unitario_proveedor: number }>>({});

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Ref for table element (for image export)
  const tableRef = useRef<HTMLDivElement>(null);

  // Determine if user is ADMIN or USER (not MANAGER)
  const isAdminOrUser = nombreRol && !nombreRol.toUpperCase().includes("MANAGER");

  // Load providers list (for ADMIN/USER for filter, for MANAGER to get their provider name)
  const loadProveedores = useCallback(async () => {
    setLoadingProveedores(true);
    try {
      const data = await proveedoresService.getProveedoresDropdown();
      // Sort alphabetically
      const sorted = data.sort((a, b) =>
        a.nombre_completo.localeCompare(b.nombre_completo)
      );
      setProveedores(sorted);
    } catch (error) {
      console.error("Error loading providers:", error);
    } finally {
      setLoadingProveedores(false);
    }
  }, []);

  // Load data based on user role
  const loadData = useCallback(async () => {
    if (!user || !nombreRol) return;

    setIsLoading(true);
    try {
      const rolUpperCase = nombreRol.toUpperCase();
      let data;

      if (rolUpperCase === "MANAGER" || rolUpperCase.includes("MANAGER")) {
        // MANAGER: get all requested items (backend should filter by provider NIT)
        data = await sugeridoComprasService.getByStatus("Requested");
      } else {
        // ADMIN/USER: get all requested items
        data = await sugeridoComprasService.getByStatus("Requested");
      }

      setSugeridosRequested(data.items);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, nombreRol, toast]);

  // Load providers when component mounts or role is available
  useEffect(() => {
    if (nombreRol) {
      loadProveedores();
    }
  }, [nombreRol, loadProveedores]);

  // Load data when role is available
  useEffect(() => {
    if (nombreRol) {
      loadData();
    }
  }, [nombreRol, loadData]);

  // Filter items client-side based on selected provider or MANAGER's provider
  const filteredItems = useMemo(() => {
    // For MANAGER: auto-filter by their provider (using id_proveedor to find provider name)
    if (!isAdminOrUser && user?.id_proveedor && proveedores.length > 0) {
      // Find provider name by NIT (id_proveedor)
      const managerProveedorNit = user.id_proveedor.toString();
      const managerProveedorData = proveedores.find(p => p.identificacion === managerProveedorNit);

      if (managerProveedorData) {
        const proveedorNombre = managerProveedorData.nombre_completo.toLowerCase();
        return sugeridosRequested.filter(item => {
          const itemProveedor = (item.proveedor || item.proveedor1 || "").toLowerCase();
          return itemProveedor.includes(proveedorNombre) || proveedorNombre.includes(itemProveedor);
        });
      }
    }

    // For ADMIN/USER with selected filter
    if (selectedProveedor && isAdminOrUser) {
      const selectedProveedorData = proveedores.find(p => p.identificacion === selectedProveedor);
      if (!selectedProveedorData) {
        return sugeridosRequested;
      }
      const proveedorNombre = selectedProveedorData.nombre_completo.toLowerCase();

      return sugeridosRequested.filter(item => {
        const itemProveedor = (item.proveedor || item.proveedor1 || "").toLowerCase();
        return itemProveedor.includes(proveedorNombre) || proveedorNombre.includes(itemProveedor);
      });
    }

    // No filter - return all
    return sugeridosRequested;
  }, [sugeridosRequested, selectedProveedor, isAdminOrUser, proveedores, user?.id_proveedor]);

  // Handle provider selection
  const handleProveedorSelect = (identificacion: string) => {
    setSelectedProveedor(identificacion === selectedProveedor ? "" : identificacion);
    setProveedorPopoverOpen(false);
  };

  // Clear filter
  const clearFilter = () => {
    setSelectedProveedor("");
  };

  // Handle editable field changes with validation
  const handleEditField = (itemId: string, field: 'cantidad_proveedor' | 'valor_unitario_proveedor', value: string) => {
    // Parse value, default to 0 if empty or invalid
    let numValue = parseFloat(value);

    // Validate: no negative values, no empty (default to 0)
    if (isNaN(numValue) || numValue < 0) {
      numValue = 0;
    }

    setEditedValues(prev => ({
      ...prev,
      [itemId]: {
        cantidad_proveedor: prev[itemId]?.cantidad_proveedor ?? 0,
        valor_unitario_proveedor: prev[itemId]?.valor_unitario_proveedor ?? 0,
        [field]: numValue
      }
    }));
  };

  // Get edited value for an item
  const getEditedValue = (itemId: string, field: 'cantidad_proveedor' | 'valor_unitario_proveedor'): number => {
    return editedValues[itemId]?.[field] ?? 0;
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

  // Get selected provider name for display
  const getProveedorNombre = () => {
    if (!selectedProveedor) return "Todos los proveedores";
    const prov = proveedores.find(p => p.identificacion === selectedProveedor);
    return prov?.nombre_completo || selectedProveedor;
  };

  // Handle Procesar - bulk update with proveedor data
  const handleProcesar = async () => {
    // Build items to send - only items with edited values > 0
    const itemsToUpdate = filteredItems
      .filter(item => {
        const edited = editedValues[item.id];
        return edited && edited.cantidad_proveedor > 0 && edited.valor_unitario_proveedor > 0;
      })
      .map(item => ({
        id: item.id,
        cantidad_proveedor: editedValues[item.id].cantidad_proveedor,
        valor_unitario_proveedor: editedValues[item.id].valor_unitario_proveedor,
      }));

    if (itemsToUpdate.length === 0) {
      toast({
        title: "Error de validación",
        description: "Debe ingresar cantidad y valor unitario del proveedor (mayores a 0) para al menos un producto",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await sugeridoComprasService.bulkUpdateProveedor(itemsToUpdate);

      toast({
        title: "Procesado correctamente",
        description: `${result.updated_count} registro(s) actualizado(s)`,
      });

      // Clear edited values and reload data
      setEditedValues({});
      await loadData();
    } catch (error) {
      toast({
        title: "Error al procesar",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if can process - at least one item with valid values
  const canProcess = filteredItems.some(item => {
    const edited = editedValues[item.id];
    return edited && edited.cantidad_proveedor > 0 && edited.valor_unitario_proveedor > 0;
  });

  // Export to Excel
  const exportToExcel = () => {
    if (filteredItems.length === 0) return;

    setIsExporting(true);
    try {
      // Build data for export based on visible columns
      const exportData = filteredItems.map((item, index) => {
        const baseData: Record<string, unknown> = {
          "#": index + 1,
        };

        // Add Proveedor column only for ADMIN/USER
        if (isAdminOrUser) {
          baseData["Proveedor"] = item.proveedor || item.proveedor1 || "-";
        }

        baseData["Código"] = item.cod_prod;
        baseData["Descripción"] = item.descripcion || "-";
        baseData["U. Medida"] = item.unidad_medida || "-";
        baseData["Cantidad"] = item.cantidad_a_pedir;
        baseData["Valor Unitario"] = item.val_unit;
        baseData["Cant. Proveedor"] = getEditedValue(item.id, 'cantidad_proveedor');
        baseData["Val. Unit. Proveedor"] = getEditedValue(item.id, 'valor_unitario_proveedor');

        return baseData;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Requisiciones");

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Requisiciones_${date}.xlsx`);

      toast({
        title: "Exportado correctamente",
        description: `Se exportaron ${filteredItems.length} registros a Excel`,
      });
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Export as image
  const exportToImage = async () => {
    if (!tableRef.current || filteredItems.length === 0) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(tableRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
      });

      // Convert to image and download
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.download = `Requisiciones_${date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: "Imagen exportada",
        description: "La imagen de la grilla se descargó correctamente",
      });
    } catch (error) {
      toast({
        title: "Error al exportar imagen",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if ((isLoading && sugeridosRequested.length === 0) || isLoadingPermisos) {
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Requisiciones de Compra</h1>
          <p className="text-muted-foreground mt-2">
            Productos sugeridos con estado "Solicitado" listos para requisición
          </p>
        </div>

        {/* Filter Card - Only for ADMIN/USER */}
        {isAdminOrUser && (
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 md:items-end">
                <div className="flex-1 max-w-md">
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Popover open={proveedorPopoverOpen} onOpenChange={setProveedorPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={proveedorPopoverOpen}
                        className="w-full justify-between font-normal"
                        disabled={loadingProveedores}
                      >
                        {loadingProveedores ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cargando...
                          </>
                        ) : (
                          <>
                            {getProveedorNombre()}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar proveedor..." />
                        <CommandList>
                          <CommandEmpty>No se encontró proveedor.</CommandEmpty>
                          <CommandGroup>
                            {/* Option: All providers */}
                            <CommandItem
                              value=""
                              onSelect={() => handleProveedorSelect("")}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  !selectedProveedor ? "opacity-100" : "opacity-0"
                                )}
                              />
                              Todos los proveedores
                            </CommandItem>
                            {proveedores.map((proveedor) => (
                              <CommandItem
                                key={proveedor.identificacion}
                                value={proveedor.nombre_completo}
                                onSelect={() => handleProveedorSelect(proveedor.identificacion)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedProveedor === proveedor.identificacion
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {proveedor.nombre_completo}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                {selectedProveedor && (
                  <Button variant="outline" onClick={clearFilter}>
                    Limpiar filtro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Table */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Productos Solicitados ({filteredItems.length})</CardTitle>
                <CardDescription>
                  Lista de productos con sugerido de compras en estado "Solicitado"
                </CardDescription>
              </div>
              {filteredItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={exportToExcel}
                    disabled={isExporting}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exportToImage}
                    disabled={isExporting}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Imagen
                  </Button>
                  <Button
                    onClick={handleProcesar}
                    disabled={isProcessing || !canProcess}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Procesar"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-corporate-primary" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No hay productos solicitados</p>
                <p className="text-sm">
                  {selectedProveedor
                    ? "No hay productos para el proveedor seleccionado"
                    : "Los productos aparecerán aquí cuando se marquen como \"Solicitado\" en el Sugerido de Compras"}
                </p>
              </div>
            ) : (
              <div ref={tableRef} className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px] text-center">#</TableHead>
                      {isAdminOrUser && <TableHead>Proveedor</TableHead>}
                      <TableHead>Código</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>U. Medida</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Valor Unitario</TableHead>
                      <TableHead className="text-right w-[140px]">Cant. Proveedor</TableHead>
                      <TableHead className="text-right w-[160px]">Val. Unit. Proveedor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-center text-muted-foreground font-mono text-sm">
                          {index + 1}
                        </TableCell>
                        {isAdminOrUser && (
                          <TableCell className="font-medium">
                            {item.proveedor || item.proveedor1 || "-"}
                          </TableCell>
                        )}
                        <TableCell className="font-mono font-medium">
                          {item.cod_prod}
                        </TableCell>
                        <TableCell>
                          {item.descripcion || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.unidad_medida || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatNumber(item.cantidad_a_pedir)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.val_unit)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="0"
                            className="w-[100px] text-right h-8 ml-auto"
                            value={getEditedValue(item.id, 'cantidad_proveedor')}
                            onChange={(e) => handleEditField(item.id, 'cantidad_proveedor', e.target.value)}
                            onBlur={(e) => {
                              if (!e.target.value || parseFloat(e.target.value) < 0) {
                                handleEditField(item.id, 'cantidad_proveedor', '0');
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="0"
                            step="100"
                            className="w-[120px] text-right h-8 ml-auto"
                            value={getEditedValue(item.id, 'valor_unitario_proveedor')}
                            onChange={(e) => handleEditField(item.id, 'valor_unitario_proveedor', e.target.value)}
                            onBlur={(e) => {
                              if (!e.target.value || parseFloat(e.target.value) < 0) {
                                handleEditField(item.id, 'valor_unitario_proveedor', '0');
                              }
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {/* Bottom Procesar Button */}
            {filteredItems.length > 0 && (
              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleProcesar}
                  disabled={isProcessing || !canProcess}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Procesar"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}