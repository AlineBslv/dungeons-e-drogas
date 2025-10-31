/**
 * Sistema de Magias D&D 5e - Lista completa de magias
 */

export type SpellSchool =
  | "Abjuração"
  | "Adivinhação"
  | "Conjuração"
  | "Encantamento"
  | "Evocação"
  | "Ilusão"
  | "Necromancia"
  | "Transmutação";

export type SpellComponent = "V" | "S" | "M";

export type DamageType =
  | "ácido"
  | "contundente"
  | "cortante"
  | "elétrico"
  | "energia"
  | "fogo"
  | "frio"
  | "necrótico"
  | "perfurante"
  | "psíquico"
  | "radiante"
  | "trovão"
  | "veneno";

export interface SpellData {
  name: string;
  level: number; // 0 = Truque (Cantrip)
  school: SpellSchool;
  castingTime: string;
  range: string;
  components: SpellComponent[];
  materialComponents?: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higherLevels?: string;
  damageType?: DamageType;
  damageFormula?: string;
  savingThrow?: "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";
  attackRoll?: boolean;
  availableFor: string[]; // Classes que podem aprender
}

// ============================================
// TRUQUES (NÍVEL 0)
// ============================================

const CANTRIPS: SpellData[] = [
  {
    name: "Globos de Luz",
    level: 0,
    school: "Evocação",
    castingTime: "1 ação",
    range: "36 metros",
    components: ["V", "M"],
    materialComponents: "um pedaço de fósforo ou vaga-lume",
    duration: "1 minuto",
    concentration: true,
    ritual: false,
    description: "Cria até quatro luzes flutuantes que podem se mover a seu comando. Cada luz ilumina 3 metros de raio.",
    availableFor: ["Bardo", "Mago", "Bruxo", "Feiticeiro"],
  },
  {
    name: "Raio de Gelo",
    level: 0,
    school: "Evocação",
    castingTime: "1 ação",
    range: "18 metros",
    components: ["V", "S"],
    duration: "Instantânea",
    concentration: false,
    ritual: false,
    description: "Um raio gelado atinge uma criatura. Faça um ataque mágico à distância. Causa 1d8 de dano de frio e reduz velocidade em 3 metros.",
    damageType: "frio",
    damageFormula: "1d8",
    attackRoll: true,
    availableFor: ["Mago", "Feiticeiro", "Druida"],
    higherLevels: "O dano aumenta em 1d8 nos níveis 5 (2d8), 11 (3d8) e 17 (4d8).",
  },
  {
    name: "Rajada Mística",
    level: 0,
    school: "Evocação",
    castingTime: "1 ação",
    range: "36 metros",
    components: ["V", "S"],
    duration: "Instantânea",
    concentration: false,
    ritual: false,
    description: "Dispara até três raios de energia mística. Cada raio causa 1d4+1 de dano de energia.",
    damageType: "energia",
    damageFormula: "1d4+1",
    attackRoll: false,
    availableFor: ["Mago", "Feiticeiro"],
    higherLevels: "Cria um raio adicional nos níveis 5 (2 raios), 11 (3 raios) e 17 (4 raios).",
  },
  {
    name: "Toque Chocante",
    level: 0,
    school: "Evocação",
    castingTime: "1 ação",
    range: "Toque",
    components: ["V", "S"],
    duration: "Instantânea",
    concentration: false,
    ritual: false,
    description: "Um choque elétrico atinge uma criatura que você toca. Causa 1d8 de dano elétrico.",
    damageType: "elétrico",
    damageFormula: "1d8",
    attackRoll: true,
    availableFor: ["Mago", "Feiticeiro"],
    higherLevels: "O dano aumenta em 1d8 nos níveis 5 (2d8), 11 (3d8) e 17 (4d8).",
  },
  {
    name: "Orientação",
    level: 0,
    school: "Adivinhação",
    castingTime: "1 ação",
    range: "Toque",
    components: ["V", "S"],
    duration: "Até 1 minuto",
    concentration: true,
    ritual: false,
    description: "Toque uma criatura. Uma vez antes da magia acabar, o alvo pode rolar um d4 e adicionar ao resultado de um teste de atributo à sua escolha.",
    availableFor: ["Clérigo", "Druida", "Bardo"],
  },
  {
    name: "Consertar",
    level: 0,
    school: "Transmutação",
    castingTime: "1 minuto",
    range: "Toque",
    components: ["V", "S", "M"],
    materialComponents: "dois magnetitos",
    duration: "Instantânea",
    concentration: false,
    ritual: false,
    description: "Repara uma única quebra ou ruptura em um objeto que você toca. Máximo 30cm de diâmetro.",
    availableFor: ["Bardo", "Clérigo", "Druida", "Feiticeiro", "Mago"],
  },
];

