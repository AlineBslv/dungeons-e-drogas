'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCampaign } from '@/contexts/CampaignContext';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import { DiceResult, rollDice } from '@/lib/dice-helpers';
import { sendMessage } from '@/lib/firestore-helpers';
import { toast } from 'sonner';

interface CampaignDiceButtonProps {
  campaignId: string;
  isMaster: boolean;
  onDiceRoll?: (command: string, result: DiceResult) => void;
}

/**
 * Botão de dados específico para campanhas
 * Integra com chat multiplayer e WebSocket
 */
export function CampaignDiceButton({
  campaignId,
  isMaster,
  onDiceRoll
}: CampaignDiceButtonProps) {
  const { user, userProfile } = useAuth();

  if (!user) return null;

  const handleRollComplete = async (command: string, result: DiceResult) => {
    try {
      // Salva rolagem no Firestore como mensagem
      await sendMessage(campaignId, {
        sender: isMaster ? 'mestre' : 'jogador',
        sender_uid: user.uid,
        content: '',
        type: 'dice_roll',
        diceData: {
          command,
          result,
          characterName: user.displayName || userProfile?.name || (isMaster ? 'Mestre' : 'Jogador'),
          context: 'Rolagem via botão flutuante',
        },
      });

      // Callback para WebSocket sync (se fornecido)
      if (onDiceRoll) {
        onDiceRoll(command, result);
      }

      console.log(`🎲 ${user.displayName || 'Usuário'} rolou ${command}: ${result.finalTotal}`);
    } catch (error) {
      console.error('Erro ao salvar rolagem:', error);
      toast.error('Erro ao enviar rolagem de dados');
    }
  };

  return (
    <FloatingDiceButton
      position="bottom-right"
      onRollComplete={handleRollComplete}
      characterName={user.displayName || userProfile?.name || (isMaster ? 'Mestre' : 'Jogador')}
    />
  );
}
