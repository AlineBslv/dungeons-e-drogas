/**
 * Helpers para integração com sistema de dados
 */

export interface DiceResult {
  rolls: number[];
  total: number;
  modifier: number;
  finalTotal: number;
  isCritical: boolean;
  isCriticalFailure: boolean;
  diceType: number;
  quantity: number;
}

export interface DiceRollResponse {
  success: boolean;
  command: string;
  result: DiceResult;
  message: string;
  timestamp: string;
}

/**
 * Rola dados via API
 */
export async function rollDice(
  command: string,
  options?: {
    campaignId?: string;
    userId?: string;
    characterName?: string;
    context?: string;
  }
): Promise<DiceRollResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const response = await fetch(`${apiUrl}/dice/roll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({
      command,
      campaignId: options?.campaignId || (typeof window !== 'undefined' ? localStorage.getItem('currentCampaignId') : null),
      userId: options?.userId || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null),
      characterName: options?.characterName,
      context: options?.context,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao rolar dados');
  }

  return response.json();
}

/**
 * Busca histórico de rolagens de uma campanha
 */
export async function getDiceHistory(
  campaignId: string,
  limit: number = 50
): Promise<any[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const response = await fetch(`${apiUrl}/dice/history/${campaignId}?limit=${limit}`, {
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar histórico');
  }

  const data = await response.json();
  return data.rolls;
}

/**
 * Valida comando de dados localmente (antes de enviar pra API)
 */
export function validateDiceCommand(command: string): {
  valid: boolean;
  error?: string;
} {
  const cleanCmd = command.trim().toLowerCase().replace(/\s+/g, '');
  const diceRegex = /^(\d*)d(\d+)(([+-])(\d+))?$/;

  if (!diceRegex.test(cleanCmd)) {
    return {
      valid: false,
      error: 'Formato inválido. Use: XdY+Z (ex: 1d20, 2d6+3)',
    };
  }

  const match = cleanCmd.match(diceRegex);
  if (!match) return { valid: false, error: 'Comando inválido' };

  const quantity = parseInt(match[1] || '1');
  const diceType = parseInt(match[2]);
  const modifier = parseInt(match[5] || '0');

  if (quantity < 1 || quantity > 100) {
    return {
      valid: false,
      error: 'Quantidade de dados deve estar entre 1 e 100',
    };
  }

  const validDice = [4, 6, 8, 10, 12, 20, 100];
  if (!validDice.includes(diceType)) {
    return {
      valid: false,
      error: `Tipo de dado inválido. Use: ${validDice.join(', ')}`,
    };
  }

  if (modifier < -100 || modifier > 100) {
    return {
      valid: false,
      error: 'Modificador deve estar entre -100 e +100',
    };
  }

  return { valid: true };
}

/**
 * Formata resultado de dados para exibição
 */
export function formatDiceResult(result: DiceResult, command: string): string {
  const { rolls, finalTotal, modifier, isCritical, isCriticalFailure } = result;

  let formatted = `🎲 Rolagem: ${command}\n`;
  formatted += `Dados: [${rolls.join(', ')}]`;

  if (modifier !== 0) {
    formatted += ` ${modifier > 0 ? '+' : ''}${modifier}`;
  }

  formatted += ` = **${finalTotal}**`;

  if (isCritical) {
    formatted += ' 🌟 **CRÍTICO!**';
  } else if (isCriticalFailure) {
    formatted += ' 💀 **FALHA CRÍTICA!**';
  }

  return formatted;
}

/**
 * Calcula modificador de atributo D&D 5e
 */
export function calculateModifier(attributeValue: number): number {
  return Math.floor((attributeValue - 10) / 2);
}

/**
 * Gera comando de dados com modificador de atributo
 */
export function buildDiceCommand(
  diceType: number,
  quantity: number = 1,
  modifier: number = 0
): string {
  let command = `${quantity}d${diceType}`;

  if (modifier !== 0) {
    command += modifier > 0 ? `+${modifier}` : `${modifier}`;
  }

  return command;
}
