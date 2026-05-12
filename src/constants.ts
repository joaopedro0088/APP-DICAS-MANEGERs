/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COLORS = {
  primary: '#7B2CBF', // Roxo
  black: '#0F0F0F',
  white: '#FFFFFF',
  cardBg: '#1A1A1A',
  border: '#2D2D2D',
  purpleBorder: '#7B2CBF44',
  textSecondary: '#A0A0A0',
};

export const LIMITS = {
  MAX_SAVES: 20,
  SAVES_PER_MONTH: 3,
  SAVES_PER_DAY: 1,
  GENERATIONS_PER_DAY: 30,
  IMAGE_MAX_SIZE_MB: 1,
};

export const PHILOSOPHIES = [
  'Gegenpress', 
  'Posse de Bola', 
  'Defesa Sólida', 
  'Base/Jovens', 
  'Contra-Ataque', 
  'Catenaccio', 
  'Tiki-Taka', 
  'Ataque Total'
];

export const BADGES = [
  // Performance
  { id: 'perf-1', name: 'Primeira Vitória', icon: '✅', description: 'Venceu seu primeiro jogo oficial' },
  { id: 'perf-2', name: 'Goleada', icon: '💥', description: 'Venceu um jogo por 4 ou mais gols de diferença' },
  { id: 'perf-3', name: 'Invicto no Mês', icon: '📅', description: 'Passou um mês inteiro sem derrotas' },
  { id: 'perf-4', name: 'Defesa de Aço', icon: '🛡️', description: 'Passou 5 jogos sem sofrer gols' },
  { id: 'perf-5', name: 'Ataque Fulminante', icon: '⚡', description: 'Marcou 10 gols em apenas 3 jogos' },
  { id: 'perf-6', name: 'Vira-Vira', icon: '🔄', description: 'Venceu um jogo após estar perdendo por 2 gols' },
  { id: 'perf-7', name: 'Carrasco de Gigantes', icon: '🐘', description: 'Venceu um time muito superior' },
  { id: 'perf-8', name: 'Recorde de Pontos', icon: '📈', description: 'Bateu o recorde de pontos da liga' },
  { id: 'perf-9', name: 'Campeão Invicto', icon: '🥇', description: 'Venceu a liga sem perder nenhum jogo' },
  { id: 'perf-10', name: 'Mestre da Estratégia', icon: '🧠', description: 'Venceu um rival usando uma tática nova' },
  
  // Títulos
  { id: 'tit-1', name: 'Campeão da Copa', icon: '🏆', description: 'Venceu uma copa nacional' },
  { id: 'tit-2', name: 'Campeão da Liga', icon: '🎖️', description: 'Venceu a primeira divisão nacional' },
  { id: 'tit-3', name: 'Rei da Europa', icon: '🏰', description: 'Venceu a Champions League' },
  { id: 'tit-4', name: 'Dono da América', icon: '🌎', description: 'Venceu a Libertadores' },
  { id: 'tit-5', name: 'Soberano Mundial', icon: '🌏', description: 'Venceu o Mundial de Clubes' },
  { id: 'tit-6', name: 'Tríplice Coroa', icon: '👑', description: 'Venceu Liga, Copa e Continental no mesmo ano' },
  { id: 'tit-7', name: 'Bi-Campeão', icon: '✌️', description: 'Venceu o mesmo título dois anos seguidos' },
  { id: 'tit-8', name: 'Hegemonia Nacional', icon: '🏛️', description: 'Venceu 5 títulos nacionais em sequência' },
  { id: 'tit-9', name: 'Campeão Continental', icon: '🏆', description: 'Venceu um torneio continental' },
  { id: 'tit-10', name: 'Mestre de Copas', icon: '🥂', description: 'Venceu 3 copas diferentes na mesma carreira' },

  // Carreira & Saves
  { id: 'car-1', name: 'Primeiro Passo', icon: '👟', description: 'Criou seu primeiro save' },
  { id: 'car-2', name: 'Veterano', icon: '🎖️', description: 'Completou 5 temporadas' },
  { id: 'car-3', name: 'Lenda do Clube', icon: '🗿', description: 'Ficou 10 anos no mesmo time' },
  { id: 'car-4', name: 'Trotamundos', icon: '✈️', description: 'Treinou times em 3 países diferentes' },
  { id: 'car-5', name: 'Fiel ao Projeto', icon: '🤝', description: 'Recusou uma proposta de um time maior' },
  { id: 'car-6', name: 'Aposentadoria de Gala', icon: '🎩', description: 'Encerrou um save após 15 temporadas' },
  { id: 'car-7', name: 'Colecionador de Saves', icon: '📂', description: 'Possui 5 saves ativos' },
  { id: 'car-8', name: 'Fox Legend', icon: '🦊', description: 'Criou mais de 10 saves' },
  { id: 'car-9', name: 'Especialista', icon: '🎯', description: 'Completou 3 saves do mesmo tipo de desafio' },
  { id: 'car-10', name: 'Multitarefa', icon: '📱', description: 'Registrou 100 logs de temporada' },

  // Financeiro
  { id: 'fin-1', name: 'Pão Duro', icon: '💰', description: 'Terminou a temporada com lucro recorde' },
  { id: 'fin-2', name: 'Mestre das Vendas', icon: '📈', description: 'Vendeu um jogador por mais de 100 milhões' },
  { id: 'fin-3', name: 'Radar de Pechinchas', icon: '🔍', description: 'Contratou um craque a custo zero' },
  { id: 'fin-4', name: 'Investidor', icon: '🏗️', description: 'Melhorou as instalações do clube 3 vezes' },
  { id: 'fin-5', name: 'Cofre Cheio', icon: '💎', description: 'Alcançou um balanço de 500 milhões' },
  { id: 'fin-6', name: 'Mago dos Salários', icon: '📉', description: 'Reduziu a folha salarial em 30%' },
  { id: 'fin-7', name: 'Patrocínio Master', icon: '🤝', description: 'Assinou o maior contrato da história do clube' },
  { id: 'fin-8', name: 'Venda Urgente', icon: '🆘', description: 'Vendeu um jogador insatisfeito por um bom preço' },
  { id: 'fin-9', name: 'Mestre Financeiro', icon: '💸', description: 'Completou um desafio de Orçamento Limitado' },
  { id: 'fin-10', name: 'Bilionário', icon: '🪙', description: 'Alcançou 1 bilhão em patrimônio no clube' },

  // Base
  { id: 'bas-1', name: 'Olho Clínico', icon: '👀', description: 'Descobriu uma promessa de 5 estrelas' },
  { id: 'bas-2', name: 'Fábrica de Talentos', icon: '🏭', description: 'Teve 3 jogadores da base no time titular' },
  { id: 'bas-3', name: 'Professor', icon: '👨‍🏫', description: 'Levou um jogador da base aos 20 anos ao topo' },
  { id: 'bas-4', name: 'Orgulho Nacional', icon: '🇧🇷', description: 'Teve um pupilo convocado para a seleção' },
  { id: 'bas-5', name: 'Venda de Ouro', icon: '✨', description: 'Vendeu um jovem da base por valor recorde' },
  { id: 'bas-6', name: 'Lapidador', icon: '💎', description: 'Melhorou o potencial de um jovem em 10 pontos' },
  { id: 'bas-7', name: 'Mestre da Base', icon: '👶', description: 'Completou um desafio de "Só Base"' },
  { id: 'bas-8', name: 'Escolinha Fox', icon: '🏫', description: 'Ganhou um título com média de idade de 22 anos' },
  { id: 'bas-9', name: 'Gerente da Base', icon: '📋', description: 'Assistiu a 10 jogos do time sub-20' },
  { id: 'bas-10', name: 'Sucessor de Lendas', icon: '🧬', description: 'Substituiu um veterano por um jovem da base' },

  // Desafios Específicos
  { id: 'des-1', name: 'Rei do Rebuild', icon: '🏛️', description: 'Levou um time da lama ao topo em 3 anos' },
  { id: 'des-2', name: 'Hardcore Manager', icon: '🔥', description: 'Ganhou um título na dificuldade Extrema' },
  { id: 'des-3', name: 'Sem Dinheiro', icon: '🚫', description: 'Venceu a liga sem gastar 1 real em compras' },
  { id: 'des-4', name: 'Nostalgia', icon: '🎞️', description: 'Completou um save de "Era Clássica"' },
  { id: 'des-5', name: 'Lenda Suprema', icon: '🐉', description: 'Completou o Modo Lendário' },
  { id: 'des-6', name: 'Sprint Manager', icon: '⚡', description: 'Venceu o desafio de Carreira Curta' },
  { id: 'des-7', name: 'Estradão', icon: '🛣️', description: 'Completou o desafio de Longa Duração' },
  { id: 'des-8', name: 'Sobrevivente', icon: '🏚️', description: 'Evitou o rebaixamento de um time quase falido' },
  { id: 'des-9', name: 'Fênix', icon: '🐦', description: 'Voltou a vencer após 5 anos de seca' },
  { id: 'des-10', name: 'Estrategista Nato', icon: '♟️', description: 'Completou 5 desafios diferentes' },

  // Social & Comunidade
  { id: 'soc-1', name: 'Influenciador', icon: '📣', description: 'Compartilhou seu save 5 vezes' },
  { id: 'soc-2', name: 'Crítico de Arte', icon: '🖼️', description: 'Adicionou 10 fotos à sua galeria' },
  { id: 'soc-3', name: 'Doador de Dicas', icon: '💡', description: 'Publicou uma dica na biblioteca' },
  { id: 'soc-4', name: 'Amado pela Massa', icon: '❤️', description: 'Recebeu 50 likes em suas publicações' },
  { id: 'soc-5', name: 'Explorador', icon: '🧭', description: 'Aceitou 3 desafios da comunidade' },
  { id: 'soc-6', name: 'Fox Amigo', icon: '🤝', description: 'Seguiu 10 outros treinadores' },
  { id: 'soc-7', name: 'Sempre On', icon: '🌐', description: 'Acessou o app por 7 dias seguidos' },
  { id: 'soc-8', name: 'Feedback Constante', icon: '✍️', description: 'Enviou 3 sugestões de melhoria' },
  { id: 'soc-9', name: 'Rede Social', icon: '📱', description: 'Conectou suas redes ao perfil' },
  { id: 'soc-10', name: 'Mestre da Comunidade', icon: '🏛️', description: 'Alcançou o nível 10 de XP' },

  // Aleatórios & Curiosidades
  { id: 'ran-1', name: 'Azarado', icon: '🤞', description: 'Teve seu melhor jogador lesionado por 6 meses' },
  { id: 'ran-2', name: 'Sorte Grande', icon: '🍀', description: 'Ganhou um jogo com gol aos 95 minutos' },
  { id: 'ran-3', name: 'Teimoso', icon: '😤', description: 'Manteve a mesma tática após 3 derrotas' },
  { id: 'ran-4', name: 'Mão de Ferro', icon: '🧤', description: 'Afastou um jogador estrela por má conduta' },
  { id: 'ran-5', name: 'Queridinho da Imprensa', icon: '🎤', description: 'Deu 20 entrevistas positivas' },
  { id: 'ran-6', name: 'Vilão da Mídia', icon: '👺', description: 'Respondeu atravessado para um jornalista' },
  { id: 'ran-7', name: 'Rei do Empate', icon: '🤝', description: 'Empatou 5 jogos seguidos' },
  { id: 'ran-8', name: 'Pé Na Estrada', icon: '👢', description: 'Foi demitido pela primeira vez' },
  { id: 'ran-9', name: 'Volta Por Cima', icon: '🚀', description: 'Foi campeão após ser demitido de outro clube' },
  { id: 'ran-10', name: 'Amor Eterno', icon: '♾️', description: 'Recusou a seleção para ficar no clube' },

  // Metas de XP/Nível
  { id: 'lvl-1', name: 'Iniciante', icon: '🌱', description: 'Alcançou o nível 5' },
  { id: 'lvl-2', name: 'Amador', icon: '🌿', description: 'Alcançou o nível 15' },
  { id: 'lvl-3', name: 'Profissional', icon: '🌳', description: 'Alcançou o nível 30' },
  { id: 'lvl-4', name: 'Especialista', icon: '🏢', description: 'Alcançou o nível 50' },
  { id: 'lvl-5', name: 'Mestre', icon: '🏰', description: 'Alcançou o nível 75' },
  { id: 'lvl-6', name: 'Lenda', icon: '🌌', description: 'Alcançou o nível 100' },
  { id: 'lvl-7', name: 'Deus do Manager', icon: '⚡', description: 'Alcançou o nível 150' },
  { id: 'lvl-8', name: 'Colecionador de XP', icon: '🔮', description: 'Ganhou 10.000 de XP total' },
  { id: 'lvl-9', name: 'Sempre Evoluindo', icon: '⬆️', description: 'Subiu 5 níveis em uma semana' },
  { id: 'lvl-10', name: 'Elite Fox', icon: '💎', description: 'Alcançou o top 100 do ranking' },

  // Eventos Semanais
  { id: 'ev-1', name: 'Participante Ativo', icon: '🎫', description: 'Participou de um evento semanal' },
  { id: 'ev-2', name: 'Vencedor do Evento', icon: '🏅', description: 'Ganhou um desafio semanal' },
  { id: 'ev-3', name: 'Fiel à Fox', icon: '📅', description: 'Participou de 4 eventos seguidos' },
  { id: 'ev-4', name: 'Destaque da Semana', icon: '🌟', description: 'Teve seu save em destaque no evento' },
  { id: 'ev-5', name: 'Mestre de Eventos', icon: '🏆', description: 'Ganhou 5 eventos diferentes' },

  // Extras para chegar a 100+
  { id: 'ext-1', name: 'Hat-Trick', icon: '🎩', description: 'Teve um atacante marcando 3 gols num jogo' },
  { id: 'ext-2', name: 'Poker', icon: '♠️', description: 'Teve um atacante marcando 4 gols num jogo' },
  { id: 'ext-3', name: 'Muralha', icon: '🧱', description: 'Goleiro foi o melhor do jogo 3 vezes' },
  { id: 'ext-4', name: 'Pé Quente', icon: '👟', description: 'Substituto entrou e decidiu o jogo' },
  { id: 'ext-5', name: 'Tensão Máxima', icon: '⚡', description: 'Venceu um jogo nos pênaltis' },
  { id: 'ext-6', name: 'Dono da Cidade', icon: '🏘️', description: 'Venceu todos os clássicos da temporada' },
  { id: 'ext-7', name: 'Freguesia', icon: '👋', description: 'Venceu o mesmo rival 3 vezes no ano' },
  { id: 'ext-8', name: 'Clima Tenso', icon: '😡', description: 'Teve 2 jogadores expulsos e não perdeu' },
  { id: 'ext-9', name: 'Justiça Tardia', icon: '⚖️', description: 'Ganhou com um gol após erro do VAR' },
  { id: 'ext-10', name: 'Estilo de Jogo', icon: '🎨', description: 'Manteve 70% de posse de bola' },
  { id: 'ext-11', name: 'Bola Parada', icon: '🥅', description: 'Marcou 2 gols de falta no mesmo jogo' },
  { id: 'ext-12', name: 'Garçom de Luxo', icon: '🤵', description: 'Meio-campista deu 3 assistências no jogo' },
  { id: 'ext-13', name: 'Capitão Planeta', icon: '🌍', description: 'Capitão levantou 3 troféus seguidos' },
  { id: 'ext-14', name: 'Torcida de Ouro', icon: '🙌', description: 'Lotação máxima em 10 jogos seguidos' },
  { id: 'ext-15', name: 'Mestre da Várzea', icon: '🏚️', description: 'Subiu da última para a penúltima divisão' },
  { id: 'ext-16', name: 'Promessa Cumprida', icon: '🤝', description: 'Cumpriu a meta da diretoria antes do prazo' },
  { id: 'ext-17', name: 'Voto de Confiança', icon: '🎟️', description: 'Manteve o cargo com 1% de aprovação' },
  { id: 'ext-18', name: 'União Total', icon: '🔗', description: 'Alcançou 100% de coesão no vestiário' },
  { id: 'ext-19', name: 'Visão de Futuro', icon: '🔮', description: 'Contratou um jogador que foi bola de ouro' },
  { id: 'ext-20', name: 'Aposta Ganha', icon: '🎰', description: 'Recuperou um jogador encostado' },
  { id: 'ext-21', name: 'Olheiro Fox', icon: '🦊', description: 'Visualizou 100 cards na biblioteca' },
  { id: 'ext-22', name: 'Gerador Compulsivo', icon: '🎲', description: 'Gerou 50 desafios aleatórios' },
  { id: 'ext-23', name: 'Perfil Completo', icon: '👤', description: 'Preencheu Bio, Banner e Foto' },
  { id: 'ext-24', name: 'Historiador', icon: '📚', description: 'Escreveu uma mini-história para o save' },
  { id: 'ext-25', name: 'Mestre do PDF', icon: '📄', description: 'Exportou 10 relatórios de save' }
];

