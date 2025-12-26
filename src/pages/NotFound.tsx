import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center bg-gradient-card shadow-card border-0">
        <CardHeader className="pb-4">
          <div className="mx-auto p-4 bg-corporate-primary/10 rounded-full w-fit">
            <AlertTriangle className="h-8 w-8 text-corporate-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">404</CardTitle>
          <CardDescription className="text-muted-foreground">
            Página no encontrada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            La página que buscas no existe o ha sido movida.
          </p>
          <Button 
            variant="corporate" 
            className="w-full"
            onClick={() => window.location.href = '/dashboard'}
          >
            <Home className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
