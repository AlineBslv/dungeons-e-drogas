'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCampaign } from '@/contexts/CampaignContext';
import { useRouter } from 'next/navigation';
import { GiCastle } from 'react-icons/gi';
import { toast } from 'sonner';

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCampaignDialog({ open, onOpenChange }: CreateCampaignDialogProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState<'epic' | 'casual' | 'horror'>('epic');
  const [detailLevel, setDetailLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [language] = useState<'pt-BR' | 'en-US' | 'es-ES'>('pt-BR');
  const [style, setStyle] = useState('sandbox');

  const { createNewCampaign, selectCampaign } = useCampaign();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Por favor, insira um título para a campanha');
      return;
    }

    setLoading(true);

    try {
      const campaignId = await createNewCampaign(
        title.trim(),
        description.trim() || undefined,
        {
          tone,
          detail_level: detailLevel,
          language,
          style,
        }
      );

      toast.success('Campanha criada com sucesso!');

      // Seleciona a campanha e redireciona para a página da campanha
      await selectCampaign(campaignId);
      handleClose();
      router.push(`/campaigns/${campaignId}`);
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar campanha. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      // Reset form
      setTitle('');
      setDescription('');
      setTone('epic');
      setDetailLevel('medium');
      setStyle('sandbox');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-dark-300 border-gold-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medieval text-gold-500 flex items-center gap-2">
            <GiCastle className="w-6 h-6" />
            Criar Nova Campanha
          </DialogTitle>
          <DialogDescription className="font-lore text-text-secondary">
            Configure sua nova aventura com Mestre Drogon
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-ui text-text-primary">
              Título da Campanha *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: A Queda do Dragão Vermelho"
              required
              disabled={loading}
              className="bg-dark-500 border-border font-lore"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-ui text-text-primary">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma breve descrição da campanha..."
              rows={3}
              disabled={loading}
              className="bg-dark-500 border-border font-lore resize-none"
            />
          </div>

          {/* Tom */}
          <div className="space-y-2">
            <Label htmlFor="tone" className="font-ui text-text-primary">
              Tom da Narrativa
            </Label>
            <Select value={tone} onValueChange={(v: 'epic' | 'casual' | 'horror') => setTone(v)} disabled={loading}>
              <SelectTrigger className="bg-dark-500 border-border font-lore">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-400 border-gold-500/30">
                <SelectItem value="epic" className="font-lore">Épico - Dramático e heroico</SelectItem>
                <SelectItem value="casual" className="font-lore">Casual - Descontraído e leve</SelectItem>
                <SelectItem value="horror" className="font-lore">Horror - Sombrio e tenso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nível de Detalhe */}
          <div className="space-y-2">
            <Label htmlFor="detail" className="font-ui text-text-primary">
              Nível de Detalhe
            </Label>
            <Select value={detailLevel} onValueChange={(v: 'low' | 'medium' | 'high') => setDetailLevel(v)} disabled={loading}>
              <SelectTrigger className="bg-dark-500 border-border font-lore">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-400 border-gold-500/30">
                <SelectItem value="low" className="font-lore">Baixo - Respostas concisas</SelectItem>
                <SelectItem value="medium" className="font-lore">Médio - Descrições moderadas</SelectItem>
                <SelectItem value="high" className="font-lore">Alto - Extremamente detalhado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estilo */}
          <div className="space-y-2">
            <Label htmlFor="style" className="font-ui text-text-primary">
              Estilo de Jogo
            </Label>
            <Select value={style} onValueChange={setStyle} disabled={loading}>
              <SelectTrigger className="bg-dark-500 border-border font-lore">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-400 border-gold-500/30">
                <SelectItem value="sandbox" className="font-lore">Sandbox - Mundo aberto</SelectItem>
                <SelectItem value="linear" className="font-lore">Linear - História guiada</SelectItem>
                <SelectItem value="mystery" className="font-lore">Mistério - Investigação</SelectItem>
                <SelectItem value="combat" className="font-lore">Combate - Focado em batalhas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="drogon"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Criando...' : 'Criar Campanha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
