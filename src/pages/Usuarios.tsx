import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Edit, Trash2, Search, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usersService } from "@/services/usersService";
import { rolesService } from "@/services/rolesService";
import { proveedoresService } from "@/services/proveedoresService";
import { cn } from "@/lib/utils";
import type { User, Role, UserCreate, UserUpdate, ProveedorDropdownItem } from "@/types/api";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorDropdownItem[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [proveedorPopoverOpen, setProveedorPopoverOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    nombres: "",
    apellidos: "",
    password: "",
    rol_id: "",
    estado: "true",
    id_proveedor: ""
  });
  const { toast } = useToast();

  // Cargar usuarios y roles al montar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, rolesData, proveedoresData] = await Promise.all([
        usersService.getUsers(0, 100, true),
        rolesService.getRoles(),
        proveedoresService.getProveedoresDropdown()
      ]);
      setUsuarios(usersData);
      setRoles(rolesData);
      // Ordenar proveedores alfabéticamente
      const sortedProveedores = proveedoresData.sort((a, b) =>
        a.nombre_completo.localeCompare(b.nombre_completo)
      );
      setProveedores(sortedProveedores);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario =>
    `${usuario.nombres} ${usuario.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.username.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getRolNombre = (rolId: number) => {
    const rol = roles.find(r => r.id_rol === rolId);
    return rol?.nombre_rol || "Sin rol";
  };

  const abrirModal = (usuario?: User) => {
    if (usuario) {
      setUsuarioEditando(usuario);
      setFormData({
        username: usuario.username,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        password: "",
        rol_id: usuario.rol_id.toString(),
        estado: usuario.estado.toString(),
        id_proveedor: usuario.id_proveedor?.toString() || ""
      });
    } else {
      setUsuarioEditando(null);
      setFormData({
        username: "",
        nombres: "",
        apellidos: "",
        password: "",
        rol_id: "",
        estado: "true",
        id_proveedor: ""
      });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
    setFormData({
      username: "",
      nombres: "",
      apellidos: "",
      password: "",
      rol_id: "",
      estado: "true",
      id_proveedor: ""
    });
  };

  const guardarUsuario = async () => {
    if (!formData.nombres || !formData.apellidos || !formData.rol_id) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    if (!usuarioEditando && (!formData.username || !formData.password)) {
      toast({
        title: "Error",
        description: "Usuario y contraseña son requeridos para crear un nuevo usuario",
        variant: "destructive",
      });
      return;
    }

    if (!usuarioEditando && formData.password.length < 8) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (usuarioEditando) {
        // Editar usuario existente
        const updateData: UserUpdate = {
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          rol_id: parseInt(formData.rol_id),
          estado: formData.estado === "true",
          id_proveedor: formData.id_proveedor === "TODOS" ? null : (formData.id_proveedor ? parseInt(formData.id_proveedor) : null)
        };

        const updated = await usersService.updateUser(usuarioEditando.id, updateData);
        setUsuarios(prev => prev.map(u => u.id === usuarioEditando.id ? updated : u));

        toast({
          title: "Usuario actualizado",
          description: "Los datos del usuario se han actualizado correctamente",
        });
      } else {
        // Crear nuevo usuario
        const createData: UserCreate = {
          username: formData.username,
          password: formData.password,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          rol_id: parseInt(formData.rol_id),
          id_proveedor: formData.id_proveedor === "TODOS" ? null : (formData.id_proveedor ? parseInt(formData.id_proveedor) : null)
        };

        const newUser = await usersService.createUser(createData);
        setUsuarios(prev => [...prev, newUser]);

        toast({
          title: "Usuario creado",
          description: "El nuevo usuario se ha creado correctamente",
        });
      }

      cerrarModal();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar usuario",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const eliminarUsuario = async (id: number) => {
    try {
      await usersService.deleteUser(id);
      setUsuarios(prev => prev.map(u =>
        u.id === id ? { ...u, estado: false } : u
      ));
      toast({
        title: "Usuario desactivado",
        description: "El usuario ha sido desactivado del sistema",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al desactivar usuario",
        variant: "destructive",
      });
    }
  };

  const getBadgeVariant = (rolId: number) => {
    const rolNombre = getRolNombre(rolId).toLowerCase();
    if (rolNombre.includes("admin")) return "default";
    if (rolNombre.includes("proveedor")) return "outline";
    return "secondary";
  };

  const getEstadoColor = (estado: boolean) => {
    return estado ? "text-green-600" : "text-corporate-primary";
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
            <h1 className="text-3xl font-bold text-foreground">Administración de Usuarios</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona usuarios, roles y permisos del sistema
            </p>
          </div>
          <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
            <DialogTrigger asChild>
              <Button variant="corporate" onClick={() => abrirModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {usuarioEditando ? "Editar Usuario" : "Crear Nuevo Usuario"}
                </DialogTitle>
                <DialogDescription>
                  {usuarioEditando
                    ? "Modifica la información del usuario seleccionado"
                    : "Completa los datos para crear un nuevo usuario"
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {!usuarioEditando && (
                  <div>
                    <Label htmlFor="username">Nombre de Usuario</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Ingresa el nombre de usuario"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombres">Nombres</Label>
                    <Input
                      id="nombres"
                      value={formData.nombres}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombres: e.target.value }))}
                      placeholder="Nombres"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellidos">Apellidos</Label>
                    <Input
                      id="apellidos"
                      value={formData.apellidos}
                      onChange={(e) => setFormData(prev => ({ ...prev, apellidos: e.target.value }))}
                      placeholder="Apellidos"
                    />
                  </div>
                </div>
                {!usuarioEditando && (
                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="rol">Rol</Label>
                  <Select value={formData.rol_id} onValueChange={(value) => setFormData(prev => ({ ...prev, rol_id: value, id_proveedor: "" }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((rol) => (
                        <SelectItem key={rol.id_rol} value={rol.id_rol.toString()}>
                          {rol.nombre_rol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Popover open={proveedorPopoverOpen} onOpenChange={setProveedorPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={proveedorPopoverOpen}
                        className="w-full justify-between font-normal"
                      >
                        {formData.id_proveedor === "TODOS"
                          ? "Todos"
                          : formData.id_proveedor
                            ? proveedores.find(p => p.identificacion === formData.id_proveedor)?.nombre_completo || "Selecciona un proveedor"
                            : "Selecciona un proveedor"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar proveedor..." />
                        <CommandList>
                          <CommandEmpty>No se encontró proveedor.</CommandEmpty>
                          <CommandGroup>
                            {/* Opción TODOS solo visible si el rol es admin */}
                            {formData.rol_id && roles.find(r => r.id_rol === parseInt(formData.rol_id))?.nombre_rol.toLowerCase().includes("admin") && (
                              <CommandItem
                                value="TODOS"
                                onSelect={() => {
                                  setFormData(prev => ({ ...prev, id_proveedor: "TODOS" }));
                                  setProveedorPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.id_proveedor === "TODOS" ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                Todos
                              </CommandItem>
                            )}
                            {proveedores.map((proveedor) => (
                              <CommandItem
                                key={proveedor.identificacion}
                                value={proveedor.nombre_completo}
                                onSelect={() => {
                                  setFormData(prev => ({ ...prev, id_proveedor: proveedor.identificacion }));
                                  setProveedorPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.id_proveedor === proveedor.identificacion ? "opacity-100" : "opacity-0"
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
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="corporate" onClick={guardarUsuario} className="flex-1" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      usuarioEditando ? "Actualizar" : "Crear Usuario"
                    )}
                  </Button>
                  <Button variant="outline" onClick={cerrarModal} className="flex-1" disabled={isSaving}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">Buscar Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, apellido o usuario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">Lista de Usuarios ({usuariosFiltrados.length})</CardTitle>
            <CardDescription>
              Todos los usuarios registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuariosFiltrados.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.username}</TableCell>
                    <TableCell>{`${usuario.nombres} ${usuario.apellidos}`}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(usuario.rol_id)}>
                        {getRolNombre(usuario.rol_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getEstadoColor(usuario.estado)}`}>
                        {usuario.estado ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => abrirModal(usuario)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => eliminarUsuario(usuario.id)}
                          className="text-destructive hover:text-destructive"
                          disabled={!usuario.estado}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