// ============================================
// MAGIAS DE 1º NÍVEL
// ============================================

const LEVEL_1_SPELLS: SpellData[] = [
  {
    name: "Mísseis Mágicos",
    level: 1,
    school: "Evocação",
    castingTime: "1 ação",
    range: "36 metros",
    components: ["V", "S"],
    duration: "Instantânea",
    concentration: false,
    ritual: false,
    description: "Cria três dardos brilhantes de energia mística. Cada dardo acerta automaticamente e causa 1d4+1 de dano de energia.",
    damageType: "energia",
    damageFormula: "3×(1d4+1)",
    attackRoll: false,
    availableFor: ["Mago", "Feiticeiro"],
    higherLevels: "Cria um dardo adicional para cada nível de espaço acima do 1º.",
  },
  {
    name: "Escudo Arcano",
    level: 1,
    school: "Abjuração",
    castingTime: "1 reação",
    range: "Pessoal",
    components: ["V", "S"],
    duration: "1 rodada",
    concentration: false,
    ritual: false,
    description: "Uma barreira invisível de energia mágica aparece e protege você. Até o início do seu próximo turno, você tem +5 de bônus na CA.",
    availableFor: ["Mago", "Feiticeiro"],
  },
  {
    name: "Detectar Magia",
    level: 1,
    school: "Adivinhação",
    castingTime: "1 ação",
    range: "Pessoal",
    components: ["V", "S"],
    duration: "Até 10 minutos",
    concentration: true,
    ritual: true,
    description: "Pela duração, você sente a presença de magia a até 9 metros de você. Se sentir magia, pode usar uma ação para ver uma aura fraca ao redor.",
    availableFor: ["Bardo", "Clérigo", "Druida", "Mago", "Paladino", "Patrulheiro", "Feiticeiro"],
  },
  {
    name: "Curar Ferimentos",
    level: 1,
    school: "Evocação",
    castingTime: "1 ação",
    range: "Toque",
    components: ["V", "S"],
    duration: "Instantânea",
    concentration: false,
    ritual: false,
    description: "Uma criatura que você toca recupera 1d8 + seu modificador de habilidade de conjuração em pontos de vida.",
    availableFor: ["Bardo", "Clérigo", "Druida", "Paladino", "Patrulheiro"],
    higherLevels: "Cura 1d8 adicional para cada nível de espaço acima do 1º.",
  },
  {
    name: "Mãos Flamejantes",
    level: 1,
    school: "Evocação",
    castingTime: "1 ação",
    range: "Pessoal (cone de 4,5 metros)",
    components: ["V", "S"],
    duration: "Instantânea",
    concentration: false,
    ritual: false,
    description: "Estende suas mãos e um clarão de fogo brota delas. Cada criatura no cone deve fazer um TR de Destreza. Causa 3d6 de dano de fogo (metade em sucesso).",
    damageType: "fogo",
    damageFormula: "3d6",
    savingThrow: "dexterity",
    availableFor: ["Mago", "Feiticeiro"],
    higherLevels: "Causa 1d6 adicional de dano para cada nível de espaço acima do 1º.",
  },
  {
    name: "Enfeitiçar Pessoa",
    level: 1,
    school: "Encantamento",
    castingTime: "1 ação",
    range: "9 metros",
    components: ["V", "S"],
    duration: "1 hora",
    concentration: false,
    ritual: false,
    description: "Um humanoide que você possa ver deve fazer TR de Sabedoria. Se falhar, é enfeitiçado por você. Enquanto enfeitiçado, considera você um conhecido amigável.",
    savingThrow: "wisdom",
    availableFor: ["Bardo", "Bruxo", "Druida", "Feiticeiro", "Mago"],
    higherLevels: "Pode afetar uma criatura adicional para cada nível de espaço acima do 1º.",
  },
  {
    name: "Compreender Idiomas",
    level: 1,
    school: "Adivinhação",
    castingTime: "1 ação",
    range: "Pessoal",
    components: ["V", "S", "M"],
    materialComponents: "fuligem e sal",
    duration: "1 hora",
    concentration: false,
    ritual: true,
    description: "Pela duração, você compreende o significado literal de qualquer idioma falado que você ouvir.",
    availableFor: ["Bardo", "Bruxo", "Feiticeiro", "Mago"],
  },
];

// ============================================
// MAGIAS DE 2º NÍVEL
// ============================================

