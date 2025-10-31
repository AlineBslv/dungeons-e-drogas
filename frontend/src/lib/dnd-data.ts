/**
 * Sistema de dados D&D 5e - Raças, Classes, Talentos e Perícias
 */

// ==================== RAÇAS E SUB-RAÇAS ====================

export interface RacialBonus {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

export interface SubraceData {
  name: string;
  bonuses: RacialBonus;
  traits: string[];
}

export interface RaceData {
  name: string;
  bonuses: RacialBonus;
  speed: number;
  languages: string[];
  traits: string[];
  subraces?: Record<string, SubraceData>;
}

export const RACES: Record<string, RaceData> = {
  "Humano": {
    name: "Humano",
    bonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    speed: 30,
    languages: ["Comum", "Uma linguagem adicional à escolha"],
    traits: ["Versátil - +1 em todos os atributos"]
  },
  "Elfo": {
    name: "Elfo",
    bonuses: { dexterity: 2 },
    speed: 30,
    languages: ["Comum", "Élfico"],
    traits: ["Visão no Escuro", "Sentidos Aguçados", "Ancestral Feérico", "Transe"],
    subraces: {
      "Alto Elfo": {
        name: "Alto Elfo",
        bonuses: { intelligence: 1 },
        traits: ["Proficiência com Armas Élficas", "Truque (um truque de mago)", "Idioma Adicional"]
      },
      "Elfo da Floresta": {
        name: "Elfo da Floresta",
        bonuses: { wisdom: 1 },
        traits: ["Pés Leves", "Máscara da Natureza (esconder-se em folhagem, chuva, neve, névoa)"]
      },
      "Elfo Negro (Drow)": {
        name: "Elfo Negro (Drow)",
        bonuses: { charisma: 1 },
        traits: ["Visão no Escuro Superior (120 pés)", "Sensibilidade à Luz Solar", "Magia Drow (Globos de Luz, Fogo das Fadas)"]
      }
    }
  },
  "Anão": {
    name: "Anão",
    bonuses: { constitution: 2 },
    speed: 25,
    languages: ["Comum", "Anão"],
    traits: ["Visão no Escuro", "Resiliência Anã", "Proficiência em Ferramentas"],
    subraces: {
      "Anão da Montanha": {
        name: "Anão da Montanha",
        bonuses: { strength: 2 },
        traits: ["Proficiência com Armaduras Leves e Médias"]
      },
      "Anão da Colina": {
        name: "Anão da Colina",
        bonuses: { wisdom: 1 },
        traits: ["Tenacidade Anã (+1 HP por nível)"]
      }
    }
  },
  "Halfling": {
    name: "Halfling",
    bonuses: { dexterity: 2 },
    speed: 25,
    languages: ["Comum", "Halfling"],
    traits: ["Sortudo", "Bravura", "Agilidade Halfling"],
    subraces: {
      "Pés-Leves": {
        name: "Pés-Leves",
        bonuses: { charisma: 1 },
        traits: ["Furtividade Natural"]
      },
      "Robusto": {
        name: "Robusto",
        bonuses: { constitution: 1 },
        traits: ["Resistência Robusta (vantagem contra veneno)"]
      }
    }
  },
  "Draconato": {
    name: "Draconato",
    bonuses: { strength: 2, charisma: 1 },
    speed: 30,
    languages: ["Comum", "Dracônico"],
    traits: ["Ancestral Dracônico", "Arma de Sopro", "Resistência a Dano"]
  },
  "Gnomo": {
    name: "Gnomo",
    bonuses: { intelligence: 2 },
    speed: 25,
    languages: ["Comum", "Gnômico"],
    traits: ["Visão no Escuro", "Esperteza Gnômica"],
    subraces: {
      "Gnomo da Floresta": {
        name: "Gnomo da Floresta",
        bonuses: { dexterity: 1 },
        traits: ["Ilusionista Natural", "Falar com Pequenas Bestas"]
      },
      "Gnomo das Rochas": {
        name: "Gnomo das Rochas",
        bonuses: { constitution: 1 },
        traits: ["Conhecimento de Artífice", "Engenhoqueiro"]
      }
    }
  },
  "Meio-Elfo": {
    name: "Meio-Elfo",
    bonuses: { charisma: 2 }, // +1 em outros dois atributos à escolha
    speed: 30,
    languages: ["Comum", "Élfico", "Uma linguagem adicional"],
    traits: ["Visão no Escuro", "Ancestral Feérico", "Versatilidade de Perícia"]
  },
  "Meio-Orc": {
    name: "Meio-Orc",
    bonuses: { strength: 2, constitution: 1 },
    speed: 30,
    languages: ["Comum", "Orc"],
    traits: ["Visão no Escuro", "Ameaçador", "Resistência Implacável", "Ataques Selvagens"]
  },
  "Tiefling": {
    name: "Tiefling",
    bonuses: { charisma: 2, intelligence: 1 },
    speed: 30,
    languages: ["Comum", "Infernal"],
    traits: ["Visão no Escuro", "Resistência Infernal", "Legado Infernal"]
  }
};

// ==================== PERÍCIAS ====================

export type SkillName =
  | "Acrobacia" | "Arcanismo" | "Atletismo" | "Atuação" | "Enganação"
  | "Furtividade" | "História" | "Intimidação" | "Intuição" | "Investigação"
  | "Lidar com Animais" | "Medicina" | "Natureza" | "Percepção" | "Persuasão"
  | "Prestidigitação" | "Religião" | "Sobrevivência";

export interface Skill {
  name: SkillName;
  attribute: keyof RacialBonus;
  description: string;
}

export const SKILLS: Record<SkillName, Skill> = {
  "Acrobacia": { name: "Acrobacia", attribute: "dexterity", description: "Equilíbrio, manobras acrobáticas" },
  "Arcanismo": { name: "Arcanismo", attribute: "intelligence", description: "Conhecimento sobre magia e arcano" },
  "Atletismo": { name: "Atletismo", attribute: "strength", description: "Força física, escalada, natação" },
  "Atuação": { name: "Atuação", attribute: "charisma", description: "Performances artísticas" },
  "Enganação": { name: "Enganação", attribute: "charisma", description: "Mentir e enganar" },
  "Furtividade": { name: "Furtividade", attribute: "dexterity", description: "Mover-se silenciosamente" },
  "História": { name: "História", attribute: "intelligence", description: "Conhecimento histórico" },
  "Intimidação": { name: "Intimidação", attribute: "charisma", description: "Intimidar e ameaçar" },
  "Intuição": { name: "Intuição", attribute: "wisdom", description: "Ler intenções e emoções" },
  "Investigação": { name: "Investigação", attribute: "intelligence", description: "Procurar pistas e deduzir" },
  "Lidar com Animais": { name: "Lidar com Animais", attribute: "wisdom", description: "Controlar e acalmar animais" },
  "Medicina": { name: "Medicina", attribute: "wisdom", description: "Primeiros socorros e diagnóstico" },
  "Natureza": { name: "Natureza", attribute: "intelligence", description: "Conhecimento sobre natureza" },
  "Percepção": { name: "Percepção", attribute: "wisdom", description: "Notar detalhes e perigos" },
  "Persuasão": { name: "Persuasão", attribute: "charisma", description: "Convencer e negociar" },
  "Prestidigitação": { name: "Prestidigitação", attribute: "dexterity", description: "Truques manuais e furtos" },
  "Religião": { name: "Religião", attribute: "intelligence", description: "Conhecimento sobre divindades" },
  "Sobrevivência": { name: "Sobrevivência", attribute: "wisdom", description: "Rastrear, caçar, orientar-se" }
};

// ==================== CLASSES ====================

export interface SubclassData {
  name: string;
  description: string;
  availableAt: number; // Nível em que se torna disponível
  features: Record<number, string[]>;
}

export interface ClassData {
  name: string;
  hitDie: number;
  primaryAttributes: (keyof RacialBonus)[];
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    savingThrows: (keyof RacialBonus)[];
  };
  skillChoices: {
    choose: number;
    from: SkillName[];
  };
  startingEquipment: string[];
  features: Record<number, string[]>; // Level -> Features
  subclasses?: Record<string, SubclassData>;
  spellcasting?: {
    ability: keyof RacialBonus;
    cantripsKnown: Record<number, number>; // Level -> number of cantrips
    spellsKnown?: Record<number, number>; // Level -> number of spells (for classes that know spells)
    spellSlots: Record<number, number[]>; // Level -> [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th]
  };
}

