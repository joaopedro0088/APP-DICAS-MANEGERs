/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function getLevelName(level: number): string {
  if (level >= 200) return 'Dono do Jogo';
  if (level >= 190) return 'Imortal da Fox';
  if (level >= 180) return 'Soberano Mundial';
  if (level >= 170) return 'Mito Eterno';
  if (level >= 160) return 'Gênio Tático';
  if (level >= 150) return 'Lenda Suprema';
  if (level >= 140) return 'Rei da Europa';
  if (level >= 130) return 'Imperador';
  if (level >= 120) return 'Doutor do Futebol';
  if (level >= 110) return 'Comandante de Elite';
  if (level >= 100) return 'Lenda Viva';
  if (level >= 95) return 'Mestre Supremo';
  if (level >= 90) return 'Fox Legend';
  if (level >= 85) return 'Insuperável';
  if (level >= 80) return 'Fenômeno';
  if (level >= 75) return 'Carrasco de Gigantes';
  if (level >= 70) return 'Mestre da Estratégia';
  if (level >= 65) return 'Estrategista Nato';
  if (level >= 60) return 'Fox Master';
  if (level >= 55) return 'Mestre de Títulos';
  if (level >= 50) return 'Lenda';
  if (level >= 45) return 'Grande Desafiador';
  if (level >= 40) return 'Mestre';
  if (level >= 35) return 'Veterano';
  if (level >= 30) return 'Expert';
  if (level >= 25) return 'Especialista';
  if (level >= 20) return 'Profissional';
  if (level >= 15) return 'Aspirante Pro';
  if (level >= 10) return 'Amador';
  if (level >= 5) return 'Estagiário';
  return 'Iniciante';
}

export function getLevelColor(level: number): string {
  if (level >= 150) return 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]';
  if (level >= 100) return 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.4)]';
  if (level >= 80) return 'text-orange-500';
  if (level >= 60) return 'text-red-500';
  if (level >= 40) return 'text-purple-500';
  if (level >= 20) return 'text-blue-500';
  if (level >= 10) return 'text-green-500';
  return 'text-[#A0A0A0]';
}
