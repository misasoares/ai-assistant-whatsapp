import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CreateInstanceModalProps {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateInstanceModal({ customerId, open, onOpenChange, onSuccess }: CreateInstanceModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [instanceData, setInstanceData] = useState<any | null>(null);
  const [polling, setPolling] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQrCode(null);

    try {
      const response = await api.post('/evolution/create-instance', {
        instanceName: name,
        customerId,
      });
      
      const data = response.data;
      setInstanceData(data.dbInstance);
      
      if (data.qrcode && data.qrcode.base64) {
        setQrCode(data.qrcode.base64);
        setPolling(true);
      } else {
         // If no QR code returned (maybe instance already connected or other method), just close
         onSuccess();
         resetState();
      }

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Falha ao criar instância');
      setLoading(false); // Only stop loading on error, otherwise we wait for QR scan
    }
  };

  const resetState = () => {
    setName('');
    setQrCode(null);
    setInstanceData(null);
    setPolling(false);
    setLoading(false);
    setError(null);
  };
  
  const handleClose = () => {
      onOpenChange(false);
      resetState();
  }

  // Polling effect
  useEffect(() => {
    let intervalId: any;

    if (polling && instanceData) {
      intervalId = setInterval(async () => {
        try {
          const response = await api.get(`/evolution/instance/${instanceData.name}`);
          const state = response.data?.instance?.state;
          
          if (state === 'open' || state === 'connected') {
            setPolling(false);
            onSuccess();
            handleClose();
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [polling, instanceData, onSuccess, onOpenChange]);


  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Instância</DialogTitle>
          <DialogDescription>
            {qrCode ? 'Escaneie o QR Code para conectar.' : 'Isso criará uma instância dedicada do WhatsApp na Evolution API.'}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-2">
            {error}
          </div>
        )}

        {!qrCode ? (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="instanceName" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="instanceName"
                    placeholder="e.g. sales-dept"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Instância'}
                </Button>
              </DialogFooter>
            </form>
        ) : (
            <div className="flex flex-col items-center justify-center p-4">
                 <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 mb-4 border rounded-lg" />
                 <p className="text-sm text-muted-foreground text-center animate-pulse">
                    Aguardando conexão...
                 </p>
                 <Button variant="ghost" onClick={handleClose} className="mt-4">Cancelar</Button>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