export const CLASSES: Record<string, ClassData> = {
  "Bárbaro": {
    name: "Bárbaro",
    hitDie: 12,
    primaryAttributes: ["strength"],
    proficiencies: {
      armor: ["Armaduras leves", "Armaduras médias", "Escudos"],
      weapons: ["Armas simples", "Armas marciais"],
      tools: [],
      savingThrows: ["strength", "constitution"]
    },
    skillChoices: {
      choose: 2,
      from: ["Lidar com Animais", "Atletismo", "Intimidação", "Natureza", "Percepção", "Sobrevivência"]
    },
    startingEquipment: ["Machado grande ou qualquer arma marcial corpo a corpo", "Dois machados de mão ou qualquer arma simples", "Kit de explorador"],
    features: {
      1: ["Fúria", "Defesa sem Armadura"],
      2: ["Ataque Descuidado", "Sentido de Perigo"],
      3: ["Caminho Primitivo"],
      5: ["Ataque Extra", "Movimento Rápido"],
      7: ["Instinto Selvagem"],
      9: ["Crítico Brutal (1 dado)"],
      11: ["Fúria Implacável"],
      15: ["Fúria Persistente"],
      20: ["Campeão Primitivo"]
    }
  },
  "Bardo": {
    name: "Bardo",
    hitDie: 8,
    primaryAttributes: ["charisma"],
    proficiencies: {
      armor: ["Armaduras leves"],
      weapons: ["Armas simples", "Bestas de mão", "Espadas longas", "Rapieiras", "Espadas curtas"],
      tools: ["Três instrumentos musicais à escolha"],
      savingThrows: ["dexterity", "charisma"]
    },
    skillChoices: {
      choose: 3,
      from: ["Acrobacia", "Arcanismo", "Atletismo", "Atuação", "Enganação", "Furtividade", "História", "Intimidação", "Intuição", "Investigação", "Lidar com Animais", "Medicina", "Natureza", "Percepção", "Persuasão", "Prestidigitação", "Religião", "Sobrevivência"]
    },
    startingEquipment: ["Rapieira ou Espada longa ou qualquer arma simples", "Alaúde ou qualquer outro instrumento musical"],
    features: {
      1: ["Conjuração", "Inspiração Bárdica (d6)"],
      2: ["Versatilidade", "Canção de Descanso (d6)"],
      3: ["Colégio de Bardo", "Especialização"],
      5: ["Inspiração Bárdica (d8)", "Fonte de Inspiração"],
      6: ["Acalmar Emoções"],
      10: ["Inspiração Bárdica (d10)", "Segredos Mágicos"],
      14: ["Segredos Mágicos Adicionais"],
      20: ["Inspiração Superior"]
    }
  },
  "Clérigo": {
    name: "Clérigo",
    hitDie: 8,
    primaryAttributes: ["wisdom"],
    proficiencies: {
      armor: ["Armaduras leves", "Armaduras médias", "Escudos"],
      weapons: ["Armas simples"],
      tools: [],
      savingThrows: ["wisdom", "charisma"]
    },
    skillChoices: {
      choose: 2,
      from: ["História", "Intuição", "Medicina", "Persuasão", "Religião"]
    },
    startingEquipment: ["Maça ou Martelo de guerra", "Cota de escamas ou Armadura de couro ou Cota de malha"],
    features: {
      1: ["Conjuração", "Domínio Divino"],
      2: ["Canalizar Divindade (1/descanso)", "Característica de Domínio Divino"],
      5: ["Destruir Mortos-Vivos (ND 1/2)"],
      10: ["Intervenção Divina"],
      18: ["Canalizar Divindade (3/descanso)"],
      20: ["Intervenção Divina Aprimorada"]
    }
  },
  "Druida": {
    name: "Druida",
    hitDie: 8,
    primaryAttributes: ["wisdom"],
    proficiencies: {
      armor: ["Armaduras leves", "Armaduras médias", "Escudos (druidas não usam armadura ou escudos de metal)"],
      weapons: ["Clavas", "Adagas", "Dardos", "Azagaias", "Maças", "Bordões", "Cimitarras", "Foices", "Fundas", "Lanças"],
      tools: ["Kit de herbalismo"],
      savingThrows: ["intelligence", "wisdom"]
    },
    skillChoices: {
      choose: 2,
      from: ["Arcanismo", "Lidar com Animais", "Intuição", "Medicina", "Natureza", "Percepção", "Religião", "Sobrevivência"]
    },
    startingEquipment: ["Escudo de madeira ou qualquer arma simples", "Cimitarra ou qualquer arma corpo a corpo simples"],
    features: {
      1: ["Druídico", "Conjuração"],
      2: ["Forma Selvagem", "Círculo Druídico"],
      18: ["Corpo Atemporal", "Conjuração de Fera"],
      20: ["Arquidruida"]
    }
  },
  "Guerreiro": {
    name: "Guerreiro",
    hitDie: 10,
    primaryAttributes: ["strength", "dexterity"],
    proficiencies: {
      armor: ["Todas as armaduras", "Escudos"],
      weapons: ["Armas simples", "Armas marciais"],
      tools: [],
      savingThrows: ["strength", "constitution"]
    },
    skillChoices: {
      choose: 2,
      from: ["Acrobacia", "Lidar com Animais", "Atletismo", "História", "Intuição", "Intimidação", "Percepção", "Sobrevivência"]
    },
    startingEquipment: ["Cota de malha ou Armadura de couro", "Escudo ou arma marcial", "Besta leve e 20 virotes ou dois machados de mão"],
    features: {
      1: ["Estilo de Luta", "Recuperação"],
      2: ["Ação Impetuosa (uma vez)"],
      3: ["Arquétipo Marcial"],
      5: ["Ataque Extra (1)"],
      9: ["Indomável (um uso)"],
      11: ["Ataque Extra (2)"],
      20: ["Ataque Extra (3)"]
    },
    subclasses: {
      "Campeão": {
        name: "Campeão",
        description: "Foco em excelência física e ataques devastadores",
        availableAt: 3,
        features: {
          3: ["Crítico Aprimorado (19-20)"],
          7: ["Atleta Notável"],
          10: ["Estilo de Luta Adicional"],
          15: ["Crítico Superior (18-20)"],
          18: ["Sobrevivente"]
        }
      },
      "Mestre de Batalha": {
        name: "Mestre de Batalha",
        description: "Tático que usa manobras especiais em combate",
        availableAt: 3,
        features: {
          3: ["Superioridade em Combate", "Manobras (3)", "Dados de Superioridade (d8)"],
          7: ["Conhece Teu Inimigo"],
          10: ["Manobras Aprimoradas (5)"],
          15: ["Manobras (7)", "Dados de Superioridade (d10)"],
          18: ["Dados de Superioridade (d12)"]
        }
      },
      "Cavaleiro Arcano": {
        name: "Cavaleiro Arcano",
        description: "Guerreiro que combina armas com magia",
        availableAt: 3,
        features: {
          3: ["Conjuração", "Vínculo com Arma"],
          7: ["Ataque Mágico de Guerra"],
          10: ["Golpe Místico"],
          15: ["Carga Arcana"],
          18: ["Defesa Mágica Aprimorada"]
        }
      }
    }
  },
  "Monge": {
    name: "Monge",
    hitDie: 8,
    primaryAttributes: ["dexterity", "wisdom"],
    proficiencies: {
      armor: [],
      weapons: ["Armas simples", "Espadas curtas"],
      tools: ["Um tipo de ferramenta de artesão ou instrumento musical à escolha"],
      savingThrows: ["strength", "dexterity"]
    },
    skillChoices: {
      choose: 2,
      from: ["Acrobacia", "Atletismo", "Furtividade", "História", "Intuição", "Religião"]
    },
    startingEquipment: ["Espada curta ou qualquer arma simples", "Kit de explorador ou kit de aventureiro"],
    features: {
      1: ["Defesa sem Armadura", "Artes Marciais (d4)"],
      2: ["Qi", "Movimento sem Armadura"],
      3: ["Tradição Monástica", "Defletir Projéteis"],
      5: ["Ataque Extra", "Ataque Atordoante"],
      7: ["Evasão", "Quietude da Mente"],
      13: ["Idiomas do Sol e da Lua"],
      18: ["Corpo Vazio"],
      20: ["Ser Perfeito"]
    }
  },
  "Paladino": {
    name: "Paladino",
    hitDie: 10,
    primaryAttributes: ["strength", "charisma"],
    proficiencies: {
      armor: ["Todas as armaduras", "Escudos"],
      weapons: ["Armas simples", "Armas marciais"],
      tools: [],
      savingThrows: ["wisdom", "charisma"]
    },
    skillChoices: {
      choose: 2,
      from: ["Atletismo", "Intuição", "Intimidação", "Medicina", "Persuasão", "Religião"]
    },
    startingEquipment: ["Arma marcial e escudo ou duas armas marciais", "Cinco azagaias ou qualquer arma corpo a corpo simples"],
    features: {
      1: ["Sentido Divino", "Cura pelas Mãos"],
      2: ["Estilo de Luta", "Conjuração", "Destruição Divina"],
      3: ["Saúde Divina", "Juramento Sagrado"],
      5: ["Ataque Extra"],
      10: ["Aura de Coragem"],
      11: ["Destruição Divina Aprimorada"],
      20: ["Transformação Sagrada"]
    }
  },
  "Patrulheiro": {
    name: "Patrulheiro",
    hitDie: 10,
    primaryAttributes: ["dexterity", "wisdom"],
    proficiencies: {
      armor: ["Armaduras leves", "Armaduras médias", "Escudos"],
      weapons: ["Armas simples", "Armas marciais"],
      tools: [],
      savingThrows: ["strength", "dexterity"]
    },
    skillChoices: {
      choose: 3,
      from: ["Lidar com Animais", "Atletismo", "Furtividade", "Intuição", "Investigação", "Natureza", "Percepção", "Sobrevivência"]
    },
    startingEquipment: ["Cota de escamas ou Armadura de couro", "Duas espadas curtas ou duas armas corpo a corpo simples"],
    features: {
      1: ["Inimigo Favorito", "Explorador Natural"],
      2: ["Estilo de Luta", "Conjuração"],
      3: ["Arquétipo de Patrulheiro", "Consciência Primitiva"],
      5: ["Ataque Extra"],
      8: ["Passos Leves"],
      10: ["Esconder-se à Vista"],
      14: ["Desaparecer"],
      20: ["Matador de Feras"]
    }
  },
  "Ladino": {
    name: "Ladino",
    hitDie: 8,
    primaryAttributes: ["dexterity"],
    proficiencies: {
      armor: ["Armaduras leves"],
      weapons: ["Armas simples", "Bestas de mão", "Espadas longas", "Rapieiras", "Espadas curtas"],
      tools: ["Ferramentas de ladrão"],
      savingThrows: ["dexterity", "intelligence"]
    },
    skillChoices: {
      choose: 4,
      from: ["Acrobacia", "Atletismo", "Atuação", "Enganação", "Furtividade", "Intimidação", "Intuição", "Investigação", "Percepção", "Persuasão", "Prestidigitação"]
    },
    startingEquipment: ["Rapieira ou Espada curta", "Arco curto e aljava com 20 flechas ou Espada curta"],
    features: {
      1: ["Especialização", "Ataque Furtivo (1d6)", "Gíria de Ladrão"],
      2: ["Ação Ardilosa"],
      3: ["Arquétipo de Ladino"],
      5: ["Esquiva Sobrenatural"],
      7: ["Evasão"],
      11: ["Talento Confiável"],
      14: ["Olhos Cegos"],
      20: ["Golpe de Sorte"]
    }
  },
  "Feiticeiro": {
    name: "Feiticeiro",
    hitDie: 6,
    primaryAttributes: ["charisma"],
    proficiencies: {
      armor: [],
      weapons: ["Adagas", "Dardos", "Fundas", "Bordões", "Bestas leves"],
      tools: [],
      savingThrows: ["constitution", "charisma"]
    },
    skillChoices: {
      choose: 2,
      from: ["Arcanismo", "Enganação", "Intuição", "Intimidação", "Persuasão", "Religião"]
    },
    startingEquipment: ["Besta leve e 20 virotes ou qualquer arma simples", "Bolsa de componentes ou foco arcano"],
    features: {
      1: ["Conjuração", "Origem de Feitiçaria"],
      2: ["Fonte de Magia", "Metamagia"],
      3: ["Metamagia (escolha)"],
      20: ["Restauração Feiticeira"]
    }
  },
  "Bruxo": {
    name: "Bruxo",
    hitDie: 8,
    primaryAttributes: ["charisma"],
    proficiencies: {
      armor: ["Armaduras leves"],
      weapons: ["Armas simples"],
      tools: [],
      savingThrows: ["wisdom", "charisma"]
    },
    skillChoices: {
      choose: 2,
      from: ["Arcanismo", "Enganação", "História", "Intimidação", "Investigação", "Natureza", "Religião"]
    },
    startingEquipment: ["Besta leve e 20 virotes ou qualquer arma simples", "Bolsa de componentes ou foco arcano"],
    features: {
      1: ["Patrono Transcendental", "Magia de Pacto"],
      2: ["Invocações Místicas"],
      3: ["Dádiva do Pacto"],
      11: ["Arcanum Místico (6º nível)"],
      20: ["Mestre Místico"]
    }
  },
  "Mago": {
    name: "Mago",
    hitDie: 6,
    primaryAttributes: ["intelligence"],
    proficiencies: {
      armor: [],
      weapons: ["Adagas", "Dardos", "Fundas", "Bordões", "Bestas leves"],
      tools: [],
      savingThrows: ["intelligence", "wisdom"]
    },
    skillChoices: {
      choose: 2,
      from: ["Arcanismo", "História", "Intuição", "Investigação", "Medicina", "Religião"]
    },
    startingEquipment: ["Bordão ou Adaga", "Bolsa de componentes ou foco arcano", "Livro de magias"],
    features: {
      1: ["Conjuração", "Recuperação Arcana"],
      2: ["Tradição Arcana"],
      18: ["Domínio de Magia"],
      20: ["Marca de Magia"]
    },
    spellcasting: {
      ability: "intelligence",
      cantripsKnown: { 1: 3, 4: 4, 10: 5 },
      spellSlots: {
        1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
        2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
        3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
        4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
        5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
        6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
        7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
        8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
        9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
        10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
        11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
        12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
        13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
        14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
        15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
        16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
        17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
        18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
        19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
        20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
      }
    },
    subclasses: {
      "Escola de Evocação": {
        name: "Escola de Evocação",
        description: "Especialista em magias de dano e área",
        availableAt: 2,
        features: {
          2: ["Conjurador de Evocação", "Esculpir Magias"],
          6: ["Truque Potente"],
          10: ["Evocação Empoderada"],
          14: ["Sobrecarga"]
        }
      },
      "Escola de Abjuração": {
        name: "Escola de Abjuração",
        description: "Mestre em magias de proteção e dissipação",
        availableAt: 2,
        features: {
          2: ["Conjurador de Abjuração", "Ala Arcana"],
          6: ["Ala Projetada"],
          10: ["Abjuração Aprimorada"],
          14: ["Resistência a Magia"]
        }
      },
      "Escola de Ilusão": {
        name: "Escola de Ilusão",
        description: "Especialista em enganar sentidos e mentes",
        availableAt: 2,
        features: {
          2: ["Conjurador de Ilusão", "Ilusão Menor Aprimorada"],
          6: ["Ilusões Maleáveis"],
          10: ["Eu Ilusório"],
          14: ["Realidade Ilusória"]
        }
      }
    }
  }
};

