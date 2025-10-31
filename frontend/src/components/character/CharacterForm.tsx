"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  CharacterSheet,
  calculateAttributeModifier,
  calculateProficiencyBonus
} from "@/lib/firestore-helpers";
import {
  RACES,
  CLASSES,
  applyRacialBonuses,
  getClassFeaturesAtLevel,
  calculateMaxHP,
  SKILLS,
  type SkillName
} from "@/lib/dnd-data";
import {
  GiCrossedSwords,
  GiShield,
  GiHeartBottle,
  GiBrain,
  GiBoltSpellCast,
  GiScrollQuill
} from "react-icons/gi";
import { cn } from "@/lib/utils";
import { PointBuyEditor } from "./PointBuyEditor";

interface CharacterFormProps {
  initialData?: Partial<CharacterSheet & { id: string }>;
  onSave: (data: Partial<CharacterSheet>) => Promise<void>;
  onCancel?: () => void;
  campaignId?: string;
}

const DND_CLASSES = [
  "Bárbaro", "Bardo", "Clérigo", "Druida", "Guerreiro",
  "Monge", "Paladino", "Patrulheiro", "Ladino", "Feiticeiro",
  "Bruxo", "Mago"
];

const DND_RACES = [
  "Humano", "Elfo", "Anão", "Halfling", "Draconato",
  "Gnomo", "Meio-Elfo", "Meio-Orc", "Tiefling"
];

const ALIGNMENTS = [
  "Leal e Bom", "Neutro e Bom", "Caótico e Bom",
  "Leal e Neutro", "Neutro", "Caótico e Neutro",
  "Leal e Mau", "Neutro e Mau", "Caótico e Mau"
];

