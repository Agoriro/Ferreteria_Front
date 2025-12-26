import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Error de credenciales",
        description: "Por favor ingresa usuario y contraseña",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await login(credentials);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema Big Machine",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: error instanceof Error ? error.message : "Credenciales incorrectas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-corporate-dark via-corporate-accent to-corporate-medium p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-corporate-dark/90 to-corporate-accent/80"></div>
      
      <Card className="w-full max-w-md relative z-10 shadow-corporate bg-gradient-card border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-4 bg-corporate-primary rounded-full shadow-corporate">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-corporate-dark">Big Machine</CardTitle>
            <CardDescription className="text-corporate-medium font-medium">
              Sistema de Gestión Corporativa
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-corporate-dark font-medium">
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="h-11 border-corporate-light/50 focus:border-corporate-primary"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-corporate-dark font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="h-11 pr-10 border-corporate-light/50 focus:border-corporate-primary"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-corporate-medium hover:text-corporate-dark"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              variant="corporate"
              size="lg"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-corporate-accent hover:text-corporate-primary text-sm"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
