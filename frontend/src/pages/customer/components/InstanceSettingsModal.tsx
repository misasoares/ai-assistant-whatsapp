import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from 'lucide-react';

interface InstanceSettingsModalProps {
  instance: any | null; // Using any for simplicity with generic instance type
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function InstanceSettingsModal({ instance, open, onOpenChange, onSuccess }: InstanceSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [aiEnabled, setAiEnabled] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [silentModeTime, setSilentModeTime] = useState(86400);

  // Fetch initial data when modal opens
  useEffect(() => {
    if (open && instance) {
      setLoading(false);
      setError(null);
      setAiEnabled(instance.aiEnabled || false);
      setSystemPrompt(instance.systemPrompt || '');
      setSilentModeTime(instance.silentModeTime !== undefined ? instance.silentModeTime : 86400);
    }
  }, [open, instance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instance) return;

    setSaving(true);
    setError(null);

    try {
      await api.patch(`/evolution/instance/${instance.name}`, {
        aiEnabled,
        systemPrompt,
        silentModeTime: Number(silentModeTime),
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      setError('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Instance Settings - {instance?.name}</DialogTitle>
          <DialogDescription>
            Configure AI behavior for this instance.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
        ) : (
            <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
                
                <div className="flex items-center justify-between space-x-2 border p-4 rounded-md">
                    <Label htmlFor="ai-mode" className="flex flex-col space-y-1">
                        <span>AI Enabled</span>
                        <span className="font-normal text-xs text-muted-foreground">
                            When enabled, the AI will reply to messages automatically.
                        </span>
                    </Label>
                    <Switch id="ai-mode" checked={aiEnabled} onCheckedChange={setAiEnabled} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="systemPrompt">System Prompt</Label>
                    <Textarea
                        id="systemPrompt"
                        placeholder="You are a helpful assistant..."
                        className="min-h-[100px]"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Define the personality and rules for the AI.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="silentMode">Silent Mode (Seconds)</Label>
                        <Input
                            id="silentMode"
                            type="number"
                            min="0"
                            value={silentModeTime}
                            onChange={(e) => setSilentModeTime(Number(e.target.value))}
                        />
                         <p className="text-xs text-muted-foreground">
                            Time to wait after human intervention (86400s = 24h).
                        </p>
                    </div>
                </div>

                {error && <div className="text-destructive text-sm">{error}</div>}

            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
                </Button>
            </DialogFooter>
            </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
