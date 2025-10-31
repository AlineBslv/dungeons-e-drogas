"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Book, Search, Sparkles, AlertCircle } from "lucide-react";

interface RAGSource {
  tipo: string;
  index: number;
  similarity: number;
  preview: string;
  hasRules: boolean;
  chapter: number | null;
  section: string | null;
}

interface RAGResponse {
  success: boolean;
  query: string;
  answer: string;
  sources: RAGSource[];
  confidence: number;
  chunksUsed: number;
  timestamp: string;
}

export function RulesQueryPanel() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RAGResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/search/rag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          maxChunks: 5,
          temperature: 0.3,
          language: "pt-BR",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data);
      } else {
        setError(data.error || "Erro ao consultar regras");
      }
    } catch (err) {
      console.error("Erro na consulta RAG:", err);
      setError("Falha na conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge className="bg-green-600">Alta Confiança</Badge>;
    if (confidence >= 0.6) return <Badge className="bg-yellow-600">Média Confiança</Badge>;
    return <Badge className="bg-red-600">Baixa Confiança</Badge>;
  };

  const getManualName = (tipo: string) => {
    const names: Record<string, string> = {
      "livro-jogador": "Livro do Jogador",
      "livro-mestre": "Livro do Mestre",
      "manual-monstros": "Manual dos Monstros",
    };
    return names[tipo] || tipo;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a1612] border-amber-900/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-amber-100">Consultar Regras D&D</CardTitle>
          </div>
          <CardDescription className="text-amber-300/70">
            Consulte a base de conhecimento oficial de D&D 5e com busca semântica e IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input de consulta */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">
              Sua pergunta sobre regras:
            </label>
            <Textarea
              placeholder="Ex: Como funciona vantagem e desvantagem? Qual é a CD para derrubar uma porta?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[100px] bg-[#0f0d0a] border-amber-900/30 text-amber-100 placeholder:text-amber-800"
              disabled={loading}
            />
          </div>

          {/* Botão de consulta */}
          <Button
            onClick={handleQuery}
            disabled={loading || !query.trim()}
            className="w-full bg-amber-700 hover:bg-amber-600"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Consultando grimório...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Consultar Regras
              </>
            )}
          </Button>

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-900/50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Resposta RAG */}
          {response && (
            <div className="space-y-4 mt-6">
              {/* Header da resposta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold text-amber-100">Resposta do Grimório</h3>
                </div>
                {getConfidenceBadge(response.confidence)}
              </div>

              {/* Resposta gerada */}
              <Card className="bg-[#0f0d0a] border-amber-900/30">
                <CardContent className="pt-6">
                  <div className="prose prose-invert prose-amber max-w-none">
                    <p className="text-amber-100 whitespace-pre-wrap leading-relaxed">
                      {response.answer}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Fontes citadas */}
              {response.sources && response.sources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-amber-200 flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    Fontes Consultadas ({response.sources.length})
                  </h4>

                  <ScrollArea className="h-[200px] rounded-lg border border-amber-900/30 p-2">
                    <div className="space-y-2">
                      {response.sources.map((source, idx) => (
                        <Card
                          key={idx}
                          className="bg-[#0f0d0a] border-amber-900/20 hover:border-amber-900/40 transition-colors"
                        >
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs border-amber-700">
                                  {getManualName(source.tipo)}
                                </Badge>
                                {source.chapter && (
                                  <span className="text-xs text-amber-400">
                                    Cap. {source.chapter}
                                  </span>
                                )}
                                {source.hasRules && (
                                  <Badge className="text-xs bg-blue-700">
                                    Regra Oficial
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-amber-600">
                                {Math.round(source.similarity * 100)}% relevância
                              </span>
                            </div>

                            {source.section && (
                              <p className="text-xs font-medium text-amber-300">
                                {source.section}
                              </p>
                            )}

                            <p className="text-xs text-amber-200/70 line-clamp-2">
                              {source.preview}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Metadados */}
              <div className="flex items-center gap-4 text-xs text-amber-600">
                <span>{response.chunksUsed} trechos analisados</span>
                <span>•</span>
                <span>Confiança: {Math.round(response.confidence * 100)}%</span>
                <span>•</span>
                <span>{new Date(response.timestamp).toLocaleTimeString("pt-BR")}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dicas de uso */}
      <Card className="bg-[#1a1612] border-amber-900/30">
        <CardHeader>
          <CardTitle className="text-sm text-amber-200">💡 Dicas de Consulta</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-amber-300/70 space-y-2">
          <p>• Seja específico: "Como funciona ataque furtivo?" em vez de "ataque"</p>
          <p>• Pergunte sobre mecânicas: "Qual é a CD para quebrar algemas?"</p>
          <p>• Consulte condições: "O que acontece quando um personagem está envenenado?"</p>
          <p>• Verifique regras: "Como funciona concentração em magias?"</p>
        </CardContent>
      </Card>
    </div>
  );
}