const LEVEL_2_SPELLS: SpellData[] = [
  {
    name: "Flecha Ácida de Melf",
    level: 2,
    school: "Evocação",
    castingTime: "1 ação",
    range: "27 metros",
    components: ["V", "S", "M"],
    materialComponents: "folha de ruibarbo e bile de víbora",
    duration: "Instantânea",
    concentration: false,
    ritual: false,
    description: "Uma flecha verde brilhante dispara em direção a um alvo e explode em um borrifo de ácido. Faça um ataque mágico à distância. Causa 4d4 de dano ácido imediatamente e 2d4 no final do próximo turno.",
    damageType: "ácido",
    damageFormula: "4d4 + 2d4",
    attackRoll: true,
    availableFor: ["Mago"],
    higherLevels: "Causa 1d4 adicional de dano imediato e contínuo para cada nível acima do 2º.",
  },
  {
    name: "Levitação",
    level: 2,
    school: "Transmutação",
    castingTime: "1 ação",
    range: "18 metros",
    components: ["V", "S", "M"],
    materialComponents: "um pequeno laço de couro",
    duration: "Até 10 minutos",
    concentration: true,
    ritual: false,
    description: "Uma criatura ou objeto de sua escolha levita até 6 metros do chão. Pode mover o alvo até 6 metros horizontalmente a cada turno.",
    availableFor: ["Mago", "Feiticeiro"],
  },
  {
    name: "Invisibilidade",
    level: 2,
    school: "Ilusão",
    castingTime: "1 ação",
    range: "Toque",
    components: ["V", "S", "M"],
    materialComponents: "um cílio envolvido em goma arábica",
    duration: "Até 1 hora",
    concentration: true,
    ritual: false,
    description: "Uma criatura que você toca se torna invisível até a magia acabar. Qualquer equipamento que a criatura está vestindo ou carregando também é invisível.",
    availableFor: ["Bardo", "Feiticeiro", "Bruxo", "Mago"],
    higherLevels: "Pode afetar uma criatura adicional para cada nível acima do 2º.",
  },
  {
    name: "Restauração Menor",
    level: 2,
    school: "Abjuração",
    castingTime: "1 ação",
    range: "Toque",
    components: ["V", "S"],
    duration: "Instantânea",
    concentration: false,
    ritual: false,
    description: "Você toca uma criatura e pode encerrar uma doença ou uma condição afetando-a. A condição pode ser cegado, surdo, paralizado ou envenenado.",
    availableFor: ["Bardo", "Clérigo", "Druida", "Paladino", "Patrulheiro"],
  },
  {
    name: "Imagem Silenciosa",
    level: 2,
    school: "Ilusão",
    castingTime: "1 ação",
    range: "18 metros",
    components: ["V", "S", "M"],
    materialComponents: "um pedaço de lã",
    duration: "Até 10 minutos",
    concentration: true,
    ritual: false,
    description: "Cria a imagem de um objeto, criatura ou fenômeno visível em um cubo de 6 metros. A imagem é puramente visual e não produz som, cheiro ou efeitos físicos.",
    availableFor: ["Bardo", "Feiticeiro", "Mago"],
  },
];

// ============================================
// MAGIAS DE 3º NÍVEL
// ============================================

const LEVEL_3_SPELLS: SpellData[] = [
  {
    name: "Bola de Fogo",
    level: 3,
    school: "Evocação",
    castingTime: "1 ação",
    range: "45 metros",
    components: ["V", "S", "M"],
    materialComponents: "uma bolinha de guano de morcego e enxofre",
    duration: "Instantânea",
    concentration: false,
    ritual: false,
    description: "Um raio de luz amarela brota de seu dedo e explode em uma esfera de 6 metros de raio. Cada criatura na área deve fazer um TR de Destreza. Causa 8d6 de dano de fogo (metade em sucesso).",
    damageType: "fogo",
    damageFormula: "8d6",
    savingThrow: "dexterity",
    availableFor: ["Mago", "Feiticeiro"],
    higherLevels: "Causa 1d6 adicional de dano para cada nível acima do 3º.",
  },
  {
    name: "Relâmpago",
    level: 3,
    school: "Evocação",
    castingTime: "1 ação",
    range: "Pessoal (linha de 30 metros)",
    components: ["V", "S", "M"],
    materialComponents: "um pedaço de pele e um bastão de âmbar, cristal ou vidro",
    duration: "Instantânea",
    concentration: false,
    ritual: false,
    description: "Um raio de 30 metros de comprimento e 1,5 metros de largura emana de você. Cada criatura na linha deve fazer um TR de Destreza. Causa 8d6 de dano elétrico (metade em sucesso).",
    damageType: "elétrico",
    damageFormula: "8d6",
    savingThrow: "dexterity",
    availableFor: ["Mago", "Feiticeiro"],
    higherLevels: "Causa 1d6 adicional de dano para cada nível acima do 3º.",
  },
  {
    name: "Dissipar Magia",
    level: 3,
    school: "Abjuração",
    castingTime: "1 ação",
    range: "36 metros",
    components: ["V", "S"],
    duration: "Instantânea",
    concentration: false,
    ritual: false,
    description: "Escolha uma criatura, objeto ou efeito mágico dentro do alcance. Qualquer magia de 3º nível ou inferior no alvo termina.",
    availableFor: ["Bardo", "Clérigo", "Druida", "Feiticeiro", "Bruxo", "Mago", "Paladino"],
    higherLevels: "Automaticamente dissipa magias de nível igual ou inferior ao nível do espaço usado.",
  },
  {
    name: "Voo",
    level: 3,
    school: "Transmutação",
    castingTime: "1 ação",
    range: "Toque",
    components: ["V", "S", "M"],
    materialComponents: "uma pena de asa de qualquer pássaro",
    duration: "Até 10 minutos",
    concentration: true,
    ritual: false,
    description: "Você toca uma criatura voluntária. O alvo ganha velocidade de voo de 18 metros pela duração.",
    availableFor: ["Mago", "Feiticeiro", "Bruxo"],
    higherLevels: "Pode afetar uma criatura adicional para cada nível acima do 3º.",
  },
  {
    name: "Contra-Feitiço",
    level: 3,
    school: "Abjuração",
    castingTime: "1 reação",
    range: "18 metros",
    components: ["S"],
    duration: "Instantânea",
    concentration: false,
    ritual: false,
    description: "Você tenta interromper uma criatura que esteja conjurando uma magia. Se a criatura estiver conjurando uma magia de 3º nível ou inferior, ela falha e não tem efeito.",
    availableFor: ["Feiticeiro", "Bruxo", "Mago"],
    higherLevels: "Interrompe automaticamente magias de nível igual ou inferior ao nível do espaço usado.",
  },
];

