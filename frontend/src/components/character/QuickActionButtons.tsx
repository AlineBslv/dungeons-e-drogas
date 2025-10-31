'use client';

/**
 * Botões de ação rápida para enviar ações da ficha ao chat
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCharacterActions } from '@/hooks/useCharacterActions';
import { CharacterSheet } from '@/lib/firestore-helpers';
import { Sword, Target, Shield, Dumbbell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface QuickActionButtonsProps {
  character: CharacterSheet & { id: string };
  campaignId: string;
  actionType: 'attribute' | 'skill' | 'attack' | 'save';
  actionName: string;
  command: string;
  damageCommand?: string; // Para ataques
  isProficient?: boolean;
  isExpertise?: boolean;
  className?: string;
}

export function QuickActionButton({
  character,
  campaignId,
  actionType,
  actionName,
  command,
  damageCommand,
  isProficient,
  isExpertise,
  className,
}: QuickActionButtonsProps) {
  const {
    sendAttack,
    sendSkillCheck,
    sendSavingThrow,
    sendAbilityCheck,
    isLoading,
  } = useCharacterActions(campaignId);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    setIsProcessing(true);
    try {
      switch (actionType) {
        case 'attack':
          if (!damageCommand) {
            toast.error('Comando de dano não especificado');
            return;
          }
          await sendAttack(character, actionName, command, damageCommand);
          toast.success(`⚔️ ${actionName} enviado ao chat!`);
          break;

        case 'skill':
          await sendSkillCheck(character, actionName, command, isProficient, isExpertise);
          toast.success(`🎯 Teste de ${actionName} enviado!`);
          break;

        case 'save':
          await sendSavingThrow(character, actionName, command, isProficient);
          toast.success(`🛡️ Resistência de ${actionName} enviada!`);
          break;

        case 'attribute':
          await sendAbilityCheck(character, actionName, command);
          toast.success(`💪 Teste de ${actionName} enviado!`);
          break;
      }
    } catch (error) {
      console.error('Erro ao enviar ação:', error);
      toast.error('Erro ao enviar ação ao chat');
    } finally {
      setIsProcessing(false);
    }
  };

  const icon = getActionIcon(actionType);
  const isDisabled = isLoading || isProcessing;

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        'transition-all hover:scale-105',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        icon
      )}
    </Button>
  );
}

/**
 * Grupo de botões de ação rápida para atributos
 */
export function AttributeQuickActions({
  character,
  campaignId,
  attribute,
  command,
}: {
  character: CharacterSheet & { id: string };
  campaignId: string;
  attribute: string;
  command: string;
}) {
  return (
    <QuickActionButton
      character={character}
      campaignId={campaignId}
      actionType="attribute"
      actionName={attribute}
      command={command}
    />
  );
}

/**
 * Grupo de botões de ação rápida para perícias
 */
export function SkillQuickActions({
  character,
  campaignId,
  skillName,
  command,
  isProficient,
  isExpertise,
}: {
  character: CharacterSheet & { id: string };
  campaignId: string;
  skillName: string;
  command: string;
  isProficient?: boolean;
  isExpertise?: boolean;
}) {
  return (
    <QuickActionButton
      character={character}
      campaignId={campaignId}
      actionType="skill"
      actionName={skillName}
      command={command}
      isProficient={isProficient}
      isExpertise={isExpertise}
    />
  );
}

/**
 * Grupo de botões de ação rápida para ataques
 */
export function AttackQuickActions({
  character,
  campaignId,
  weaponName,
  attackCommand,
  damageCommand,
}: {
  character: CharacterSheet & { id: string };
  campaignId: string;
  weaponName: string;
  attackCommand: string;
  damageCommand: string;
}) {
  return (
    <QuickActionButton
      character={character}
      campaignId={campaignId}
      actionType="attack"
      actionName={weaponName}
      command={attackCommand}
      damageCommand={damageCommand}
    />
  );
}

/**
 * Grupo de botões de ação rápida para resistências
 */
export function SavingThrowQuickActions({
  character,
  campaignId,
  saveName,
  command,
  isProficient,
}: {
  character: CharacterSheet & { id: string };
  campaignId: string;
  saveName: string;
  command: string;
  isProficient?: boolean;
}) {
  return (
    <QuickActionButton
      character={character}
      campaignId={campaignId}
      actionType="save"
      actionName={saveName}
      command={command}
      isProficient={isProficient}
    />
  );
}

/**
 * Retorna ícone baseado no tipo de ação
 */
function getActionIcon(type: 'attribute' | 'skill' | 'attack' | 'save') {
  switch (type) {
    case 'attack':
      return <Sword className="h-4 w-4" />;
    case 'skill':
      return <Target className="h-4 w-4" />;
    case 'save':
      return <Shield className="h-4 w-4" />;
    case 'attribute':
      return <Dumbbell className="h-4 w-4" />;
  }
}