// ==================== TALENTOS ====================

export interface Feat {
  name: string;
  description: string;
  prerequisite?: string;
  benefits: string[];
}

export const FEATS: Record<string, Feat> = {
  "Alerta": {
    name: "Alerta",
    description: "Sempre atento ao perigo",
    benefits: [
      "+5 de bônus em iniciativa",
      "Não pode ser surpreendido enquanto estiver consciente",
      "Criaturas invisíveis não têm vantagem contra você"
    ]
  },
  "Ator": {
    name: "Ator",
    description: "Perito em mímica e interpretação",
    prerequisite: "Nenhum",
    benefits: [
      "+1 Carisma",
      "Vantagem em testes de Enganação e Atuação ao se passar por outra pessoa",
      "Pode imitar a fala de outras pessoas ou sons de criaturas"
    ]
  },
  "Atleta": {
    name: "Atleta",
    description: "Condicionamento atlético superior",
    benefits: [
      "+1 Força ou Destreza",
      "Levantar-se de prone usa apenas 5 pés de movimento",
      "Escalar não custa movimento extra",
      "Pode fazer salto em distância correndo com apenas 5 pés de impulso"
    ]
  },
  "Mestre em Armas": {
    name: "Mestre em Armas",
    description: "Treinamento excepcional com armas",
    benefits: [
      "+1 em Força ou Destreza",
      "Proficiência com quatro armas à escolha"
    ]
  },
  "Abençoado": {
    name: "Abençoado",
    description: "Tocado pela sorte divina",
    benefits: [
      "Pode adicionar 1d4 em testes de ataque ou resistência",
      "3 usos por descanso longo"
    ]
  },
  "Carregador": {
    name: "Carregador",
    description: "Especialista em investidas",
    benefits: [
      "Ao usar Disparada, pode fazer um ataque corpo a corpo como ação bônus",
      "Ao usar Disparada, empurra criatura até 5 pés se acertar"
    ]
  },
  "Iniciado em Magia": {
    name: "Iniciado em Magia",
    description: "Aprendeu fundamentos de conjuração",
    benefits: [
      "Aprende 2 truques de uma classe de conjurador",
      "Aprende 1 magia de 1º nível dessa classe",
      "Pode conjurar a magia uma vez por descanso longo"
    ]
  },
  "Resistente": {
    name: "Resistente",
    description: "Constituição robusta",
    benefits: [
      "+1 em Constituição",
      "Proficiência em testes de resistência de Constituição"
    ]
  },
  "Sentinela": {
    name: "Sentinela",
    description: "Mestre do combate de oportunidade",
    benefits: [
      "Ataques de oportunidade reduzem velocidade do alvo a 0",
      "Pode fazer ataque de oportunidade mesmo se inimigo usar Desengajar",
      "Pode reagir quando criatura atacar aliado próximo"
    ]
  },
  "Sortudo": {
    name: "Sortudo",
    description: "Sorte extraordinária",
    benefits: [
      "Tem 3 pontos de sorte",
      "Pode gastar 1 ponto para rolar novamente um d20",
      "Pontos recuperam após descanso longo"
    ]
  }
};

