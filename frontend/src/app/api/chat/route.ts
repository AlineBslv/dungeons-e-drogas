import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message, context, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    // Configuração do modelo Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

    // Contexto narrativo baseado nas configurações da campanha
    const systemPrompt = `Você é Mestre Drogon, um narrador de RPG especializado em Dungeons & Dragons 5e.

**Contexto da Campanha:**
- Tom: ${context?.tone || 'epic'}
- Nível de Detalhe: ${context?.detail_level || 'medium'}
- Idioma: ${context?.language || 'pt-BR'}
- Estilo: ${context?.style || 'clássico D&D'}

**Diretrizes:**
1. Mantenha o tom ${context?.tone || 'épico'} durante toda a narração
2. Use ${context?.detail_level === 'high' ? 'descrições ricas e detalhadas' : context?.detail_level === 'low' ? 'descrições concisas' : 'descrições equilibradas'}
3. Seja criativo, mas respeite as regras do D&D 5e
4. Responda em ${context?.language === 'pt-BR' ? 'Português Brasileiro' : 'Inglês'}
5. Adapte-se ao estilo narrativo: ${context?.style || 'clássico'}
6. Use uma linguagem descontraída e irreverente quando apropriado
7. Crie cenários imersivos e envolventes

**Histórico recente:**
${history?.slice(-5).map((h: any) => `${h.role}: ${h.content}`).join('\n') || 'Nenhum histórico anterior'}

Agora responda à mensagem do mestre:`;

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido! Estou pronto para narrar esta aventura épica. Como Mestre Drogon, conduzirei esta história com maestria. O que deseja explorar?' }],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({
      message: text,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao processar chat:', error);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem', details: error.message },
      { status: 500 }
    );
  }
}
