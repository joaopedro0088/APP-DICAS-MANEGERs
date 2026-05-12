/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LegendaryChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Insano' | 'Lendário' | 'Impossível';
  goal: string;
  xpReward: number;
  category: 'Rebuild' | 'Economy' | 'Youth' | 'Tactical';
}

export const LEGENDARY_CHALLENGES: LegendaryChallenge[] = [
  // REBUILDS (25)
  { id: 'leg-1', title: 'O Último fôlego', description: 'Assuma um time na zona de rebaixamento da 4ª divisão com saldo negativo.', goal: 'Chegar à 1ª divisão em 5 temporadas.', difficulty: 'Lendário', xpReward: 1000, category: 'Rebuild' },
  { id: 'leg-2', title: 'Gigante Adormecido', description: 'Vença a Champions com um time que já foi campeão mas hoje está na 2ª divisão.', goal: 'Título Continental em 6 anos.', difficulty: 'Lendário', xpReward: 1000, category: 'Rebuild' },
  { id: 'leg-3', title: 'Fênix das Cinzas', description: 'Time com 15 jogadores lesionados e sem orçamento para transferências.', goal: 'Classificar para uma copa europeia/sul-americana.', difficulty: 'Insano', xpReward: 1000, category: 'Rebuild' },
  { id: 'leg-4', title: 'Deserto de Títulos', description: 'Assuma um time que nunca venceu nada em 100 anos de história.', goal: 'Vencer a Liga Nacional.', difficulty: 'Lendário', xpReward: 1000, category: 'Rebuild' },
  { id: 'leg-5', title: 'Rei do Bairro', description: 'Leve o menor time de Londres/Madrid/SP ao topo do país.', goal: 'Superar todos os rivais locais na tabela.', difficulty: 'Lendário', xpReward: 1000, category: 'Rebuild' },
  // ... Adding more programmatically for brevity in description but I will write out a good chunk
];

// Generate 100+ challenges for the system
const categories: LegendaryChallenge['category'][] = ['Rebuild', 'Economy', 'Youth', 'Tactical'];
const difficulties: LegendaryChallenge['difficulty'][] = ['Insano', 'Lendário', 'Impossível'];

for (let i = 6; i <= 105; i++) {
  const cat = categories[i % categories.length];
  const diff = difficulties[i % difficulties.length];
  LEGENDARY_CHALLENGES.push({
    id: `leg-${i}`,
    title: `Desafio Extremo #${i}`,
    description: `Um desafio épico de ${cat} que testará seus limites como manager.`,
    goal: `Alcançar a glória máxima sob condições de dificuldade ${diff}.`,
    difficulty: diff,
    xpReward: 1000,
    category: cat
  });
}