// ==================== ARMADURAS ====================

export interface ArmorData {
  name: string;
  type: "light" | "medium" | "heavy" | "shield";
  baseAC: number;
  dexBonus: "full" | "max2" | "none";
  strengthRequired?: number;
  stealthDisadvantage: boolean;
}

export const ARMORS: Record<string, ArmorData> = {
  // Armaduras Leves
  "Roupa Comum": { name: "Roupa Comum", type: "light", baseAC: 10, dexBonus: "full", stealthDisadvantage: false },
  "Armadura Acolchoada": { name: "Armadura Acolchoada", type: "light", baseAC: 11, dexBonus: "full", stealthDisadvantage: true },
  "Armadura de Couro": { name: "Armadura de Couro", type: "light", baseAC: 11, dexBonus: "full", stealthDisadvantage: false },
  "Armadura de Couro Batido": { name: "Armadura de Couro Batido", type: "light", baseAC: 12, dexBonus: "full", stealthDisadvantage: false },

  // Armaduras Médias
  "Gibão de Peles": { name: "Gibão de Peles", type: "medium", baseAC: 12, dexBonus: "max2", stealthDisadvantage: false },
  "Camisa de Cota de Malha": { name: "Camisa de Cota de Malha", type: "medium", baseAC: 13, dexBonus: "max2", stealthDisadvantage: false },
  "Cota de Escamas": { name: "Cota de Escamas", type: "medium", baseAC: 14, dexBonus: "max2", stealthDisadvantage: true },
  "Peitoral": { name: "Peitoral", type: "medium", baseAC: 14, dexBonus: "max2", stealthDisadvantage: false },
  "Meia-Armadura": { name: "Meia-Armadura", type: "medium", baseAC: 15, dexBonus: "max2", stealthDisadvantage: true },

  // Armaduras Pesadas
  "Armadura de Anéis": { name: "Armadura de Anéis", type: "heavy", baseAC: 14, dexBonus: "none", stealthDisadvantage: true },
  "Cota de Malha": { name: "Cota de Malha", type: "heavy", baseAC: 16, dexBonus: "none", stealthDisadvantage: true },
  "Brunea": { name: "Brunea", type: "heavy", baseAC: 17, dexBonus: "none", strengthRequired: 15, stealthDisadvantage: true },
  "Placas": { name: "Placas", type: "heavy", baseAC: 18, dexBonus: "none", strengthRequired: 15, stealthDisadvantage: true },

  // Escudo
  "Escudo": { name: "Escudo", type: "shield", baseAC: 2, dexBonus: "none", stealthDisadvantage: false }
};