export const BANNERS = [
  { id: 'stadium', name: 'Estádio', url: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&q=80&w=1000' },
  { id: 'fans', name: 'Torcida', url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=1000' },
  { id: 'pitch', name: 'Gramado', url: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&q=80&w=1000' },
  { id: 'neon', name: 'Neon Fox', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000' },
  { id: 'trophy', name: 'Sala de Troféus', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1000' },
  { id: 'city', name: 'Cidade do Clube', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1000' },
  { id: 'strategy', name: 'Prancheta Tática', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1000' },
  { id: 'locker', name: 'Vestiário', url: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&q=80&w=1000' },
  { id: 'training', name: 'Treinamento', url: 'https://images.unsplash.com/photo-1526232761682-d26e43ac148e?auto=format&fit=crop&q=80&w=1000' },
  { id: 'press', name: 'Imprensa', url: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&q=80&w=1000' },
  { id: 'tunnel', name: 'Túnel', url: 'https://images.unsplash.com/photo-1510051640316-cee39563ddab?auto=format&fit=crop&q=80&w=1000' },
  { id: 'aerial', name: 'Vista Aérea', url: 'https://images.unsplash.com/photo-1431324155629-1a6eda1eed2d?auto=format&fit=crop&q=80&w=1000' },
  { id: 'night-match', name: 'Jogo Noturno', url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=1000' },
  { id: 'old-school', name: 'Clássico', url: 'https://images.unsplash.com/photo-1518091044134-26d108eb676e?auto=format&fit=crop&q=80&w=1000' },
  { id: 'abstract-football', name: 'Arte Futebol', url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=1000' },
  { id: 'goal-net', name: 'Rede do Gol', url: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&q=80&w=1000' }
];

export const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Coco',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Toby',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Kitty',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lilly',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Simba',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nala',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Harry',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Archie'
];

export const LIBRARY_FILTERS = ['Todos', 'Rebuild', 'Sem Dinheiro', 'Hardcore', 'Base', 'Longa Duração'];

export const GAMES = [
  'Football Manager', 
  'World Soccer Champs', 
  'EA Sports FC (FIFA)', 
  'PES 2021 ps4 e pc(com mods de 2026 elenco atualizado)',
  'Soccer Manager 2025',
  'Fottball manager 2021 touch atualizado'
];
export const COUNTRIES = ['Alemanha', 'Brasil', 'Espanha', 'França', 'Inglaterra', 'Itália', 'Portugal', 'Outros'];
export const TEAM_SIZES = ['Grande', 'Médio', 'Pequeno', 'Várzea/Subida'];
export const GEN_TYPES = ['Rebuild', 'Base/Youth', 'Sem Dinheiro', 'Desafio Extremo', 'Normal'];
export const DIFFICULTIES = ['Fácil', 'Médio', 'Extremo', 'Realista', 'Lendário'];
export const CAREER_CATEGORIES = ['Rebuild', 'Time Pequeno', 'Sem Dinheiro', 'Jovens/Promessas', 'Longa Duração', 'Carreira Curta', 'Modo Lendário'];

export const CHALLENGE_TEMPLATES: Record<string, {
  minSeasons: number;
  maxSeasons: number;
  rules: string[];
  badge: string;
  requiredFields: string[];
}> = {
  'Rebuild': {
    minSeasons: 2,
    maxSeasons: 4,
    rules: ['Foco em jovens', 'Orçamento limitado'],
    badge: '🏆 Rei do Rebuild',
    requiredFields: ['philosophy', 'objective']
  },
  'Time Pequeno': {
    minSeasons: 5,
    maxSeasons: 10,
    rules: ['Subir divisões', 'Instalações de base'],
    badge: '🔥 Hardcore Manager',
    requiredFields: ['stadiumName', 'stadiumCapacity']
  },
  'Sem Dinheiro': {
    minSeasons: 3,
    maxSeasons: 6,
    rules: ['Sem contratações caras', 'Vender jogadores'],
    badge: '💸 Mestre Financeiro',
    requiredFields: ['philosophy']
  },
  'Jovens/Promessas': {
    minSeasons: 4,
    maxSeasons: 8,
    rules: ['Obrigar uso de jovens', 'Venda de veteranos'],
    badge: '👶 Mestre da Base',
    requiredFields: ['philosophy']
  },
  'Longa Duração': {
    minSeasons: 8,
    maxSeasons: 15,
    rules: ['Criar dinastia', 'Múltiplos títulos'],
    badge: '👑 Lenda da Estrada',
    requiredFields: ['stadiumName', 'managerName']
  },
  'Carreira Curta': {
    minSeasons: 1,
    maxSeasons: 2,
    rules: ['Impacto imediato', 'Título expresso'],
    badge: '⚡ Sprint Manager',
    requiredFields: ['objective']
  },
  'Modo Lendário': {
    minSeasons: 10,
    maxSeasons: 25,
    rules: [
      'Começar na 4ª Divisão ou Várzea',
      'Vencer a Champions League',
      'Sem scouts externos (usar apenas base)',
      'Máximo 2 contratações por temporada',
      'Orçamento sempre no limite'
    ],
    badge: '🐉 Lenda Suprema',
    requiredFields: ['managerName', 'stadiumName', 'objective']
  }
};
export const GEN_MODES = ['Aleatório', 'Oficial', 'Especial'];
export const CAREER_TYPES = ['Clube', 'Seleção', 'Desafio Específico', 'Journeyman'];
