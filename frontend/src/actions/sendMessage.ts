import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SendMessageParams {
  message: string;
  campaignId: string;
  userId?: string;
}

interface ChatResponse {
  from: "ai";
  response: string;
  campaignId: string;
  timestamp: string;
}

/**
 * Envia mensagem para o backend e retorna resposta da IA
 * @param params - Parâmetros da mensagem (message, campaignId, userId)
 * @returns Resposta da IA
 */
export async function sendToChat(params: SendMessageParams): Promise<string> {
  try {
    const response = await axios.post<ChatResponse>(`${API_URL}/chat/send`, {
      campaignId: params.campaignId,
      userId: params.userId || "anonymous",
      message: params.message,
    });

    return response.data.response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || "Erro ao comunicar com a IA";
      console.error("❌ Erro ao enviar mensagem:", errorMessage);
      throw new Error(errorMessage);
    }
    throw error;
  }
}
