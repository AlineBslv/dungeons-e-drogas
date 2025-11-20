"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SpellData,
  getSchoolIcon,
  getSpellLevelColor,
  formatSpellComponents,
} from "@/lib/spells-data";
import { GiScrollUnfurled, GiMagicSwirl } from "react-icons/gi";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpellBookProps {
  spells: string[]; // Array de nomes de magias conhecidas
  allSpells: SpellData[]; // Lista completa de magias disponíveis
  onCastSpell?: (spell: SpellData) => void;
  className?: string;
}

export function SpellBook({
  spells,
  allSpells,
  onCastSpell,
  className,
}: SpellBookProps) {
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtra magias conhecidas
  const knownSpells = allSpells.filter((spell) =>
    spells.includes(spell.name)
  );

  // Agrupa magias por nível
  const spellsByLevel: Record<number, SpellData[]> = {};
  knownSpells.forEach((spell) => {
    if (!spellsByLevel[spell.level]) {
      spellsByLevel[spell.level] = [];
    }
    spellsByLevel[spell.level].push(spell);
  });

  // Filtra por busca
  const filteredSpells = searchTerm
    ? knownSpells.filter(
        (spell) =>
          spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          spell.school.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : knownSpells;

  // Ordena níveis
  const levels = Object.keys(spellsByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  const SpellCard = ({ spell }: { spell: SpellData }) => {
    const isSelected = selectedSpell?.name === spell.name;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setSelectedSpell(spell)}
        className={cn(
          "p-3 rounded-lg border cursor-pointer transition-all",
          "hover:border-gold-500/60 hover:bg-gold-500/5",
          isSelected
            ? "border-gold-500 bg-gold-500/10"
            : "border-border bg-dark-500"
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getSchoolIcon(spell.school)}</span>
            <div>
              <h4 className="font-semibold text-sm text-text-primary">
                {spell.name}
              </h4>
              <p className="text-xs text-text-secondary">{spell.school}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn("text-xs", getSpellLevelColor(spell.level))}
          >
            {spell.level === 0 ? "Truque" : `Nv ${spell.level}`}
          </Badge>
        </div>

        {/* Informações rápidas */}
        <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
          <div>
            <span className="font-semibold">Tempo:</span> {spell.castingTime}
          </div>
          <div>
            <span className="font-semibold">Alcance:</span> {spell.range}
          </div>
        </div>

        {/* Badges de propriedades */}
        <div className="flex gap-1 mt-2 flex-wrap">
          {spell.concentration && (
            <Badge
              variant="secondary"
              className="text-xs bg-blue-500/20 text-blue-400"
            >
              Concentração
            </Badge>
          )}
          {spell.ritual && (
            <Badge
              variant="secondary"
              className="text-xs bg-purple-500/20 text-purple-400"
            >
              Ritual
            </Badge>
          )}
          {spell.attackRoll && (
            <Badge
              variant="secondary"
              className="text-xs bg-red-500/20 text-red-400"
            >
              Ataque
            </Badge>
          )}
          {spell.savingThrow && (
            <Badge
              variant="secondary"
              className="text-xs bg-orange-500/20 text-orange-400"
            >
              TR
            </Badge>
          )}
        </div>
      </motion.div>
    );
  };

  const SpellDetails = ({ spell }: { spell: SpellData }) => {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{getSchoolIcon(spell.school)}</span>
              <h3 className="text-xl font-medieval text-gold-500">
                {spell.name}
              </h3>
            </div>
            <p className="text-sm text-text-secondary">
              {spell.level === 0
                ? "Truque"
                : `Magia de ${spell.level}º nível`}{" "}
              • {spell.school}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSpell(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Propriedades */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-semibold text-gold-500">Tempo de Conjuração:</span>
            <p className="text-text-secondary">{spell.castingTime}</p>
          </div>
          <div>
            <span className="font-semibold text-gold-500">Alcance:</span>
            <p className="text-text-secondary">{spell.range}</p>
          </div>
          <div>
            <span className="font-semibold text-gold-500">Componentes:</span>
            <p className="text-text-secondary">
              {formatSpellComponents(spell)}
            </p>
          </div>
          <div>
            <span className="font-semibold text-gold-500">Duração:</span>
            <p className="text-text-secondary">
              {spell.duration}
              {spell.concentration && " (C)"}
            </p>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <h4 className="font-semibold text-gold-500 mb-2">Descrição</h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            {spell.description}
          </p>
        </div>

        {/* Dano */}
        {spell.damageFormula && (
          <div className="p-3 bg-dark-500 rounded-md border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gold-500">Dano:</span>
              <Badge variant="outline" className="text-ruby">
                {spell.damageFormula} ({spell.damageType})
              </Badge>
            </div>
            {spell.savingThrow && (
              <p className="text-xs text-text-secondary mt-1">
                TR de {spell.savingThrow === "strength" ? "Força" :
                         spell.savingThrow === "dexterity" ? "Destreza" :
                         spell.savingThrow === "constitution" ? "Constituição" :
                         spell.savingThrow === "intelligence" ? "Inteligência" :
                         spell.savingThrow === "wisdom" ? "Sabedoria" : "Carisma"}
              </p>
            )}
          </div>
        )}

        {/* Níveis Superiores */}
        {spell.higherLevels && (
          <div>
            <h4 className="font-semibold text-gold-500 mb-2">
              Em Níveis Superiores
            </h4>
            <p className="text-sm text-text-secondary">{spell.higherLevels}</p>
          </div>
        )}

        {/* Botão de conjurar */}
        {onCastSpell && spell.level > 0 && (
          <Button
            variant="drogon"
            className="w-full"
            onClick={() => onCastSpell(spell)}
          >
            <GiMagicSwirl className="h-5 w-5 mr-2" />
            Conjurar {spell.name}
          </Button>
        )}
      </motion.div>
    );
  };

  return (
    <Card className={cn("border-gold-500/30", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-ui flex items-center gap-2">
            <GiScrollUnfurled className="h-5 w-5 text-gold-500" />
            Grimório ({knownSpells.length} magias)
          </CardTitle>
        </div>

        {/* Busca */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Buscar magias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Lista de magias */}
          <div className="space-y-4">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="text-xs">
                  Todas
                </TabsTrigger>
                <TabsTrigger value="cantrips" className="text-xs">
                  Truques
                </TabsTrigger>
                <TabsTrigger value="leveled" className="text-xs">
                  Por Nível
                </TabsTrigger>
              </TabsList>

              {/* Tab: Todas */}
              <TabsContent value="all" className="space-y-2 mt-4 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {filteredSpells.map((spell) => (
                    <SpellCard key={spell.name} spell={spell} />
                  ))}
                </AnimatePresence>
                {filteredSpells.length === 0 && (
                  <p className="text-sm text-text-secondary text-center py-8">
                    Nenhuma magia encontrada
                  </p>
                )}
              </TabsContent>

              {/* Tab: Truques */}
              <TabsContent value="cantrips" className="space-y-2 mt-4 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {spellsByLevel[0]?.map((spell) => (
                    <SpellCard key={spell.name} spell={spell} />
                  ))}
                </AnimatePresence>
                {!spellsByLevel[0] && (
                  <p className="text-sm text-text-secondary text-center py-8">
                    Nenhum truque conhecido
                  </p>
                )}
              </TabsContent>

              {/* Tab: Por Nível */}
              <TabsContent value="leveled" className="space-y-4 mt-4 max-h-[600px] overflow-y-auto">
                {levels.filter((l) => l > 0).map((level) => (
                  <div key={level}>
                    <h4 className="text-sm font-semibold text-gold-500 mb-2">
                      Nível {level} ({spellsByLevel[level].length})
                    </h4>
                    <div className="space-y-2">
                      {spellsByLevel[level].map((spell) => (
                        <SpellCard key={spell.name} spell={spell} />
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Detalhes da magia selecionada */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <AnimatePresence mode="wait">
              {selectedSpell ? (
                <SpellDetails key={selectedSpell.name} spell={selectedSpell} />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8"
                >
                  <GiScrollUnfurled className="h-16 w-16 text-gold-500/30 mb-4" />
                  <p className="text-text-secondary">
                    Selecione uma magia para ver os detalhes
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
