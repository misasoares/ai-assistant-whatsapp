import { Trash2, Smartphone, Database, CheckCircle2, XCircle, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

interface Instance {
  id: string;
  name: string;
  status: string;
  customerName?: string;
}

interface InstanceCardProps {
  instance: Instance;
  onDelete: (name: string) => void;
  onSettings: () => void;
}

export default function InstanceCard({ instance, onDelete, onSettings }: InstanceCardProps) {
  const isConnected = instance.status === 'OPEN' || instance.status === 'CONNECTED';
  const aiEnabled = (instance as any).aiEnabled; // Type assertion if generic Instance is used here vs parent
  
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isConnected ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Smartphone className="h-4 w-4 text-primary" />
              {instance.name}
            </CardTitle>
            <div className="flex gap-2">
                <Badge variant={isConnected ? "outline" : "destructive"} className={`text-xs ${isConnected ? "text-green-600 border-green-600/50 bg-green-50 dark:bg-green-950/20" : ""}`}>
                {isConnected ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                {instance.status.toUpperCase()}
                </Badge>
                {aiEnabled && <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">AI ON</Badge>}
            </div>
          </div>
          
          <div className="flex gap-1 -mt-1 -mr-2">
            <Button variant="ghost" size="icon" onClick={onSettings} className="h-8 w-8 text-muted-foreground hover:text-primary">
                <Settings className="h-4 w-4" />
            </Button>

            <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-2">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Instância</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza de que deseja excluir a instância <strong>{instance.name}</strong>? Esta ação irá desconectá-la e removê-la da sua lista.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(instance.name)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-2 uppercase tracking-wider">
            <Database className="h-3 w-3" /> Base de Conhecimento
          </h4>
          <div className="text-sm text-center text-muted-foreground py-2">
            Nenhum documento vetorizado
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
