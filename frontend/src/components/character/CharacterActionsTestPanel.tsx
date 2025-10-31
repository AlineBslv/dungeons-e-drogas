'use client';

/**
 * Painel de teste para integração de ações de personagem com chat
 * Use este componente para testar a funcionalidade antes de integrar na ficha completa
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCharacterActions } from '@/hooks/useCharacterActions';
import type { CharacterSheet } from '@/lib/firestore-helpers';
import { Sword, Sparkles, Target } from 'lucide-react';
import { toast } from 'sonner';

interface CharacterActionsTestPanelProps {
  character: CharacterSheet & { id: string };
  campaignId: string;
}

export function CharacterActionsTestPanel({
  character,
  campaignId,
}: CharacterActionsTestPanelProps) {
  const {
    sendAttack,
    sendSpell,
    sendSkillCheck,
    sendAbilityCheck,
    isLoading,
  } = useCharacterActions(campaignId);

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [
      `${new Date().toLocaleTimeString()}: ${result}`,
      ...prev.slice(0, 9), // Mantém apenas últimos 10 resultados
    ]);
  };

  const handleTestAttack = async () => {
    try {
      await sendAttack(character, 'Espada Longa de Teste', '1d20+5', '1d8+3');
      addTestResult('✅ Ataque enviado com sucesso!');
      toast.success('Ataque enviado ao chat!');
    } catch (error) {
      addTestResult(`❌ Erro ao enviar ataque: ${error}`);
      toast.error('Erro ao enviar ataque');
    }
  };

  const handleTestSkill = async () => {
    try {
      await sendSkillCheck(character, 'Furtividade', '1d20+7', true, false);
      addTestResult('✅ Teste de perícia enviado!');
      toast.success('Perícia enviada ao chat!');
    } catch (error) {
      addTestResult(`❌ Erro ao enviar perícia: ${error}`);
      toast.error('Erro ao enviar perícia');
    }
  };

  const handleTestAbility = async () => {
    try {
      await sendAbilityCheck(character, 'Força', '1d20+2');
      addTestResult('✅ Teste de atributo enviado!');
      toast.success('Teste de atributo enviado!');
    } catch (error) {
      addTestResult(`❌ Erro ao enviar teste: ${error}`);
      toast.error('Erro ao enviar teste');
    }
  };

  return (
    <Card className="border-gold-500/40">
      <CardHeader>
        <CardTitle className="text-lg font-medieval text-gold-500 flex items-center gap-2">
          🧪 Painel de Teste - Integração Chat
        </CardTitle>
        <p className="text-sm text-text-secondary mt-2">
          Teste o envio de ações do personagem <strong>{character.name}</strong> ao chat da campanha
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Botões de teste */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={handleTestAttack}
            disabled={isLoading}
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2"
          >
            <Sword className="h-6 w-6 text-red-400" />
            <span className="text-xs">Testar Ataque</span>
          </Button>

          <Button
            onClick={handleTestSkill}
            disabled={isLoading}
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2"
          >
            <Target className="h-6 w-6 text-blue-400" />
            <span className="text-xs">Testar Perícia</span>
          </Button>

          <Button
            onClick={handleTestAbility}
            disabled={isLoading}
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2"
          >
            <Sparkles className="h-6 w-6 text-purple-400" />
            <span className="text-xs">Testar Atributo</span>
          </Button>
        </div>

        {/* Info do personagem */}
        <div className="bg-dark-500 rounded-md p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-text-secondary">Personagem:</span>
            <span className="text-text-primary font-semibold">{character.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Classe:</span>
            <span className="text-text-primary">{character.class}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Nível:</span>
            <span className="text-text-primary">{character.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Campaign ID:</span>
            <span className="text-xs text-text-secondary font-mono truncate">{campaignId}</span>
          </div>
        </div>

        {/* Log de resultados */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gold-500">Log de Testes:</h4>
          <div className="bg-dark-500 rounded-md p-3 max-h-48 overflow-y-auto space-y-1">
            {testResults.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-4">
                Nenhum teste executado ainda
              </p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className="text-xs text-text-secondary font-mono border-b border-border/30 pb-1"
                >
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">📝 Como testar:</h4>
          <ol className="text-xs text-text-secondary space-y-1 list-decimal list-inside">
            <li>Abra o chat da campanha em outra aba/janela</li>
            <li>Clique nos botões acima para enviar ações</li>
            <li>Verifique se os cards aparecem no chat</li>
            <li>Confirme que as rolagens estão corretas</li>
            <li>Teste com diferentes personagens e campanhas</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