// ==================== NÍVEIS ASI (Ability Score Improvement) ====================

export const ASI_LEVELS = [4, 8, 12, 16, 19];

export function canChooseFeatOrASI(level: number): boolean {
  return ASI_LEVELS.includes(level);
}

export function getAvailableFeatLevels(currentLevel: number): number[] {
  return ASI_LEVELS.filter(lvl => lvl <= currentLevel);
}

// ==================== FUNÇÕES AUXILIARES ====================

/**
 * Calcula CA baseado em armadura e modificador de Destreza
 */
export function calculateArmorClass(
  armorName: string,
  dexModifier: number,
  hasShield: boolean = false
): number {
  const armor = ARMORS[armorName];
  if (!armor) return 10 + dexModifier;

  let ac = armor.baseAC;

  // Aplica bônus de DEX baseado no tipo de armadura
  if (armor.dexBonus === "full") {
    ac += dexModifier;
  } else if (armor.dexBonus === "max2") {
    ac += Math.min(dexModifier, 2);
  }
  // "none" não adiciona DEX

  // Adiciona escudo se equipado
  if (hasShield && armorName !== "Escudo") {
    ac += 2;
  }

  return ac;
}

/**
 * Aplica bônus raciais aos atributos base
 */
export function applyRacialBonuses(
  baseAttributes: Record<keyof RacialBonus, number>,
  raceName: string,
  subraceName?: string
): Record<keyof RacialBonus, number> {
  const race = RACES[raceName];
  if (!race) return baseAttributes;

  const result = { ...baseAttributes };

  // Aplica bônus raciais
  Object.entries(race.bonuses).forEach(([attr, bonus]) => {
    const key = attr as keyof RacialBonus;
    result[key] = (result[key] || 10) + (bonus || 0);
  });

  // Aplica bônus de sub-raça se existir
  if (subraceName && race.subraces && race.subraces[subraceName]) {
    Object.entries(race.subraces[subraceName].bonuses).forEach(([attr, bonus]) => {
      const key = attr as keyof RacialBonus;
      result[key] = (result[key] || 10) + (bonus || 0);
    });
  }

  return result;
}

