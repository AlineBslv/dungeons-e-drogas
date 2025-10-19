/**
 * Export Helpers - Dungeons e Drogas
 * Funções para exportação de sessões em diferentes formatos
 */

interface Message {
  id: string;
  sender: 'mestre' | 'drogon' | 'jogador';
  content: string;
  timestamp: any;
}

interface Campaign {
  id: string;
  title?: string;
  description?: string;
  context: {
    tone: string;
    detail_level: string;
    language: string;
    style?: string;
  };
}

/**
 * Formata timestamp para string legível
 */
function formatTimestamp(timestamp: any): string {
  if (!timestamp) return '';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Exporta sessão como Markdown
 */
export function exportToMarkdown(campaign: Campaign, messages: Message[]): string {
  let markdown = `# ${campaign.title || 'Campanha sem nome'}\n\n`;

  if (campaign.description) {
    markdown += `${campaign.description}\n\n`;
  }

  markdown += `**Tom:** ${campaign.context.tone} | **Detalhe:** ${campaign.context.detail_level}\n\n`;
  markdown += `---\n\n`;
  markdown += `## Sessão\n\n`;

  messages.forEach((msg) => {
    const time = formatTimestamp(msg.timestamp);
    const sender = msg.sender === 'drogon' ? '🐉 Drogon' :
                   msg.sender === 'mestre' ? '⚔️ Mestre' :
                   '🎲 Jogador';

    markdown += `### ${sender} - ${time}\n\n`;
    markdown += `${msg.content}\n\n`;
  });

  markdown += `---\n\n`;
  markdown += `*Exportado de Dungeons e Drogas em ${new Date().toLocaleString('pt-BR')}*\n`;

  return markdown;
}

/**
 * Exporta sessão como texto simples
 */
export function exportToText(campaign: Campaign, messages: Message[]): string {
  let text = `${campaign.title || 'Campanha sem nome'}\n`;
  text += `${'='.repeat((campaign.title || 'Campanha sem nome').length)}\n\n`;

  if (campaign.description) {
    text += `${campaign.description}\n\n`;
  }

  text += `Tom: ${campaign.context.tone} | Detalhe: ${campaign.context.detail_level}\n\n`;
  text += `${'─'.repeat(50)}\n\n`;

  messages.forEach((msg) => {
    const time = formatTimestamp(msg.timestamp);
    const sender = msg.sender === 'drogon' ? 'Drogon' :
                   msg.sender === 'mestre' ? 'Mestre' :
                   'Jogador';

    text += `[${time}] ${sender}:\n`;
    text += `${msg.content}\n\n`;
  });

  text += `${'─'.repeat(50)}\n`;
  text += `Exportado de Dungeons e Drogas em ${new Date().toLocaleString('pt-BR')}\n`;

  return text;
}

/**
 * Faz download de arquivo
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta sessão como Markdown e faz download
 */
export function exportSessionAsMarkdown(campaign: Campaign, messages: Message[]) {
  const markdown = exportToMarkdown(campaign, messages);
  const filename = `${campaign.title || 'campanha'}-${Date.now()}.md`;
  downloadFile(markdown, filename, 'text/markdown');
}

/**
 * Exporta sessão como texto e faz download
 */
export function exportSessionAsText(campaign: Campaign, messages: Message[]) {
  const text = exportToText(campaign, messages);
  const filename = `${campaign.title || 'campanha'}-${Date.now()}.txt`;
  downloadFile(text, filename, 'text/plain');
}

/**
 * Copia sessão para área de transferência
 */
export async function copySessionToClipboard(campaign: Campaign, messages: Message[]): Promise<boolean> {
  try {
    const markdown = exportToMarkdown(campaign, messages);
    await navigator.clipboard.writeText(markdown);
    return true;
  } catch (error) {
    console.error('Erro ao copiar para área de transferência:', error);
    return false;
  }
}
