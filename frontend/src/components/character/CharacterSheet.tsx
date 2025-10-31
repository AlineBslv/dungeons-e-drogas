"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CharacterSheet as CharacterSheetType,
  calculateAttributeModifier,
} from "@/lib/firestore-helpers";
import {
  Sword,
  Shield,
  Heart,
  Brain,
  Edit,
  Trash2,
  Scroll,
  Backpack,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion-presets";
import { CharacterDiceActions } from "./CharacterDiceActions";
import { SpellcastingPanel } from "@/components/spells";

interface CharacterSheetProps {
  character: CharacterSheetType & { id: string };
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export function CharacterSheetView({
  character,
  onEdit,
  onDelete,
  compact = false,
}: CharacterSheetProps) {
  const getAttributeModifier = (value: number) => {
    const mod = calculateAttributeModifier(value);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const hpPercentage = (character.hp.current / character.hp.max) * 100;

  if (compact) {
    return (
      <Card className="border-gold-500/40 hover:border-gold-500/60 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="h-10 w-10 text-gold-500" />
              <div>
                <h3 className="font-medieval text-lg text-gold-500">{character.name}</h3>
                <p className="text-sm text-text-secondary">
                  {character.race} {character.class} • Nível {character.level}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-text-secondary">HP</div>
                <div className="font-bold text-text-primary">
                  {character.hp.current}/{character.hp.max}
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-text-secondary">CA</div>
                <div className="font-bold text-text-primary">{character.armor_class}</div>
              </div>

              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-4"
    >
      {/* Cabeçalho */}
      <motion.div variants={staggerItem}>
        <Card className="border-gold-500/40">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Shield className="h-12 w-12 text-gold-500 animate-rune-glow" />
                <div>
                  <CardTitle className="text-2xl font-medieval text-gold-500">
                    {character.name}
                  </CardTitle>
                  <p className="text-text-secondary font-ui mt-1">
                    {character.race} {character.class} • Nível {character.level}
                  </p>
                  {character.background && (
                    <p className="text-sm text-text-secondary/80">
                      {character.background}
                    </p>
                  )}
                </div>
              </div>

              {(onEdit || onDelete) && (
                <div className="flex gap-2">
                  {onEdit && (
                    <Button variant="outline" size="sm" onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onDelete}
                      className="text-ruby border-ruby/40 hover:bg-ruby/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Tabs para organizar informações */}
      <motion.div variants={staggerItem}>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="stats">
              <Brain className="h-4 w-4 mr-2" />
              Atributos
            </TabsTrigger>
            <TabsTrigger value="equipment">
              <Sword className="h-4 w-4 mr-2" />
              Equipamento
            </TabsTrigger>
            <TabsTrigger value="skills">
              <Scroll className="h-4 w-4 mr-2" />
              Perícias
            </TabsTrigger>
            <TabsTrigger value="spells">
              ✨ Magias
            </TabsTrigger>
            <TabsTrigger value="dice">
              🎲 Dados
            </TabsTrigger>
          </TabsList>

          {/* Tab: Atributos */}
          <TabsContent value="stats" className="space-y-4 mt-4">
            <Card className="border-gold-500/30">
              <CardHeader>
                <CardTitle className="text-lg font-ui flex items-center gap-2">
                  <Brain className="h-5 w-5 text-gold-500" />
                  Atributos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(character.attributes).map(([attr, value]) => (
                  <div
                    key={attr}
                    className="flex items-center justify-between p-2 bg-dark-500 rounded-md"
                  >
                    <span className="text-sm font-ui text-text-secondary capitalize">
                      {attr === "strength" && "Força"}
                      {attr === "dexterity" && "Destreza"}
                      {attr === "constitution" && "Constituição"}
                      {attr === "intelligence" && "Inteligência"}
                      {attr === "wisdom" && "Sabedoria"}
                      {attr === "charisma" && "Carisma"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-text-primary">{value}</span>
                      <span
                        className={cn(
                          "text-sm font-bold px-2 py-1 rounded min-w-[3rem] text-center",
                          calculateAttributeModifier(value) >= 0
                            ? "text-emerald bg-emerald/10"
                            : "text-ruby bg-ruby/10"
                        )}
                      >
                        {getAttributeModifier(value)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* HP e CA */}
            <Card className="border-gold-500/30">
              <CardHeader>
                <CardTitle className="text-lg font-ui">Status de Combate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* HP */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-ui text-text-secondary flex items-center gap-2">
                      <Heart className="h-4 w-4 text-ruby" />
                      Pontos de Vida
                    </span>
                    <span className="font-bold text-text-primary">
                      {character.hp.current}/{character.hp.max}
                      {character.hp.temporary > 0 && (
                        <span className="text-emerald ml-2">+{character.hp.temporary}</span>
                      )}
                    </span>
                  </div>
                  <div className="h-3 bg-dark-500 rounded-full overflow-hidden border border-border">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${hpPercentage}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        hpPercentage > 60
                          ? "bg-emerald"
                          : hpPercentage > 30
                          ? "bg-gold-500"
                          : "bg-ruby animate-pulse"
                      )}
                    />
                  </div>
                </div>

                {/* CA e Bônus de Proficiência */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-dark-500 rounded-md border border-gold-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-gold-500" />
                      <span className="text-xs text-text-secondary">Classe de Armadura</span>
                    </div>
                    <div className="text-2xl font-bold text-text-primary">
                      {character.armor_class}
                    </div>
                  </div>

                  <div className="p-3 bg-dark-500 rounded-md border border-gold-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Scroll className="h-4 w-4 text-gold-500" />
                      <span className="text-xs text-text-secondary">Bônus de Proficiência</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald">
                      +{character.proficiency_bonus}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Equipamento */}
          <TabsContent value="equipment" className="space-y-4 mt-4">
            <Card className="border-gold-500/30">
              <CardHeader>
                <CardTitle className="text-lg font-ui flex items-center gap-2">
                  <Sword className="h-5 w-5 text-gold-500" />
                  Equipamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {character.equipment.armor && (
                  <div className="flex items-center justify-between p-2 bg-dark-500 rounded-md">
                    <span className="text-sm text-text-secondary">Armadura</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {character.equipment.armor}
                    </span>
                  </div>
                )}
                {character.equipment.weapon_main && (
                  <div className="flex items-center justify-between p-2 bg-dark-500 rounded-md">
                    <span className="text-sm text-text-secondary">Arma Principal</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {character.equipment.weapon_main}
                    </span>
                  </div>
                )}
                {character.equipment.weapon_off && (
                  <div className="flex items-center justify-between p-2 bg-dark-500 rounded-md">
                    <span className="text-sm text-text-secondary">Arma Secundária</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {character.equipment.weapon_off}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Inventário */}
            {character.equipment.inventory.length > 0 && (
              <Card className="border-gold-500/30">
                <CardHeader>
                  <CardTitle className="text-lg font-ui flex items-center gap-2">
                    <Backpack className="h-5 w-5 text-gold-500" />
                    Inventário ({character.equipment.inventory.length} itens)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {character.equipment.inventory.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-dark-500 rounded-md border border-border hover:border-gold-500/40 transition-colors"
                      >
                        <div className="font-semibold text-sm text-text-primary">
                          {item.name}
                        </div>
                        <div className="text-xs text-text-secondary">Qtd: {item.quantity}</div>
                        {item.description && (
                          <div className="text-xs text-text-secondary/70 mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Perícias */}
          <TabsContent value="skills" className="space-y-4 mt-4">
            <Card className="border-gold-500/30">
              <CardHeader>
                <CardTitle className="text-lg font-ui flex items-center gap-2">
                  <Scroll className="h-5 w-5 text-gold-500" />
                  Perícias Treinadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {character.skills && Object.keys(character.skills).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(character.skills)
                      .filter(([, data]) => data.proficient)
                      .map(([skill, data]) => (
                        <div
                          key={skill}
                          className="p-3 bg-dark-500 rounded-md border border-border"
                        >
                          <div className="font-semibold text-sm text-text-primary capitalize">
                            {skill}
                          </div>
                          {data.expertise && (
                            <div className="text-xs text-emerald mt-1">Expertise</div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary text-center py-4">
                    Nenhuma perícia treinada
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Proficiências */}
            <Card className="border-gold-500/30">
              <CardHeader>
                <CardTitle className="text-lg font-ui">Proficiências</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gold-500">Armaduras:</span>
                  <p className="text-text-secondary ml-2">
                    {character.proficiencies.armor.join(", ") || "Nenhuma"}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gold-500">Armas:</span>
                  <p className="text-text-secondary ml-2">
                    {character.proficiencies.weapons.join(", ")}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gold-500">Ferramentas:</span>
                  <p className="text-text-secondary ml-2">
                    {character.proficiencies.tools.join(", ") || "Nenhuma"}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gold-500">Idiomas:</span>
                  <p className="text-text-secondary ml-2">
                    {character.proficiencies.languages.join(", ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Magias */}
          <TabsContent value="spells" className="mt-4">
            <SpellcastingPanel character={character} />
          </TabsContent>

          {/* Tab: Dados */}
          <TabsContent value="dice" className="mt-4">
            <CharacterDiceActions character={character} />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Personalidade e História */}
      {(character.personality_traits ||
        character.ideals ||
        character.bonds ||
        character.flaws ||
        character.backstory) && (
        <motion.div variants={staggerItem}>
          <Card className="border-gold-500/30">
            <CardHeader>
              <CardTitle className="text-lg font-ui flex items-center gap-2">
                <Scroll className="h-5 w-5 text-gold-500" />
                Personalidade e História
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {character.personality_traits && (
                <div>
                  <h4 className="text-sm font-semibold text-gold-500 mb-1">
                    Traços de Personalidade
                  </h4>
                  <p className="text-sm text-text-secondary">{character.personality_traits}</p>
                </div>
              )}
              {character.ideals && (
                <div>
                  <h4 className="text-sm font-semibold text-gold-500 mb-1">Ideais</h4>
                  <p className="text-sm text-text-secondary">{character.ideals}</p>
                </div>
              )}
              {character.bonds && (
                <div>
                  <h4 className="text-sm font-semibold text-gold-500 mb-1">Vínculos</h4>
                  <p className="text-sm text-text-secondary">{character.bonds}</p>
                </div>
              )}
              {character.flaws && (
                <div>
                  <h4 className="text-sm font-semibold text-gold-500 mb-1">Defeitos</h4>
                  <p className="text-sm text-text-secondary">{character.flaws}</p>
                </div>
              )}
              {character.backstory && (
                <div>
                  <h4 className="text-sm font-semibold text-gold-500 mb-1">História de Fundo</h4>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">
                    {character.backstory}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
