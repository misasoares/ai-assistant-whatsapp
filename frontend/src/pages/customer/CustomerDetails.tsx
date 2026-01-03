import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, Plus, Mail, Phone } from 'lucide-react';
import InstanceCard from './components/InstanceCard';
import CreateInstanceModal from './components/CreateInstanceModal';
import InstanceSettingsModal from './components/InstanceSettingsModal';
import { Button } from "@/components/ui/button"

interface Instance {
  id: string;
  name: string;
  status: string;
  customerName?: string;
  aiEnabled?: boolean;
  systemPrompt?: string;
  silentModeTime?: number;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  instances: Instance[];
}

export default function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInstanceModal, setShowInstanceModal] = useState(false);
  
  // Settings Modal State
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const fetchCustomer = useCallback(async () => {
    try {
      const response = await api.get(`/customers/${id}`);
      setCustomer(response.data);
    } catch (error) {
      console.error('Failed to fetch customer', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleDeleteInstance = async (instanceName: string) => {
    try {
      await api.delete(`/evolution/instance/${instanceName}`);
      fetchCustomer(); // Refresh list after delete
    } catch (error) {
      console.error('Failed to delete instance', error);
      alert('Falha ao excluir instância');
    }
  };

  const handleEditInstance = (instance: Instance) => {
      setSelectedInstance(instance);
      setShowSettingsModal(true);
  };

  if (loading) return <div className="max-w-7xl mx-auto py-8 px-4 md:px-6">Carregando dados do cliente...</div>;
  if (!customer) return <div className="max-w-7xl mx-auto py-8 px-4 md:px-6">Cliente não encontrado</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
            <div className="flex flex-col text-muted-foreground mt-1 gap-1">
              {customer.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {customer.email}
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {customer.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 pb-2 border-b border-border">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">Instâncias</h2>
            <p className="text-sm text-muted-foreground">Gerencie as instâncias do WhatsApp para este cliente.</p>
          </div>
          <Button onClick={() => setShowInstanceModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Instância
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customer.instances.map((instance) => (
            <InstanceCard 
              key={instance.id} 
              instance={instance} 
              onDelete={handleDeleteInstance}
              onSettings={() => handleEditInstance(instance)}
            />
          ))}
          {customer.instances.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-lg bg-card/50 text-muted-foreground">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                 <Plus className="h-6 w-6 text-foreground" />
              </div>
              <p className="text-lg font-medium">Nenhuma instância criada</p>
              <p className="text-sm text-muted-foreground mb-4">Comece criando uma nova instância do WhatsApp.</p>
              <Button variant="outline" onClick={() => setShowInstanceModal(true)}>
                Criar Instância
              </Button>
            </div>
          )}
        </div>
      </div>

      <CreateInstanceModal 
        customerId={customer.id} 
        open={showInstanceModal}
        onOpenChange={setShowInstanceModal}
        onSuccess={() => {
          setShowInstanceModal(false);
          fetchCustomer();
        }}
      />

      <InstanceSettingsModal
        instance={selectedInstance}
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
        onSuccess={() => {
            fetchCustomer();
        }}
      />
    </div>
  );
}