/**
 * Retorna talentos de classe disponíveis por nível
 */
export function getClassFeaturesAtLevel(className: string, level: number): string[] {
  const classData = CLASSES[className];
  if (!classData) return [];

  const features: string[] = [];

  // Coleta todas as features até o nível atual
  for (let lvl = 1; lvl <= level; lvl++) {
    if (classData.features[lvl]) {
      features.push(...classData.features[lvl]);
    }
  }

  return features;
}

/**
 * Calcula HP máximo baseado em classe e nível
 */
export function calculateMaxHP(
  className: string,
  level: number,
  constitutionModifier: number
): number {
  const classData = CLASSES[className];
  if (!classData) return 10;

  // Primeiro nível: máximo do dado de vida + modificador CON
  const firstLevelHP = classData.hitDie + constitutionModifier;

  // Níveis subsequentes: média do dado (metade + 1) + modificador CON
  const avgRoll = Math.floor(classData.hitDie / 2) + 1;
  const additionalLevels = level - 1;
  const additionalHP = additionalLevels * (avgRoll + constitutionModifier);

  return firstLevelHP + additionalHP;
}

/**
 * Verifica se uma perícia está na lista de proficiências da classe
 */
export function isSkillAvailableForClass(className: string, skillName: SkillName): boolean {
  const classData = CLASSES[className];
  if (!classData) return false;

  return classData.skillChoices.from.includes(skillName);
}