export function CharacterForm({ initialData, onSave, onCancel, campaignId }: CharacterFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<SkillName[]>([]);

  const [formData, setFormData] = useState<Partial<CharacterSheet>>({
    name: initialData?.name || "",
    class: initialData?.class || "Guerreiro",
    race: initialData?.race || "Humano",
    level: initialData?.level || 1,
    background: initialData?.background || "",
    alignment: initialData?.alignment || "Neutro",
    attributes: initialData?.attributes || {
      strength: 8,
      dexterity: 8,
      constitution: 8,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
    },
    hp: initialData?.hp || {
      current: 10,
      max: 10,
      temporary: 0,
    },
    armor_class: initialData?.armor_class || 10,
    proficiencies: initialData?.proficiencies || {
      armor: [],
      weapons: [],
      tools: [],
      languages: ["Comum"],
    },
    skills: initialData?.skills || {},
    equipment: initialData?.equipment || {
      inventory: [],
    },
    personality_traits: initialData?.personality_traits || "",
    ideals: initialData?.ideals || "",
    bonds: initialData?.bonds || "",
    flaws: initialData?.flaws || "",
    backstory: initialData?.backstory || "",
    campaign_id: campaignId || initialData?.campaign_id,
  });

  // Aplica automaticamente bônus raciais e de classe quando raça ou classe muda
  useEffect(() => {
    if (!formData.race || !formData.class) return;

    const race = RACES[formData.race];
    const classData = CLASSES[formData.class];

    if (!race || !classData) return;

    // Apenas aplica se for a primeira vez ou se raça/classe mudou
    // Evita recalcular se usuário está editando atributos manualmente
    if (initialData?.id) return; // Não sobrescrever em modo de edição

    // No modo de criação (Point Buy), não sobrescreve os atributos que o usuário está definindo
    // Apenas atualiza proficiências

    // Aplica proficiências da classe
    const proficiencies = {
      armor: classData.proficiencies.armor,
      weapons: classData.proficiencies.weapons,
      tools: classData.proficiencies.tools,
      languages: race.languages,
    };

    setFormData(prev => ({
      ...prev,
      proficiencies,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.race, formData.class]);

  // Recalcula valores derivados quando level muda
  useEffect(() => {
    const profBonus = calculateProficiencyBonus(formData.level || 1);

    // Recalcula HP máximo se houver classe e atributos
    if (formData.class && formData.attributes) {
      const conMod = calculateAttributeModifier(formData.attributes.constitution);
      const maxHP = calculateMaxHP(formData.class, formData.level || 1, conMod);

      setFormData(prev => ({
        ...prev,
        proficiency_bonus: profBonus,
        hp: { ...prev.hp!, max: maxHP }
      }));
    } else {
      setFormData(prev => ({ ...prev, proficiency_bonus: profBonus }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.level]);

  const handleAttributeChange = (attr: keyof typeof formData.attributes, value: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes!,
        [attr]: Math.max(1, Math.min(20, value)),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== INICIANDO SALVAMENTO ===");
    console.log("Form data:", formData);

    // Validação de Point Buy no modo de criação
    if (!initialData?.id) {
      const POINT_COSTS: { [key: number]: number } = {
        8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
      };

      // Calcula pontos totais baseado no nível e classe (ASI)
      const calculateTotalPoints = (level: number, characterClass?: string): number => {
        let points = 27; // Base

        // ASI padrão para todas as classes (níveis 4, 8, 12, 16, 19)
        if (level >= 4) points += 2;
        if (level >= 8) points += 2;
        if (level >= 12) points += 2;
        if (level >= 16) points += 2;
        if (level >= 19) points += 2;

        // ASI extras para Fighter (níveis 6 e 14)
        if (characterClass === "Guerreiro") {
          if (level >= 6) points += 2;
          if (level >= 14) points += 2;
        }

        // ASI extra para Rogue (nível 10)
        if (characterClass === "Ladino") {
          if (level >= 10) points += 2;
        }

        return points;
      };

      const expectedPoints = calculateTotalPoints(formData.level || 1, formData.class);

      const totalCost = Object.values(formData.attributes || {}).reduce((total, value) => {
        return total + (POINT_COSTS[value] || 0);
      }, 0);

      if (totalCost !== expectedPoints) {
        toast.error(`Você deve distribuir exatamente ${expectedPoints} pontos nos atributos. Atualmente: ${totalCost} pontos.`);
        return;
      }

      // Validação de limites de atributos
      const invalidAttrs = Object.entries(formData.attributes || {}).filter(
        ([_, value]) => value < 8 || value > 15
      );

      if (invalidAttrs.length > 0) {
        toast.error("Os atributos devem estar entre 8 e 15 antes de aplicar bônus raciais.");
        return;
      }
    }

    setLoading(true);

    try {
      console.log("Chamando onSave...");
      await onSave(formData);
      console.log("onSave completado com sucesso!");
      toast.success("Personagem salvo com sucesso!");
    } catch (error) {
      console.error("❌ ERRO ao salvar ficha:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : "N/A");
      console.error("Tipo do erro:", typeof error);
      toast.error(`Erro ao salvar ficha: ${error instanceof Error ? error.message : JSON.stringify(error)}. Verifique o console para mais detalhes.`);
    } finally {
      setLoading(false);
      console.log("=== FIM DO SALVAMENTO ===");
    }
  };

  const getAttributeModifier = (value: number) => {
    const mod = calculateAttributeModifier(value);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const handleSkillToggle = (skillName: SkillName) => {
    const classData = CLASSES[formData.class || "Guerreiro"];
    const maxSkills = classData.skillChoices.choose;

    setSelectedSkills(prev => {
      if (prev.includes(skillName)) {
        return prev.filter(s => s !== skillName);
      }
      if (prev.length < maxSkills) {
        return [...prev, skillName];
      }
      return prev;
    });

    // Atualiza skills no formData
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillName]: {
          proficient: !prev.skills?.[skillName]?.proficient,
          expertise: false,
        }
      }
    }));
  };

  const currentRace = formData.race ? RACES[formData.race] : null;
  const currentClass = formData.class ? CLASSES[formData.class] : null;
  const classFeatures = formData.class && formData.level
    ? getClassFeaturesAtLevel(formData.class, formData.level)
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="border-gold-500/40">
        <CardHeader>
          <CardTitle className="font-medieval text-gold-500 flex items-center gap-2">
            <GiShield className="h-5 w-5" />
            {initialData?.id ? "Editar Personagem" : "Criar Personagem"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Personagem *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: Thorin Escudo de Pedra"
              />
            </div>

            <div>
              <Label htmlFor="class">Classe *</Label>
              <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                <SelectTrigger id="class">
                  <SelectValue placeholder="Selecione uma classe" />
                </SelectTrigger>
                <SelectContent>
                  {DND_CLASSES.map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="race">Raça *</Label>
              <Select value={formData.race} onValueChange={(value) => setFormData({ ...formData, race: value })}>
                <SelectTrigger id="race">
                  <SelectValue placeholder="Selecione uma raça" />
                </SelectTrigger>
                <SelectContent>
                  {DND_RACES.map((race) => (
                    <SelectItem key={race} value={race}>{race}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Nível *</Label>
              <Input
                id="level"
                type="number"
                min="1"
                max="20"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="background">Antecedente</Label>
              <Input
                id="background"
                value={formData.background}
                onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                placeholder="Ex: Soldado, Nobre, Criminoso"
              />
            </div>

            <div>
              <Label htmlFor="alignment">Alinhamento</Label>
              <Select value={formData.alignment} onValueChange={(value) => setFormData({ ...formData, alignment: value })}>
                <SelectTrigger id="alignment">
                  <SelectValue placeholder="Selecione um alinhamento" />
                </SelectTrigger>
                <SelectContent>
                  {ALIGNMENTS.map((align) => (
                    <SelectItem key={align} value={align}>{align}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informações Automáticas (Bônus Raciais e Features de Classe) */}
          {currentRace && currentClass && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bônus Raciais */}
              <Card className="border-gold-500/20 bg-dark-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-ui flex items-center gap-2 text-emerald">
                    <GiScrollQuill className="h-4 w-4" />
                    Bônus Raciais ({currentRace.name})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {Object.entries(currentRace.bonuses).map(([attr, bonus]) => (
                    <div key={attr} className="flex justify-between items-center">
                      <span className="text-text-secondary capitalize">{attr === 'strength' ? 'Força' : attr === 'dexterity' ? 'Destreza' : attr === 'constitution' ? 'Constituição' : attr === 'intelligence' ? 'Inteligência' : attr === 'wisdom' ? 'Sabedoria' : 'Carisma'}</span>
                      <span className="text-emerald font-bold">+{bonus}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border mt-2">
                    <div className="text-text-secondary">Velocidade: {currentRace.speed} pés</div>
                    <div className="text-text-secondary">Idiomas: {currentRace.languages.join(", ")}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Proficiências de Classe */}
              <Card className="border-gold-500/20 bg-dark-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-ui flex items-center gap-2 text-gold-500">
                    <GiShield className="h-4 w-4" />
                    Proficiências ({currentClass.name})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div>
                    <span className="text-text-secondary font-semibold">Armaduras:</span>
                    <div className="text-text-primary ml-2">{currentClass.proficiencies.armor.join(", ") || "Nenhuma"}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary font-semibold">Armas:</span>
                    <div className="text-text-primary ml-2">{currentClass.proficiencies.weapons.join(", ")}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary font-semibold">Ferramentas:</span>
                    <div className="text-text-primary ml-2">{currentClass.proficiencies.tools.join(", ") || "Nenhuma"}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary font-semibold">Dado de Vida:</span>
                    <span className="text-ruby ml-2">d{currentClass.hitDie}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Atributos */}
          <div>
            {!initialData?.id ? (
              // Modo criação: usa Point Buy Editor
              <PointBuyEditor
                attributes={formData.attributes!}
                onChange={(newAttributes) => setFormData(prev => ({ ...prev, attributes: newAttributes }))}
                racialBonuses={formData.race ? RACES[formData.race]?.bonuses : undefined}
                level={formData.level || 1}
                characterClass={formData.class}
              />
            ) : (
              // Modo edição: usa inputs tradicionais
              <>
                <h3 className="text-lg font-medieval text-gold-500 mb-3 flex items-center gap-2">
                  <GiBrain className="h-5 w-5" />
                  Atributos (com bônus raciais aplicados)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(formData.attributes || {}).map(([attr, value]) => (
                    <div key={attr} className="space-y-1">
                      <Label htmlFor={attr} className="text-xs uppercase">
                        {attr === 'strength' && 'Força'}
                        {attr === 'dexterity' && 'Destreza'}
                        {attr === 'constitution' && 'Constituição'}
                        {attr === 'intelligence' && 'Inteligência'}
                        {attr === 'wisdom' && 'Sabedoria'}
                        {attr === 'charisma' && 'Carisma'}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={attr}
                          type="number"
                          min="1"
                          max="20"
                          value={value}
                          onChange={(e) => handleAttributeChange(attr as keyof typeof formData.attributes, parseInt(e.target.value) || 10)}
                          className="w-16 text-center"
                        />
                        <span className={cn(
                          "text-sm font-bold px-2 py-1 rounded",
                          calculateAttributeModifier(value) >= 0
                            ? "text-emerald bg-emerald/10"
                            : "text-ruby bg-ruby/10"
                        )}>
                          {getAttributeModifier(value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pontos de Vida e CA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="hp_max" className="flex items-center gap-1">
                <GiHeartBottle className="h-4 w-4 text-ruby" />
                HP Máximo
              </Label>
              <Input
                id="hp_max"
                type="number"
                min="1"
                value={formData.hp?.max}
                onChange={(e) => setFormData({
                  ...formData,
                  hp: { ...formData.hp!, max: parseInt(e.target.value) || 10 }
                })}
              />
            </div>

            <div>
              <Label htmlFor="hp_current">HP Atual</Label>
              <Input
                id="hp_current"
                type="number"
                min="0"
                value={formData.hp?.current}
                onChange={(e) => setFormData({
                  ...formData,
                  hp: { ...formData.hp!, current: parseInt(e.target.value) || 10 }
                })}
              />
            </div>

            <div>
              <Label htmlFor="armor_class" className="flex items-center gap-1">
                <GiShield className="h-4 w-4 text-gold-500" />
                Classe de Armadura
              </Label>
              <Input
                id="armor_class"
                type="number"
                min="1"
                value={formData.armor_class}
                onChange={(e) => setFormData({
                  ...formData,
                  armor_class: parseInt(e.target.value) || 10
                })}
              />
            </div>
          </div>

          {/* Perícias (Skills) */}
          {currentClass && (
            <div>
              <h3 className="text-lg font-medieval text-gold-500 mb-3 flex items-center gap-2">
                <GiBoltSpellCast className="h-5 w-5" />
                Perícias - Escolha {currentClass.skillChoices.choose} perícias
              </h3>
              <p className="text-xs text-text-secondary mb-3">
                Selecionadas: {selectedSkills.length}/{currentClass.skillChoices.choose}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {currentClass.skillChoices.from.map((skillName) => {
                  const skill = SKILLS[skillName];
                  const isSelected = selectedSkills.includes(skillName);
                  const isDisabled = !isSelected && selectedSkills.length >= currentClass.skillChoices.choose;

                  return (
                    <button
                      key={skillName}
                      type="button"
                      onClick={() => handleSkillToggle(skillName)}
                      disabled={isDisabled}
                      className={cn(
                        "p-3 rounded-md border text-left text-sm transition-all",
                        isSelected
                          ? "border-emerald bg-emerald/10 text-emerald"
                          : isDisabled
                          ? "border-border bg-dark-500/30 text-text-secondary/50 cursor-not-allowed"
                          : "border-border bg-dark-500 text-text-primary hover:border-gold-500/40"
                      )}
                    >
                      <div className="font-semibold">{skill.name}</div>
                      <div className="text-xs opacity-70 capitalize">
                        {skill.attribute === 'strength' ? 'Força' :
                         skill.attribute === 'dexterity' ? 'Destreza' :
                         skill.attribute === 'constitution' ? 'Constituição' :
                         skill.attribute === 'intelligence' ? 'Inteligência' :
                         skill.attribute === 'wisdom' ? 'Sabedoria' : 'Carisma'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Features de Classe */}
          {classFeatures.length > 0 && (
            <Card className="border-gold-500/20 bg-dark-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-ui flex items-center gap-2 text-gold-500">
                  <GiBoltSpellCast className="h-4 w-4" />
                  Características de Classe (Nível {formData.level})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-xs text-text-secondary">
                  {classFeatures.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Equipamento */}
          <div>
            <h3 className="text-lg font-medieval text-gold-500 mb-3 flex items-center gap-2">
              <GiCrossedSwords className="h-5 w-5" />
              Equipamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="armor">Armadura</Label>
                <Input
                  id="armor"
                  value={formData.equipment?.armor || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    equipment: { ...formData.equipment!, armor: e.target.value }
                  })}
                  placeholder="Ex: Cota de Malha"
                />
              </div>

              <div>
                <Label htmlFor="weapon_main">Arma Principal</Label>
                <Input
                  id="weapon_main"
                  value={formData.equipment?.weapon_main || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    equipment: { ...formData.equipment!, weapon_main: e.target.value }
                  })}
                  placeholder="Ex: Espada Longa"
                />
              </div>

              <div>
                <Label htmlFor="weapon_off">Arma Secundária</Label>
                <Input
                  id="weapon_off"
                  value={formData.equipment?.weapon_off || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    equipment: { ...formData.equipment!, weapon_off: e.target.value }
                  })}
                  placeholder="Ex: Escudo"
                />
              </div>
            </div>
          </div>

          {/* Informações Narrativas */}
          <div>
            <h3 className="text-lg font-medieval text-gold-500 mb-3">Personalidade</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="personality_traits">Traços de Personalidade</Label>
                <Textarea
                  id="personality_traits"
                  value={formData.personality_traits}
                  onChange={(e) => setFormData({ ...formData, personality_traits: e.target.value })}
                  placeholder="Descreva os traços marcantes do personagem..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="ideals">Ideais</Label>
                <Input
                  id="ideals"
                  value={formData.ideals}
                  onChange={(e) => setFormData({ ...formData, ideals: e.target.value })}
                  placeholder="Ex: Honra, Liberdade, Poder"
                />
              </div>

              <div>
                <Label htmlFor="bonds">Vínculos</Label>
                <Input
                  id="bonds"
                  value={formData.bonds}
                  onChange={(e) => setFormData({ ...formData, bonds: e.target.value })}
                  placeholder="Ex: Família, Guilda, Juramento"
                />
              </div>

              <div>
                <Label htmlFor="flaws">Defeitos</Label>
                <Input
                  id="flaws"
                  value={formData.flaws}
                  onChange={(e) => setFormData({ ...formData, flaws: e.target.value })}
                  placeholder="Ex: Impulsivo, Arrogante, Ganancioso"
                />
              </div>

              <div>
                <Label htmlFor="backstory">História de Fundo</Label>
                <Textarea
                  id="backstory"
                  value={formData.backstory}
                  onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
                  placeholder="Conte a história do seu personagem..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              variant="drogon"
              disabled={loading || !formData.name}
              className="flex-1"
            >
              {loading ? "Salvando..." : initialData?.id ? "Atualizar" : "Criar Personagem"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
