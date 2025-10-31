"use client";

import { RulesQueryPanel } from "@/components/app/rules-query-panel";

export default function RulesPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-amber-100 mb-2">
          Consulta de Regras D&D 5e
        </h1>
        <p className="text-amber-300/70">
          Consulte o grimório de conhecimento com busca semântica alimentada por IA
        </p>
      </div>

      <RulesQueryPanel />
    </div>
  );
}