// ============================================
// AGREGAÇÃO DE TODAS AS MAGIAS
// ============================================

export const ALL_SPELLS: SpellData[] = [
  ...CANTRIPS,
  ...LEVEL_1_SPELLS,
  ...LEVEL_2_SPELLS,
  ...LEVEL_3_SPELLS,
];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Retorna magias disponíveis para uma classe
 */
export function getSpellsForClass(className: string, maxLevel?: number): SpellData[] {
  return ALL_SPELLS.filter(
    (spell) =>
      spell.availableFor.includes(className) &&
      (maxLevel === undefined || spell.level <= maxLevel)
  );
}

/**
 * Retorna magias de um nível específico
 */
export function getSpellsByLevel(level: number, className?: string): SpellData[] {
  let spells = ALL_SPELLS.filter((spell) => spell.level === level);

  if (className) {
    spells = spells.filter((spell) => spell.availableFor.includes(className));
  }

  return spells;
}

/**
 * Retorna truques (cantrips) disponíveis
 */
export function getCantripsForClass(className: string): SpellData[] {
  return getSpellsByLevel(0, className);
}

/**
 * Busca uma magia por nome
 */
export function getSpellByName(name: string): SpellData | undefined {
  return ALL_SPELLS.find((spell) => spell.name === name);
}

/**
 * Calcula CD de resistência para magias
 * CD = 8 + bônus de proficiência + modificador do atributo de conjuração
 */
export function calculateSpellSaveDC(
  proficiencyBonus: number,
  spellcastingModifier: number
): number {
  return 8 + proficiencyBonus + spellcastingModifier;
}

/**
 * Calcula bônus de ataque mágico
 * Bônus = bônus de proficiência + modificador do atributo de conjuração
 */
export function calculateSpellAttackBonus(
  proficiencyBonus: number,
  spellcastingModifier: number
): number {
  return proficiencyBonus + spellcastingModifier;
}

/**
 * Formata componentes de magia para exibição
 */
export function formatSpellComponents(spell: SpellData): string {
  const components = spell.components.join(", ");

  if (spell.materialComponents) {
    return `${components} (${spell.materialComponents})`;
  }

  return components;
}

/**
 * Retorna ícone/emoji baseado na escola de magia
 */
export function getSchoolIcon(school: SpellSchool): string {
  const icons: Record<SpellSchool, string> = {
    Abjuração: "🛡️",
    Adivinhação: "🔮",
    Conjuração: "✨",
    Encantamento: "💫",
    Evocação: "⚡",
    Ilusão: "🎭",
    Necromancia: "💀",
    Transmutação: "🔄",
  };

  return icons[school] || "✨";
}

/**
 * Retorna cor baseada no nível da magia
 */
export function getSpellLevelColor(level: number): string {
  if (level === 0) return "text-blue-400";
  if (level <= 2) return "text-green-400";
  if (level <= 4) return "text-yellow-400";
  if (level <= 6) return "text-orange-400";
  return "text-red-400";
}
