/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Save as SaveIcon, Trash2, Edit3, X, Image as ImageIcon, 
  ChevronRight, AlertCircle, Calendar, Check, Play, 
  Target, BarChart3, Trophy, Users, Star, Flame, Camera, Crown, Dna,
  TrendingUp, Activity, Smartphone, Share2, Award, Zap, History, Bot, Download, FileText, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { storage } from '../store';
import { Save, SaveGoal } from '../types';
import { GAMES, DIFFICULTIES, LIMITS, PHILOSOPHIES, CAREER_CATEGORIES, CHALLENGE_TEMPLATES } from '../constants';
import { sounds } from '../utils/sounds';

export default function SavesView() {
  const [saves, setSaves] = useState<Save[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSave, setEditingSave] = useState<Save | null>(null);
  const [showError, setShowError] = useState<string | null>(null);
  const [selectedSave, setSelectedSave] = useState<Save | null>(null);
  const [gameFilter, setGameFilter] = useState<string>('Todos');
  const [newLog, setNewLog] = useState({
    text: '',
    seasonNumber: 1,
    titles: '',
    bestPlayer: '',
    wins: 0 as number,
    losses: 0 as number,
    maxUnbeatenRun: 0 as number,
    tactic: '',
    squad: {
      goalie: '',
      captain: '',
      topScorer: '',
      youngTalent: '',
      starPlayer: ''
    }
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', role: 'craque' as any });
  const [selectedTrophies, setSelectedTrophies] = useState<Record<string, number>>({});
  const [shareCode, setShareCode] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateShareCode = (saveId: string) => {
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const year = new Date().getFullYear();
    const code = `FOX-${year}-${random}-${saveId.substring(0, 3).toUpperCase()}`;
    setShareCode(code);
    sounds.success();
    // Simular cópia para área de transferência
    navigator.clipboard.writeText(code);
  };

  const TROPHY_CATEGORIES = [
    {
      name: 'Europa',
      trophies: [
        { id: 'ucl', name: 'Champions League', icon: '🏆' },
        { id: 'eur', name: 'Europa League', icon: '🇪🇺' },
        { id: 'con', name: 'Conference League', icon: '🥉' },
        { id: 'rec', name: 'Recopa / UEFA Super Cup', icon: '🎖️' },
        { id: 'pl', name: 'Premier League', icon: '🦁' },
        { id: 'laliga', name: 'La Liga', icon: '🇪🇸' },
        { id: 'bundes', name: 'Bundesliga', icon: '🇩🇪' },
        { id: 'ita', name: 'Série A Tim', icon: '🇮🇹' },
        { id: 'fra', name: 'Ligue 1', icon: '🇫🇷' },
        { id: 'por', name: 'Liga Portugal', icon: '🇵🇹' },
        { id: 'eur_cup', name: 'Eurocopa', icon: '🇪🇺' },
      ]
    },
    {
      name: 'América',
      trophies: [
        { id: 'lib', name: 'Libertadores', icon: '🌎' },
        { id: 'sula', name: 'Copa Sudamericana', icon: '🥈' },
        { id: 'bra', name: 'Brasileirão Série A', icon: '🇧🇷' },
        { id: 'brb', name: 'Brasileirão Série B', icon: '🥈' },
        { id: 'brc', name: 'Brasileirão Série C', icon: '🥉' },
        { id: 'brd', name: 'Brasileirão Série D', icon: '🏅' },
        { id: 'cdb', name: 'Copa do Brasil', icon: '🏆' },
        { id: 'est', name: 'Estadual', icon: '🏟️' },
        { id: 'copa_am', name: 'Copa América', icon: '🏆' },
        { id: 'mls', name: 'MLS', icon: '🇺🇸' },
      ]
    },
    {
      name: 'Global & Outros',
      trophies: [
        { id: 'cwc', name: 'Mundial de Clubes', icon: '💎' },
        { id: 'wc', name: 'Copa do Mundo', icon: '🌍' },
        { id: 'saudi', name: 'Saudi Pro League', icon: '🇸🇦' },
        { id: 'afc', name: 'AFC Champions League', icon: '🌏' },
        { id: 'caf', name: 'CAF Champions League', icon: '🌍' },
        { id: 'nat', name: 'Copa Nacional', icon: '⚔️' },
        { id: 'sc', name: 'Supercopa', icon: '⚡' },
      ]
    }
  ];

  const toggleTrophy = (name: string) => {
    setSelectedTrophies(prev => {
      const current = prev[name] || 0;
      if (current >= 5) { // Reset after 5 or just increment
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: current + 1 };
    });
    sounds.click();
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    game: GAMES[0],
    team: '',
    country: '',
    league: '',
    stadiumName: '',
    stadiumCapacity: 0 as number,
    managerPersonality: 'Estrategista',
    season: '2024/25',
    tactic: '4-3-3',
    philosophy: 'Equilibrado',
    objective: '',
    category: CAREER_CATEGORIES[0],
    selectedDuration: 3,
    difficulty: DIFFICULTIES[1],
    description: '',
    titles: 0,
    wins: 0,
    losses: 0,
    bestPlayer: ''
  });

  const [showEndReport, setShowEndReport] = useState(false);
  const [appSettings, setAppSettings] = useState<any>(null);
  const [foxAdvice, setFoxAdvice] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<{ title: string; desc: string; type: string } | null>(null);

  const CATEGORY_EVENTS: Record<string, { title: string; desc: string; type: string }[]> = {
    'Rebuild': [
      { title: 'Janela de Oportunidade', desc: 'Um jovem talento da base está pedindo uma chance no time titular.', type: 'positive' },
      { title: 'Cofre Apertado', desc: 'A diretoria reduziu o orçamento de transferências para reformas no estádio.', type: 'negative' },
      { title: 'Nova Filosofia', desc: 'A torcida está exigindo um jogo mais vistoso e ofensivo.', type: 'neutral' }
    ],
    'Modo Lendário': [
      { title: 'Crise Financeira', desc: 'O clube perdeu um patrocinador master e precisa cortar gastos imediatamente.', type: 'negative' },
      { title: 'Epidemia de Lesões', desc: 'Seu principal DM e um zagueiro titular se lesionaram no treino.', type: 'negative' },
      { title: 'Pressão da Mídia', desc: 'Jornalistas estão questionando suas escolhas táticas após os últimos jogos.', type: 'negative' }
    ],
    'Jovens/Promessas': [
      { title: 'Fábrica de Talentos', desc: 'A fornada de jovens deste ano promete ser a melhor da década.', type: 'positive' },
      { title: 'Assédio Europeu', desc: 'Times gigantes estão sondando suas promessas de 17 anos.', type: 'neutral' },
      { title: 'Paciência da Torcida', desc: 'Os fãs aceitam resultados ruins se virem os jovens evoluindo.', type: 'positive' }
    ]
  };

  useEffect(() => {
    if (selectedSave) {
      calcFoxAdvice(selectedSave);
      
      // Select random event for the category
      const events = CATEGORY_EVENTS[selectedSave.category] || [
        { title: 'Rotina de Treinos', desc: 'O time está focado em melhorar a finalização esta semana.', type: 'neutral' },
        { title: 'Clima no Vestiário', desc: 'A união do grupo está em seu ponto mais alto.', type: 'positive' }
      ];
      setActiveEvent(events[Math.floor(Math.random() * events.length)]);
    } else {
      setFoxAdvice(null);
      setActiveEvent(null);
    }
  }, [selectedSave?.id]);
  useEffect(() => {
    const fetchSaves = async () => {
      try {
        const user = storage.getCurrentUser();
        const settings = await storage.getAppSettings();
        setAppSettings(settings);
        if (user) {
          setSaves(await storage.getSaves(user.id));
        }
      } catch (error) {
        console.error("Failed to fetch saves:", error);
      }
    };
    fetchSaves();
  }, []);

  const currentGames = appSettings?.managedGames && appSettings.managedGames.length > 0 ? appSettings.managedGames : GAMES;
  const currentDifficulties = appSettings?.managedDifficulties && appSettings.managedDifficulties.length > 0 ? appSettings.managedDifficulties : DIFFICULTIES;

  const filteredSaves = gameFilter === 'Todos' 
    ? saves 
    : saves.filter(s => s.game === gameFilter);

  const handleAddPlayer = async () => {
    if (!selectedSave || !newPlayer.name) return;
    const player = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPlayer.name,
      role: newPlayer.role,
      season: selectedSave.season
    };
    const updatedSave = {
      ...selectedSave,
      importantPlayers: [...(selectedSave.importantPlayers || []), player],
      updatedAt: Date.now()
    };
    await storage.updateSave(updatedSave);
    setSaves(saves.map(s => s.id === selectedSave.id ? updatedSave : s));
    setSelectedSave(updatedSave);
    setNewPlayer({ name: '', role: 'craque' });
    setShowPlayerModal(false);
    sounds.success();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      game: currentGames[0],
      team: '',
      country: '',
      league: '',
      stadiumName: '',
      stadiumCapacity: 0,
      managerPersonality: 'Estrategista',
      season: '2024/25',
      tactic: '4-3-3',
      objective: '',
      category: CAREER_CATEGORIES[0],
      selectedDuration: 3,
      difficulty: currentDifficulties[1] || currentDifficulties[0],
      description: '',
      titles: 0,
      wins: 0,
      losses: 0,
      bestPlayer: ''
    } as any);
    setEditingSave(null);
    setShowError(null);
    setImagePreview(null);
  };

  const handleCreate = async () => {
    const user = storage.getCurrentUser();
    if (!user) return;

    try {
      const template = CHALLENGE_TEMPLATES[formData.category];
      if (template) {
        // Required fields check
        for (const field of template.requiredFields) {
          if (!formData[field as keyof typeof formData]) {
            setShowError(`O campo "${field}" é obrigatório para este tipo de desafio.`);
            return;
          }
        }
        
        // Duration check
        if (formData.selectedDuration < template.minSeasons || formData.selectedDuration > template.maxSeasons) {
          setShowError(`O prazo para ${formData.category} deve ser entre ${template.minSeasons} e ${template.maxSeasons} temporadas.`);
          return;
        }
      }

      const stats = storage.getUserStats(user.id);
      const today = new Date().toISOString().split('T')[0];

      // Limits check
      if (saves.length >= LIMITS.MAX_SAVES) {
        setShowError(`Máximo de ${LIMITS.MAX_SAVES} saves atingido.`);
        return;
      }

      const isDuplicate = saves.some(s => s.name === formData.name && s.team === formData.team);
      if (isDuplicate) {
        setShowError('Já existe um save com este nome e time.');
        return;
      }

      if (stats.lastSaveDate === today) {
        setShowError('Limite de 1 save por dia atingido.');
        return;
      }

      if (stats.savesCreatedThisMonth >= LIMITS.SAVES_PER_MONTH) {
        setShowError(`Limite de ${LIMITS.SAVES_PER_MONTH} saves por mês atingido.`);
        return;
      }

      const newSave: Save = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        ...formData,
        minSeasons: template?.minSeasons,
        maxSeasons: template?.maxSeasons,
        specificRules: template?.rules,
        challengeBadge: template?.badge,
        images: [],
        history: [
          {
            id: 's1-init',
            season: formData.season,
            content: 'Início do projeto Fox Manager. Definidas as bases do clube e objetivos da diretoria.',
            date: Date.now()
          }
        ],
        goals: [
          { id: 'g1', text: 'Subir divisão', completed: false },
          { id: 'g2', text: 'Revelar 3 jovens', completed: false },
          { id: 'g3', text: 'Ganhar copa nacional', completed: false },
          { id: 'g4', text: 'Não contratar > 25 anos', completed: false },
        ],
        stats: {
          seasonsPlayed: 1,
          titles: formData.titles,
          wins: formData.wins,
          losses: formData.losses,
          bestPlayer: formData.bestPlayer,
          progress: 10
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await storage.addSave(newSave);
      const updatedSaves = [newSave, ...saves];
      setSaves(updatedSaves);
      
      // Badge Checking
      const newBadges = [...user.badges];
      let badgeAwarded = false;
      
      const categoryBadge = template?.badge;
      if (categoryBadge && !newBadges.includes(categoryBadge)) {
        newBadges.push(categoryBadge);
        badgeAwarded = true;
      }

      if (formData.difficulty === 'Extremo' && !newBadges.includes('Hardcore')) {
        newBadges.push('Hardcore');
        badgeAwarded = true;
      }
      if (updatedSaves.length >= 10 && !newBadges.includes('Lenda Fox')) {
        newBadges.push('Lenda Fox');
        badgeAwarded = true;
      }
      
      if (badgeAwarded) {
        await storage.updateUser(user.id, { badges: newBadges });
        sounds.goal();
      }

      storage.updateUserStats(user.id, {
        savesCreatedThisMonth: stats.savesCreatedThisMonth + 1,
        lastSaveDate: today,
      });

      setIsCreating(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create save:", error);
      setShowError("Erro ao criar save. Tente novamente.");
    }
  };

  const handleDelete = async (id: string) => {
    await storage.deleteSave(id);
    const updatedSaves = saves.filter(s => s.id !== id);
    setSaves(updatedSaves);
    setSelectedSave(null);
  };
  const handleUpdate = async () => {
    if (!editingSave) return;
    const updatedSave: Save = { 
      ...editingSave, 
      ...formData, 
      category: formData.category,
      selectedDuration: formData.selectedDuration,
      stats: {
        ...(editingSave.stats || { seasonsPlayed: 1, progress: 10 }),
        titles: formData.titles,
        wins: formData.wins,
        losses: formData.losses,
        bestPlayer: formData.bestPlayer
      },
      updatedAt: Date.now() 
    };
    await storage.updateSave(updatedSave);
    const updatedSaves = saves.map(s => s.id === editingSave.id ? updatedSave : s);
    setSaves(updatedSaves);
    setEditingSave(null);
    resetForm();
    if (selectedSave?.id === editingSave.id) {
       setSelectedSave(updatedSave);
    }
  };

  // ... openEdit
  const openEdit = (save: Save) => {
    setEditingSave(save);
    setFormData({
      name: save.name,
      game: save.game,
      team: save.team,
      country: save.country || '',
      league: save.league || '',
      stadiumName: save.stadiumName || '',
      stadiumCapacity: save.stadiumCapacity || 0,
      managerPersonality: save.managerPersonality || 'Estrategista',
      season: save.season,
      tactic: save.tactic,
      philosophy: save.philosophy || 'Ofensivo',
      objective: save.objective,
      difficulty: save.difficulty,
      description: save.description,
      category: save.category || CAREER_CATEGORIES[0],
      selectedDuration: save.selectedDuration || 3,
      titles: save.stats?.titles || 0,
      wins: save.stats?.wins || 0,
      losses: save.stats?.losses || 0,
      bestPlayer: save.stats?.bestPlayer || ''
    });
  };

  const handleAddLog = async () => {
    if (!selectedSave || !newLog.text) return;

    if (selectedSave.selectedDuration && newLog.seasonNumber > selectedSave.selectedDuration) {
      alert(`Desafio concluído. O prazo escolhido foi de ${selectedSave.selectedDuration} temporadas.`);
      return;
    }

    const contentLower = newLog.text.toLowerCase();
    const trophiesArray = (Object.entries(selectedTrophies) as [string, number][]).map(([name, count]) => 
      count > 1 ? `${name} (x${count})` : name
    );
    const finalTitles = [...trophiesArray, ...(newLog.titles ? [newLog.titles] : [])].join(', ');
    
    // Count total titles added in this log
    let titlesToAdd = 0;
    (Object.values(selectedTrophies) as number[]).forEach(count => titlesToAdd += count);
    if (newLog.titles) titlesToAdd += 1;

    let type: any = 'normal';
    let icon = 'target';
    let badge = '';

    if (finalTitles || contentLower.includes('campeão') || contentLower.includes('título') || contentLower.includes('troféu')) {
      type = 'title';
      icon = 'trophy';
      badge = '🏆 MOMENTO MARCANTE';
    } else if (contentLower.includes('acesso') || contentLower.includes('subiu') || contentLower.includes('promoção')) {
      type = 'milestone';
      icon = 'trending-up';
      badge = '🚀 ACESSO CONQUISTADO';
    } else if (contentLower.includes('rebaixado') || contentLower.includes('rebaixamento') || contentLower.includes('caiu')) {
      type = 'milestone';
      icon = 'alert-circle';
      badge = '📉 QUEDA DE DIVISÃO';
    } else if (newLog.maxUnbeatenRun > 10) {
      type = 'milestone';
      icon = 'flame';
      badge = '🔥 SEQUÊNCIA LENDÁRIA';
    }

    const newLogItem = {
      id: Math.random().toString(36).substr(2, 9),
      season: `Temporada ${newLog.seasonNumber}`,
      seasonNumber: newLog.seasonNumber,
      content: newLog.text,
      type,
      icon,
      badge,
      titles: finalTitles,
      bestPlayer: newLog.bestPlayer,
      wins: newLog.wins,
      losses: newLog.losses,
      maxUnbeatenRun: newLog.maxUnbeatenRun,
      tactic: newLog.tactic || selectedSave.tactic,
      squad: newLog.squad,
      date: Date.now()
    };
    
    // Coherence Check: High wins with zero losses in high difficulty
    let unusualStatsAlert = false;
    if (newLog.wins > 38 && newLog.losses === 0 && selectedSave.difficulty !== 'Fácil') {
      unusualStatsAlert = true;
    }
    
    // Extreme Save Check: Small teams winning top titles too fast in Realistic/Extreme difficulty
    let isExtreme = selectedSave.isExtreme || false;
    const isSmallTeam = ['Pequeno', 'Várzea/Subida'].includes(selectedSave.stadiumCapacity ? (selectedSave.stadiumCapacity < 10000 ? 'Pequeno' : 'Médio') : 'Médio');
    if ((selectedSave.difficulty === 'Extremo' || selectedSave.difficulty === 'Realista') && 
        titlesToAdd >= 1 && 
        newLog.seasonNumber <= 2 && 
        isSmallTeam) {
      isExtreme = true;
    }

    const currentTitles = (selectedSave.stats?.titles || 0) + titlesToAdd;
    const currentMaxRun = Math.max(selectedSave.stats?.maxUnbeatenRun || 0, newLog.maxUnbeatenRun);
    const currentWins = (selectedSave.stats?.wins || 0) + newLog.wins;
    const currentLosses = (selectedSave.stats?.losses || 0) + newLog.losses;
    const totalGames = currentWins + currentLosses;
    const winRate = totalGames > 0 ? Math.round((currentWins / totalGames) * 100) : 0;
    
    const updatedSave: Save = { 
      ...selectedSave, 
      isExtreme,
      unusualStatsAlert: unusualStatsAlert || selectedSave.unusualStatsAlert,
      history: [...(selectedSave.history || []), newLogItem], 
      stats: {
        ...(selectedSave.stats || { seasonsPlayed: 1, wins: 0, losses: 0, bestPlayer: '', progress: 0 }),
        seasonsPlayed: Math.max(selectedSave.stats?.seasonsPlayed || 0, newLog.seasonNumber),
        titles: currentTitles,
        wins: currentWins,
        losses: currentLosses,
        winRate: winRate,
        maxUnbeatenRun: currentMaxRun,
        progress: Math.min((selectedSave.stats?.progress || 0) + 15, 100)
      },
      updatedAt: Date.now() 
    };
    await storage.updateSave(updatedSave);
    await storage.addXP(selectedSave.userId, 200 + (titlesToAdd * 100)); // Increased XP reward
    
    // Automatic Badge Checks
    if (titlesToAdd > 0) await storage.addBadge(selectedSave.userId, 'Primeiro Caneco');
    if (newLog.wins >= 30) await storage.addBadge(selectedSave.userId, 'Máquina de Vencer');
    if (newLog.maxUnbeatenRun >= 15) await storage.addBadge(selectedSave.userId, 'Invencível');
    if (newLog.seasonNumber >= 5) await storage.addBadge(selectedSave.userId, 'Fidelidade');
    if (newLog.seasonNumber >= 10) await storage.addBadge(selectedSave.userId, 'Lenda Viva');

    setSaves(saves.map(s => s.id === selectedSave.id ? updatedSave : s));
    setSelectedSave(updatedSave);
    calcFoxAdvice(updatedSave);
    setNewLog({ 
      text: '', 
      seasonNumber: newLog.seasonNumber + 1,
      titles: '', 
      bestPlayer: '', 
      wins: 0, 
      losses: 0, 
      maxUnbeatenRun: 0,
      tactic: '',
      squad: { goalie: '', captain: '', topScorer: '', youngTalent: '', starPlayer: '' }
    });
    setSelectedTrophies({});
    sounds.success();
  };

  const calcFoxAdvice = (save: Save) => {
    const ageAdvice = [
      "Seu elenco está envelhecendo. Considere renovar as peças principais.",
      "A base é o futuro. Que tal dar mais minutos para os jovens?",
      "O equilíbrio entre juventude e experiência é a chave para o título."
    ];
    const tactAdvice = [
      "Talvez seja hora de testar uma nova tática para surpreender a liga.",
      "Sua defesa está sólida, mas falta criatividade no meio-campo.",
      "A intensidade está alta. Cuidado com o cansaço dos jogadores."
    ];
    const finAdvice = [
      "O orçamento está apertado. Foque em jogadores livres de contrato.",
      "Vender um craque agora pode garantir a saúde financeira do clube.",
      "Invista nas instalações de base para colher frutos a longo prazo."
    ];

    const categoryAdvice: Record<string, string[]> = {
      'Rebuild': [
        "Economize no primeiro ano para explodir no segundo.",
        "Seu time precisa de um líder veterano para guiar os jovens.",
        "A tática certa depende da versatilidade dos seus meias."
      ],
      'Hardcore': [
        "Cada erro pode ser fatal. Não arrisque jogadores pendurados.",
        "O banco de reservas será seu melhor amigo nesta maratona.",
        "Mantenha a moral alta mesmo após derrotas consecutivas."
      ],
      'Base': [
        "Não tenha medo de vender estrelas para abrir espaço para os 'miúdos'.",
        "Invista no recrutamento de jovens promessas toda semana.",
        "A paciência é a virtude do mestre da base."
      ]
    };

    let all = [...ageAdvice, ...tactAdvice, ...finAdvice];
    if (save.category && categoryAdvice[save.category]) {
      all = [...all, ...categoryAdvice[save.category]];
    }
    const random = all[Math.floor(Math.random() * all.length)];
    setFoxAdvice(random);
  };

  useEffect(() => {
    if (selectedSave) {
      calcFoxAdvice(selectedSave);
    } else {
      setFoxAdvice(null);
    }
  }, [selectedSave?.id]);

  const handleEndSave = async () => {
    if (!selectedSave) return;
    if (!confirm("Tem certeza que deseja encerrar esta carreira? Ela será movida para o histórico como Finalizada.")) return;

    const summary = generateAutomaticHistory(selectedSave);
    const updatedSave: Save = {
      ...selectedSave,
      status: 'finished',
      description: `${selectedSave.description}\n\n[RESUMO FINAL]\n${summary}`,
      updatedAt: Date.now()
    };

    await storage.updateSave(updatedSave);
    setSaves(saves.map(s => s.id === selectedSave.id ? updatedSave : s));
    setSelectedSave(updatedSave);
    setShowEndReport(true);
    
    // Add to Hall of Fame if titles > 5 or seasons > 10
    if ((selectedSave.stats?.titles || 0) >= 3 || (selectedSave.stats?.seasonsPlayed || 0) >= 5) {
      const user = storage.getCurrentUser();
      if (user) {
        await storage.addToHallOfFame({
          id: Math.random().toString(36).substr(2, 9),
          saveId: selectedSave.id,
          userId: user.id,
          userName: user.name,
          team: selectedSave.team,
          titles: selectedSave.stats?.titles || 0,
          seasons: selectedSave.stats?.seasonsPlayed || 0,
          bestPlayer: selectedSave.stats?.bestPlayer || 'N/A',
          reason: summary,
          date: Date.now()
        });
        alert("PARABÉNS! Sua carreira foi tão lendária que entrou para o Hall of Fame!");
      }
    }
    
    sounds.success();
  };

  const handleAddClubHistory = async (team: string, season: string) => {
    if (!selectedSave) return;
    const item = { team, season, titles: 0 };
    const updatedSave = {
      ...selectedSave,
      clubHistory: [...(selectedSave.clubHistory || []), item],
      updatedAt: Date.now()
    };
    await storage.updateSave(updatedSave);
    setSaves(saves.map(s => s.id === selectedSave.id ? updatedSave : s));
    setSelectedSave(updatedSave);
  };

  const toggleGoal = async (goalId: string) => {
    if (!selectedSave) return;
    sounds.click();
    const updatedGoals = selectedSave.goals.map(g => {
      if (g.id === goalId) {
        const newState = !g.completed;
        if (newState) sounds.goal();
        return { ...g, completed: newState };
      }
      return g;
    });
    const updatedSave = { ...selectedSave, goals: updatedGoals, updatedAt: Date.now() };
    await storage.updateSave(updatedSave);
    setSaves(saves.map(s => s.id === selectedSave.id ? updatedSave : s));
    setSelectedSave(updatedSave);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedSave) {
      if (file.size > 1024 * 1024) return;
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const updatedImages = [...(selectedSave.images || []), base64].slice(0, 3);
        const updatedSave = { ...selectedSave, images: updatedImages, updatedAt: Date.now() };
        await storage.updateSave(updatedSave);
        setSaves(saves.map(s => s.id === selectedSave.id ? updatedSave : s));
        setSelectedSave(updatedSave);
      };
      reader.readAsDataURL(file);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy': case 'Fácil': return { label: '🟢 EASY', color: 'text-green-500', bg: 'bg-green-500/10', glow: 'shadow-green-500/20' };
      case 'Extreme': case 'Extremo': return { label: '🟣 HARDCORE 🔥', color: 'text-purple-500', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/20' };
      case 'Legendary': case 'Lendário': return { label: '🔱 LENDÁRIO', color: 'text-yellow-500', bg: 'bg-yellow-500/10', glow: 'shadow-yellow-500/20' };
      default: return { label: '🟡 MÉDIO', color: 'text-yellow-500', bg: 'bg-yellow-500/10', glow: 'shadow-yellow-500/20' };
    }
  };

  const exportToPDF = (save: Save) => {
    sounds.click();
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(123, 44, 191); // #7B2CBF
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('FOX MANAGERS - RELATÓRIO DE CARREIRA', 15, 25);
      
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString()}`, 15, 33);
      
      // Content
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.text('DETALHES DO PROJETO', 15, 55);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Time: ${save.team}`, 15, 65);
      doc.text(`Jogo: ${save.game}`, 15, 72);
      doc.text(`Temporada Atual: ${save.season}`, 15, 79);
      doc.text(`Dificuldade: ${save.difficulty}`, 15, 86);
      
      if (save.description) {
        doc.setFont('helvetica', 'italic');
        doc.text(`Objetivo: "${save.description}"`, 15, 95);
      }

      // Stats Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('ESTATÍSTICAS TÁTICAS', 15, 110);
      
      const statsData = [
        ['Títulos', save.stats?.titles || 0],
        ['Temporadas Jogadas', save.stats?.seasonsPlayed || 0],
        ['Vitórias', save.stats?.wins || 0],
        ['Empates', save.stats?.draws || 0],
        ['Derrotas', save.stats?.losses || 0],
        ['Gols Pró', save.stats?.goalsFor || 0],
        ['Gols Contra', save.stats?.goalsAgainst || 0],
        ['Melhor Jogador', save.stats?.bestPlayer || '-']
      ];
      
      (doc as any).autoTable({
        startY: 115,
        head: [['Categoria', 'Valor']],
        body: statsData,
        theme: 'striped',
        headStyles: { fillStyle: [123, 44, 191] }
      });

      // History Logs
      const lastY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('LINHA DO TEMPO (ÚLTIMOS EVENTOS)', 15, lastY);
      
      const logs = save.history?.slice(-10).map(log => [
        new Date(log.date).toLocaleDateString(),
        log.content,
        log.season
      ]) || [];

      if (logs.length > 0) {
        (doc as any).autoTable({
          startY: lastY + 5,
          head: [['Data', 'Evento', 'Detalhes']],
          body: logs,
          theme: 'grid',
          headStyles: { fillStyle: [90, 24, 154] }
        });
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Nenhum registro no histórico.', 15, lastY + 10);
      }

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Fox Managers Elite Edition - Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
      }

      doc.save(`Relatorio_Fox_${save.team}_${save.season}.pdf`);
      sounds.success();
    } catch (error) {
      console.error('PDF Error:', error);
      sounds.error();
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const exportSave = (save: Save) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(save, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${save.name.replace(/\s+/g, '_')}_career.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    sounds.success();
  };

  const generateAutomaticHistory = (save: Save) => {
    const totalTitles = save.stats?.titles || 0;
    const seasons = save.stats?.seasonsPlayed || 0;
    const team = save.team;
    const personality = save.managerPersonality || 'Estrategista';
    
    let summary = `Sob o comando do técnico ${personality}, o ${team} viveu uma era marcante. `;
    summary += `Foram ${seasons} ${seasons === 1 ? 'temporada' : 'temporadas'} de muita luta no ${save.stadiumName || 'seu estádio'}. `;
    
    if (totalTitles > 0) {
      summary += `A galeria de troféus agora conta com ${totalTitles} novos títulos, consolidando uma filosofia de ${save.philosophy || 'jogo vitoriosa'}. `;
    } else {
      summary += `Embora os títulos não tenham vindo, a base da filosofia ${save.philosophy || 'estratégica'} foi estabelecida para o futuro. `;
    }
    
    if (save.stats?.maxUnbeatenRun && save.stats.maxUnbeatenRun > 5) {
      summary += `A torcida jamais esquecerá a sequência de ${save.stats.maxUnbeatenRun} jogos sem perder. `;
    }

    if (save.stats?.bestPlayer) {
      summary += `O nome de ${save.stats.bestPlayer} ficará eternizado como o grande craque desta jornada. `;
    }
    
    return summary;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white font-display">
          {selectedSave ? 'Diário de Carreira' : 'Meus Saves'}
        </h2>
        {!selectedSave && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-[#7B2CBF] p-4 rounded-[22px] text-white shadow-2xl shadow-[#7B2CBF44] active:scale-95 transition-all hover:bg-[#9D4EDD]"
          >
            <Plus size={28} />
          </button>
        )}
        {selectedSave && (
          <div className="flex gap-2">
            <button 
              onClick={() => exportToPDF(selectedSave)}
              className="p-3 glass rounded-2xl text-blue-400 hover:bg-blue-400/10 transition-colors"
              title="Gerar Relatório PDF"
            >
              <FileText size={20} />
            </button>
            <button 
              onClick={() => exportSave(selectedSave)}
              className="p-3 glass rounded-2xl text-[#7B2CBF] hover:bg-[#7B2CBF]/10 transition-colors"
              title="Exportar JSON"
            >
              <Download size={20} />
            </button>
            <button onClick={() => setSelectedSave(null)} className="p-3 glass rounded-2xl text-[#A0A0A0] hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {!selectedSave ? (
        <>
          {/* Stats Header */}
          <div className="grid grid-cols-2 gap-4 px-4">
            <div className="glass-dark p-6 rounded-[32px] space-y-1 relative overflow-hidden group">
              <span className="text-[10px] text-[#A0A0A0] uppercase font-black tracking-[0.2em] block font-display">Slots de Carreira</span>
              <p className="font-black text-3xl text-white font-mono">{saves.length} <span className="text-[#333]">/ {LIMITS.MAX_SAVES}</span></p>
              <div className="absolute right-[-15px] bottom-[-15px] opacity-[0.03] text-white group-hover:scale-110 transition-transform">
                <SaveIcon size={80} />
              </div>
            </div>
            <div className="glass-dark p-6 rounded-[32px] space-y-1 relative overflow-hidden group">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#7B2CBF] rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-[#7B2CBF] uppercase font-black tracking-[0.2em] block font-display">Status Fox</span>
               </div>
              <p className="font-black text-2xl text-white uppercase italic tracking-tighter">Elite Manager</p>
              <div className="absolute right-[-15px] bottom-[-15px] opacity-[0.03] text-[#7B2CBF] group-hover:scale-110 transition-transform">
                <Flame size={80} />
              </div>
            </div>
          </div>

          {/* Game Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide">
            <button 
              onClick={() => setGameFilter('Todos')}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 font-display ${
                gameFilter === 'Todos' 
                  ? 'bg-[#7B2CBF] text-white shadow-xl shadow-[#7B2CBF33]' 
                  : 'glass-dark text-[#A0A0A0] hover:border-[#7B2CBF44]'
              }`}
            >
              Todos
            </button>
            {currentGames.map((game: string) => (
              <button 
                key={game}
                onClick={() => setGameFilter(game)}
                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 font-display ${
                  gameFilter === game 
                    ? 'bg-[#7B2CBF] text-white shadow-xl shadow-[#7B2CBF33]' 
                    : 'glass-dark text-[#A0A0A0] hover:border-[#7B2CBF44]'
                }`}
              >
                {game}
              </button>
            ))}
          </div>

          <div className="grid gap-4 px-4 mt-2">
            {filteredSaves.length === 0 ? (
              <div className="text-center py-24 glass rounded-[48px] border-2 border-dashed border-[#2D2D2D] space-y-6">
                <div className="w-20 h-20 glass-dark rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <Bot size={40} className="text-[#333]" />
                </div>
                <div className="space-y-2">
                   <p className="text-sm font-black uppercase tracking-[0.2em] text-[#A0A0A0] font-display">Nenhuma carreira ativa</p>
                   <p className="text-[10px] text-[#444] font-bold uppercase">Comece a planejar seu rebuild lendário agora.</p>
                </div>
                <button 
                   onClick={() => setIsCreating(true)} 
                   className="bg-[#7B2CBF] text-white px-8 py-4 rounded-[20px] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#7B2CBF22] active:scale-95 transition-all"
                >
                   Abrir Gerador de Projetos
                </button>
              </div>
            ) : (
              filteredSaves.map((save, i) => (
                <motion.div 
                  key={save.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { sounds.click(); setSelectedSave(save); }}
                  className="glass-dark border border-white/5 rounded-[36px] p-6 lg:p-8 flex justify-between items-center group hover:border-[#7B2CBF44] hover:bg-white/[0.03] transition-all cursor-pointer relative overflow-hidden shadow-xl"
                >
                  <div className="space-y-5 relative z-10 w-full">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-[#7B2CBF] group-hover:scale-110 transition-transform">
                              <Shield size={20} />
                           </div>
                           <div>
                              <h3 className="font-black text-xl uppercase italic text-white group-hover:text-[#7B2CBF] transition-colors font-display line-clamp-1">{save.team}</h3>
                              <p className="text-[10px] font-black text-[#7B2CBF] uppercase tracking-[0.2em]">{save.game}</p>
                           </div>
                        </div>
                      </div>
                      <div className="p-3.5 glass group-hover:bg-[#7B2CBF] group-hover:text-white transition-all rounded-2xl shadow-xl">
                        <ChevronRight size={24} />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 pt-5 border-t border-white/5 relative">
                        <div className="space-y-1">
                           <span className="text-[8px] font-black text-[#444] uppercase tracking-widest font-display">Temporada</span>
                           <p className="text-xs font-black text-white font-mono">{save.season}</p>
                        </div>
                        <div className="space-y-1">
                           <span className="text-[8px] font-black text-yellow-500/60 uppercase tracking-widest font-display">Títulos</span>
                           <p className="text-xs font-black text-yellow-500 font-mono italic">{save.stats?.titles || 0} 🏆</p>
                        </div>
                        <div className="space-y-1">
                           <span className="text-[8px] font-black text-[#444] uppercase tracking-widest font-display">Ranking</span>
                           <p className="text-xs font-black text-white uppercase italic tracking-tighter">{save.difficulty}</p>
                        </div>
                        <div className="space-y-1">
                           <span className="text-[8px] font-black text-[#7B2CBF]/60 uppercase tracking-widest font-display">Status</span>
                           <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                              <p className="text-[9px] font-black text-white uppercase tracking-tighter">ATIVO</p>
                           </div>
                        </div>
                    </div>
                    
                    {save.description && (
                       <p className="text-[10px] text-[#A0A0A0] italic line-clamp-1 opacity-60 group-hover:opacity-100 transition-opacity">"{save.description}"</p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 pb-32 px-2">
          {/* Header Gamer */}
          <div className={`border border-[#2D2D2D] rounded-[40px] p-8 space-y-6 relative overflow-hidden shadow-2xl transition-all duration-700 ${
            selectedSave.bannerStyle === 'neon' ? 'bg-gradient-to-br from-[#1A1A1A] via-[#7B2CBF11] to-[#0F0F0F]' :
            selectedSave.bannerStyle === 'stadium' ? 'bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D]' :
            selectedSave.bannerStyle === 'grass' ? 'bg-gradient-to-br from-[#0F2D0F] to-[#0F0F0F]' :
            'bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F]'
          }`}>
            {selectedSave.bannerStyle === 'neon' && (
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-1/4 w-px h-full bg-[#7B2CBF] shadow-[0_0_20px_#7B2CBF]" />
                <div className="absolute top-0 right-1/4 w-px h-full bg-[#9D4EDD] shadow-[0_0_20px_#9D4EDD]" />
              </div>
            )}
            
            <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12 text-[#7B2CBF]">
               <Trophy size={160} />
            </div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-4">
                <div className="space-y-1">
                   <div className="flex items-center gap-2">
                     <span className="text-xl">{(selectedSave.country === 'Brasil' ? '🇧🇷' : selectedSave.country === 'Portugal' ? '🇵🇹' : selectedSave.country === 'Espanha' ? '🇪🇸' : selectedSave.country === 'Inglaterra' ? '🏴󠁧󠁢󠁥󠁮󠁧󠁿' : (selectedSave.country || '🌍'))}</span>
                     <span className="text-[10px] font-black uppercase text-[#7B2CBF] tracking-widest">{selectedSave.country || 'GLOBAL'} • {selectedSave.league || 'DESAFIO DE ELITE'}</span>
                   </div>
                   <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">{selectedSave.team}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-[0.2em]">{selectedSave.game}</p>
                  <div className={`px-3 py-1 rounded-full ${getDifficultyBadge(selectedSave.difficulty).bg} ${getDifficultyBadge(selectedSave.difficulty).color} text-[8px] font-black italic tracking-tight border border-white/5 shadow-lg ${getDifficultyBadge(selectedSave.difficulty).glow}`}>
                    {getDifficultyBadge(selectedSave.difficulty).label}
                  </div>
                  {selectedSave.isExtreme && (
                    <div className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[8px] font-black italic border border-orange-500/20 shadow-lg shadow-orange-500/10 flex items-center gap-1">
                       <Flame size={10} /> SAVE EXTREMO
                    </div>
                  )}
                  {selectedSave.isCEOChoice && (
                    <div className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[8px] font-black italic border border-yellow-500/20 shadow-lg shadow-yellow-500/10 flex items-center gap-1">
                       <Crown size={10} /> CEO CHOICE
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-3">
                <div className="flex flex-col items-end">
                   <span className="text-[10px] bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-white font-black">{selectedSave.season}</span>
                   {selectedSave.managerName && (
                     <span className="text-[8px] font-black uppercase text-[#7B2CBF] mt-1 italic tracking-widest mr-2">Coach: {selectedSave.managerName}</span>
                   )}
                </div>
                
                <div className="flex gap-2">
                  {storage.getCurrentUser()?.role === 'CEO' && (
                    <button 
                       onClick={async () => {
                          const updated = { ...selectedSave, isCEOChoice: !selectedSave.isCEOChoice };
                          await storage.updateSave(updated);
                          setSaves(saves.map(s => s.id === selectedSave.id ? updated : s));
                          setSelectedSave(updated);
                          sounds.success();
                       }}
                       className={`p-2 rounded-xl border transition-all ${selectedSave.isCEOChoice ? 'bg-yellow-500 text-white border-yellow-600' : 'bg-white/5 text-yellow-500 border-white/10'}`}
                       title="Destaque do CEO"
                    >
                       <Crown size={14} />
                    </button>
                  )}
                  <button 
                     onClick={() => generateShareCode(selectedSave.id)}
                     className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group"
                  >
                   <div className="w-6 h-6 rounded-lg bg-[#7B2CBF]/20 flex items-center justify-center text-[#7B2CBF] group-hover:scale-110 transition-transform">
                      <Zap size={10} fill="currentColor" />
                   </div>
                   <div className="text-left">
                      <p className="text-[6px] font-black text-[#A0A0A0] uppercase tracking-widest">Share Code</p>
                      <p className="text-[9px] font-bold text-white tracking-tight">
                         {shareCode ? shareCode : 'Gerar'}
                      </p>
                   </div>
                </button>
               </div>
             </div>
           </div>

            {selectedSave.unusualStatsAlert && (
               <div className="relative z-10 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-500">
                  <AlertCircle size={16} />
                  <span className="text-[8px] font-black uppercase tracking-widest">⚠ Estatísticas incomuns detectadas</span>
               </div>
            )}
            
            {/* Philosophy Display */}
            {selectedSave.philosophy && (
               <div className="relative z-10 space-y-3">
                 <div className="px-6 py-4 bg-gradient-to-r from-[#7B2CBF]/20 to-transparent border-l-4 border-[#7B2CBF] rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                       <Crown size={12} className="text-[#7B2CBF]" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#7B2CBF]">Filosofia do Manager</span>
                    </div>
                    <p className="text-sm font-black uppercase italic text-white tracking-tighter">{selectedSave.philosophy}</p>
                 </div>

                 {selectedSave.category && (
                    <div className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Target size={12} className="text-[#7B2CBF]" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-[#A0A0A0]">Desafio: {selectedSave.category}</span>
                          </div>
                          <span className="px-3 py-1 bg-[#7B2CBF]/20 rounded-full text-[#7B2CBF] text-[8px] font-black italic">{selectedSave.challengeBadge}</span>
                       </div>
                       
                       <div className="space-y-2">
                          <p className="text-[8px] font-black uppercase text-[#444] tracking-widest">Regras Ativas:</p>
                          <div className="grid grid-cols-2 gap-2">
                             {(selectedSave.specificRules || []).map((rule, i) => (
                               <div key={i} className="flex items-center gap-2">
                                  <Check size={10} className="text-green-500" />
                                  <span className="text-[10px] text-white/80 font-bold uppercase tracking-tight">{rule}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                       
                       <div className="pt-2 border-t border-white/5">
                          <div className="flex justify-between items-center">
                             <span className="text-[8px] font-black uppercase text-[#444]">Prazo Final:</span>
                             <span className="text-[10px] font-black text-white italic">{selectedSave.selectedDuration} Temporadas</span>
                          </div>
                       </div>
                    </div>
                 )}
                 
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                       <span className="text-[8px] font-black uppercase text-[#A0A0A0]">História Gerada</span>
                       <button 
                         onClick={() => {
                            const summary = generateAutomaticHistory(selectedSave);
                            alert(summary);
                         }}
                         className="text-[8px] font-black uppercase text-[#7B2CBF] hover:underline"
                       >
                         Ver Resumo Fox
                       </button>
                    </div>
                    <p className="text-[10px] text-[#A0A0A0] italic leading-relaxed">
                      {generateAutomaticHistory(selectedSave)}
                    </p>
                 </div>
               </div>
            )}

            {/* Career Progress */}
            <div className="space-y-3 relative z-10 pt-4">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#A0A0A0]">
                  <span>Progresso da Carreira</span>
                  <span className="text-white">{selectedSave.stats?.progress || 10}%</span>
               </div>
               <div className="h-4 bg-black/40 rounded-full border border-white/5 p-1 relative overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedSave.stats?.progress || 10}%` }}
                    className="h-full bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] rounded-full shadow-[0_0_10px_rgba(123,44,191,0.5)]"
                  />
               </div>
               <div className="flex justify-between items-center mt-1">
                  <p className="text-[9px] text-[#A0A0A0] font-bold uppercase">Temporadas: {selectedSave.stats?.seasonsPlayed || 1} / {selectedSave.selectedDuration}</p>
                  {(selectedSave.stats?.seasonsPlayed || 0) >= (selectedSave.selectedDuration || 0) && (
                    <span className="text-[8px] font-black text-green-500 uppercase tracking-widest animate-pulse">✨ Desafio Concluído</span>
                  )}
               </div>
            </div>
          </div>

          {/* Achievements & Milestones */}
          <section className="space-y-4">
             <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-4 bg-yellow-500 rounded-full"></div>
                   <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A0A0A0]">Conquistas da Lenda</h4>
                </div>
                <Award size={16} className="text-yellow-500" />
             </div>
             
             <div className="flex gap-3 overflow-x-auto pb-2 px-1 no-scrollbar">
                {selectedSave.stats?.titles && selectedSave.stats.titles > 0 && (
                   <div className="shrink-0 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-[28px] flex flex-col items-center gap-2 min-w-[100px]">
                      <Trophy size={20} className="text-yellow-500" />
                      <span className="text-[8px] font-black uppercase text-white">Campeão</span>
                   </div>
                )}
                {selectedSave.stats?.maxUnbeatenRun && selectedSave.stats.maxUnbeatenRun > 10 && (
                   <div className="shrink-0 bg-red-500/10 border border-red-500/30 p-4 rounded-[28px] flex flex-col items-center gap-2 min-w-[100px]">
                      <Flame size={20} className="text-red-500" />
                      <span className="text-[8px] font-black uppercase text-white">Invicto</span>
                </div>
                )}
                {selectedSave.difficulty === 'Extremo' && (
                   <div className="shrink-0 bg-purple-500/10 border border-purple-500/30 p-4 rounded-[28px] flex flex-col items-center gap-2 min-w-[100px]">
                      <Zap size={20} className="text-purple-500" />
                      <span className="text-[8px] font-black uppercase text-white">Hardcore</span>
                   </div>
                )}
                <div className="shrink-0 bg-green-500/10 border border-green-500/30 p-4 rounded-[28px] flex flex-col items-center gap-2 min-w-[100px]">
                   <Target size={20} className="text-green-500" />
                   <span className="text-[8px] font-black uppercase text-white">Visionário</span>
                </div>
             </div>
          </section>

          {/* Star Players Section */}
          <section className="space-y-4">
             <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-4 bg-[#7B2CBF] rounded-full"></div>
                   <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A0A0A0]">Craques da Carreira</h4>
                </div>
                <Users size={16} className="text-[#7B2CBF]" />
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                {(selectedSave.importantPlayers || []).length > 0 ? (
                  selectedSave.importantPlayers?.map(player => (
                    <div key={player.id} className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-[32px] space-y-2 group hover:border-[#7B2CBF44] transition-all">
                       <div className="flex justify-between items-start">
                          <div className="p-2 bg-[#7B2CBF]/10 rounded-xl text-[#7B2CBF]">
                             <Star size={16} fill="currentColor" />
                          </div>
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-black/40 rounded-full text-[#A0A0A0]">{player.role}</span>
                       </div>
                       <div>
                          <p className="text-sm font-black text-white uppercase italic truncate">{player.name}</p>
                          <p className="text-[8px] font-bold text-[#7B2CBF] uppercase tracking-widest">{player.season}</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <button 
                    onClick={() => setShowPlayerModal(true)}
                    className="col-span-2 bg-black/20 border-2 border-dashed border-[#2D2D2D] p-6 rounded-[32px] flex flex-col items-center gap-2 text-[#A0A0A0] hover:text-[#7B2CBF] hover:border-[#7B2CBF44] transition-all"
                  >
                    <Plus size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Imortalizar um Craque</span>
                  </button>
                )}
             </div>
             {(selectedSave.importantPlayers || []).length > 0 && (
               <button 
                 onClick={() => setShowPlayerModal(true)}
                 className="w-full py-3 border border-dashed border-[#2D2D2D] rounded-2xl text-[9px] font-black uppercase text-[#444] hover:text-[#7B2CBF] hover:border-[#7B2CBF44] transition-all"
               >
                 + Adicionar Outro Craque
               </button>
             )}
          </section>

          {/* Dynamic Situation Card */}
          {activeEvent && (
            <motion.section 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="px-3"
            >
              <div className={`p-6 rounded-[32px] border-2 flex gap-5 items-start relative overflow-hidden transition-all duration-500 ${
                activeEvent.type === 'negative' ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' :
                activeEvent.type === 'positive' ? 'bg-green-500/5 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]' :
                'bg-[#7B2CBF]/5 border-[#7B2CBF]/20 shadow-[0_0_20px_rgba(123,44,191,0.1)]'
              }`}>
                 <div className={`w-12 h-12 rounded-[22px] flex items-center justify-center shrink-0 shadow-lg ${
                    activeEvent.type === 'negative' ? 'bg-red-500 text-white' :
                    activeEvent.type === 'positive' ? 'bg-green-500 text-white' :
                    'bg-[#7B2CBF] text-white'
                 }`}>
                    {activeEvent.type === 'negative' ? <AlertCircle size={24} /> : 
                     activeEvent.type === 'positive' ? <Zap size={24} /> : 
                     <Activity size={24} />}
                 </div>
                 <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                        activeEvent.type === 'negative' ? 'text-red-500' :
                        activeEvent.type === 'positive' ? 'text-green-500' :
                        'text-[#7B2CBF]'
                      }`}>Situação Atual</p>
                      <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                      <span className="text-[8px] font-bold text-[#A0A0A0] uppercase italic tracking-widest">{selectedSave.category}</span>
                    </div>
                    <h5 className="text-lg font-black text-white uppercase italic leading-none">{activeEvent.title}</h5>
                    <p className="text-xs text-[#A0A0A0] font-medium leading-relaxed italic pr-4">
                      "{activeEvent.desc}"
                    </p>
                 </div>
              </div>
            </motion.section>
          )}

          {/* Fox Journal - Automatic Narrative */}
          {foxAdvice && (
            <section className="space-y-4 px-3">
              <div className="bg-[#7B2CBF]/10 border border-[#7B2CBF]/20 p-5 rounded-[32px] flex gap-4">
                 <div className="w-10 h-10 bg-[#7B2CBF] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#7B2CBF33]">
                    <Bot size={20} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#7B2CBF]">Conselheiro Fox Bot</p>
                    <p className="text-[11px] text-white/80 font-medium italic">"{foxAdvice}"</p>
                 </div>
              </div>
            </section>
          )}

          {/* Club History */}
          <section className="space-y-4 px-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                   <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A0A0A0]">Histórico de Clubes</h4>
                </div>
                <button 
                  onClick={() => {
                    const team = prompt("Nome do novo clube:");
                    const season = prompt("Temporada de início:");
                    if (team && season) handleAddClubHistory(team, season);
                  }}
                  className="text-[9px] font-black uppercase text-blue-500 hover:underline"
                >
                  Transferência
                </button>
             </div>
             <div className="space-y-2">
                <div className="bg-[#1A1A1A] border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-[11px] font-black text-white uppercase italic">{selectedSave.team}</span>
                   </div>
                   <span className="text-[9px] font-bold text-[#A0A0A0]">{selectedSave.season} (Atual)</span>
                </div>
                {selectedSave.clubHistory?.map((h, i) => (
                  <div key={i} className="bg-black/20 border border-white/5 p-4 rounded-2xl flex justify-between items-center opacity-60">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-[11px] font-black text-white uppercase italic">{h.team}</span>
                     </div>
                     <span className="text-[9px] font-bold text-[#A0A0A0]">{h.season}</span>
                  </div>
                ))}
             </div>
          </section>

          <section className="space-y-4">
             <div className="flex items-center gap-3 px-3">
               <div className="w-1.5 h-4 bg-purple-500 rounded-full shadow-[0_0_8px_#7B2CBF]"></div>
               <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A0A0A0]">Fox Journal: Resumo da Era</h4>
             </div>
             
             <div className="bg-[#1A1A1A] p-6 rounded-[32px] border border-[#2D2D2D] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-[#7B2CBF]">
                   <History size={40} />
                </div>
                <p className="text-xs text-[#E0E0E0] font-medium leading-relaxed italic relative z-10">
                   "{generateAutomaticHistory(selectedSave)}"
                </p>
             </div>
          </section>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-[#1A1A1A] p-5 rounded-[32px] border border-[#2D2D2D] space-y-1 relative overflow-hidden group hover:border-[#7B2CBF44] transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-green-500 transform translate-x-1 translate-y-1 group-hover:scale-110 transition-transform">
                   <Target size={40} />
                </div>
                <span className="text-[9px] text-[#A0A0A0] font-black uppercase tracking-widest flex items-center gap-1">🏟️ Estádio</span>
                <p className="text-[10px] font-black text-white truncate uppercase italic">{selectedSave.stadiumName || 'Arena Fox'}</p>
                <p className="text-[8px] font-bold text-green-500/60 uppercase">{(selectedSave.stadiumCapacity || 0).toLocaleString()} Lugares</p>
             </div>

             <div className="bg-[#1A1A1A] p-5 rounded-[32px] border border-[#2D2D2D] space-y-1 relative overflow-hidden group hover:border-[#7B2CBF44] transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-[#7B2CBF] transform translate-x-1 translate-y-1 group-hover:scale-110 transition-transform">
                   <Activity size={40} />
                </div>
                <span className="text-[9px] text-[#A0A0A0] font-black uppercase tracking-widest flex items-center gap-1">🧠 Persona</span>
                <p className="text-[10px] font-black text-white italic uppercase tracking-wider">{selectedSave.managerPersonality || 'Estrategista'}</p>
                <p className="text-[8px] font-bold text-[#7B2CBF]/60 uppercase tracking-widest">{selectedSave.philosophy || 'Equilibrado'}</p>
             </div>
             <div className="bg-[#1A1A1A] p-5 rounded-[32px] border border-[#2D2D2D] space-y-1 relative overflow-hidden group hover:border-[#7B2CBF44] transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-[#7B2CBF] transform translate-x-1 translate-y-1 group-hover:scale-110 transition-transform">
                   <Trophy size={40} />
                </div>
                <span className="text-[9px] text-[#A0A0A0] font-black uppercase tracking-widest flex items-center gap-1"><Trophy size={10} className="text-[#7B2CBF]" /> Títulos</span>
                <p className="text-2xl font-black text-white">{selectedSave.stats?.titles || 0}</p>
                <div className="flex items-center gap-1 mt-2">
                   <div className="h-1 flex-1 bg-yellow-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 w-[60%]" />
                   </div>
                </div>
             </div>
             
             <div className="bg-[#1A1A1A] p-5 rounded-[32px] border border-[#2D2D2D] space-y-1 relative overflow-hidden group hover:border-[#7B2CBF44] transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-green-500 transform translate-x-1 translate-y-1 group-hover:scale-110 transition-transform">
                   <TrendingUp size={40} />
                </div>
                <span className="text-[9px] text-[#A0A0A0] font-black uppercase tracking-widest flex items-center gap-1"><BarChart3 size={10} className="text-green-500" /> Vitórias</span>
                <p className="text-2xl font-black text-white">{selectedSave.stats?.wins || 0}</p>
                <p className="text-[8px] font-bold text-green-500 uppercase tracking-widest mt-1">Aproveitamento: {selectedSave.stats?.winRate || 0}%</p>
             </div>

             <div className="bg-[#1A1A1A] p-5 rounded-[32px] border border-[#2D2D2D] space-y-1 relative overflow-hidden group hover:border-[#7B2CBF44] transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-500 transform translate-x-1 translate-y-1 group-hover:scale-110 transition-transform">
                   <Zap size={40} />
                </div>
                <span className="text-[9px] text-[#A0A0A0] font-black uppercase tracking-widest flex items-center gap-1">⚽ Gols Pró</span>
                <p className="text-2xl font-black text-blue-400">{selectedSave.stats?.goalsFor || 0}</p>
             </div>

             <div className="bg-[#1A1A1A] p-5 rounded-[32px] border border-[#2D2D2D] space-y-1 relative overflow-hidden group hover:border-[#7B2CBF44] transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-red-500 transform translate-x-1 translate-y-1 group-hover:scale-110 transition-transform">
                   <AlertCircle size={40} />
                </div>
                <span className="text-[9px] text-[#A0A0A0] font-black uppercase tracking-widest flex items-center gap-1">🥅 Gols Contra</span>
                <p className="text-2xl font-black text-red-400">{selectedSave.stats?.goalsAgainst || 0}</p>
             </div>
          </div>

          {/* Performance Analysis - Best/Worst Season */}
          <section className="space-y-4">
             <div className="flex items-center gap-3 px-3">
               <div className="w-1.5 h-4 bg-[#7B2CBF] rounded-full"></div>
               <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A0A0A0]">Melhores/Piores Momentos</h4>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                {/* Best Season */}
                <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 p-5 rounded-[32px] space-y-3 relative overflow-hidden group">
                   <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-green-500" />
                      <span className="text-[9px] font-black uppercase text-green-500 tracking-widest">Melhor Temporada</span>
                   </div>
                   {(() => {
                      const history = selectedSave.history || [];
                      if (history.length === 0) return <p className="text-[10px] text-[#444] font-bold uppercase italic">Sem dados</p>;
                      const best = [...history].sort((a, b) => {
                         const scoreA = (a.wins || 0) - (a.losses || 0) + (a.titles ? 10 : 0);
                         const scoreB = (b.wins || 0) - (b.losses || 0) + (b.titles ? 10 : 0);
                         return scoreB - scoreA;
                      })[0];
                      return (
                         <div className="space-y-1">
                            <p className="text-xs font-black text-white">{best.season}</p>
                            <p className="text-[8px] text-green-500 font-bold uppercase">{best.wins} Vitórias • {best.titles || 'Sem Títulos'}</p>
                         </div>
                      );
                   })()}
                </div>

                {/* Worst Season */}
                <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 p-5 rounded-[32px] space-y-3 relative overflow-hidden group">
                   <div className="flex items-center gap-2">
                      <AlertCircle size={14} className="text-red-500" />
                      <span className="text-[9px] font-black uppercase text-red-500 tracking-widest">Pior Temporada</span>
                   </div>
                   {(() => {
                      const history = selectedSave.history || [];
                      if (history.length <= 1) return <p className="text-[10px] text-[#444] font-bold uppercase italic">Sem dados</p>;
                      const worst = [...history].sort((a, b) => {
                         const scoreA = (a.wins || 0) - (a.losses || 0);
                         const scoreB = (b.wins || 0) - (b.losses || 0);
                         return scoreA - scoreB;
                      })[0];
                      return (
                         <div className="space-y-1">
                            <p className="text-xs font-black text-white">{worst.season}</p>
                            <p className="text-[8px] text-red-500 font-bold uppercase">{worst.losses} Derrotas</p>
                         </div>
                      );
                   })()}
                </div>
             </div>
          </section>

          {/* Save Goals Checklist */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-4 bg-[#7B2CBF] rounded-full"></div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A0A0A0]">Metas do Save</h4>
              </div>
              <div className="flex items-center gap-2">
                <Target size={12} className="text-[#7B2CBF]" />
                <span className="text-[10px] font-black text-white italic">
                  {selectedSave.goals?.filter(g => g.completed).length || 0}/{selectedSave.goals?.length || 0}
                </span>
              </div>
            </div>

            {/* General Goals Progress Bar */}
            <div className="px-3">
              <div className="bg-black/20 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.1em]">
                  <span className="text-[#A0A0A0]">Progresso dos Objetivos</span>
                  <span className="text-[#7B2CBF]">
                    {Math.round(((selectedSave.goals?.filter(g => g.completed).length || 0) / (selectedSave.goals?.length || 1)) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(((selectedSave.goals?.filter(g => g.completed).length || 0) / (selectedSave.goals?.length || 1)) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] shadow-[0_0_10px_rgba(123,44,191,0.5)]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-[32px] border border-[#2D2D2D] overflow-hidden">
              {selectedSave.goals?.map((goal) => (
                <div 
                  key={goal.id} 
                  onClick={() => toggleGoal(goal.id)} 
                  className={`flex items-center gap-4 px-8 py-5 border-b border-[#2D2D2D] last:border-0 hover:bg-white/5 transition-all cursor-pointer group`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                    goal.completed 
                      ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white shadow-lg shadow-[#7B2CBF33]' 
                      : 'border-[#2D2D2D] group-hover:border-[#7B2CBF44]'
                  }`}>
                    {goal.completed && <Check size={14} strokeWidth={4} />}
                  </div>
                  <span className={`text-sm font-black uppercase italic tracking-tight transition-all ${
                    goal.completed ? 'opacity-40 line-through scale-95' : 'text-white'
                  }`}>
                    {goal.text}
                  </span>
                </div>
              ))}
              {!selectedSave.goals?.length && (
                <p className="p-8 text-center text-[10px] font-bold uppercase text-[#A0A0A0]">Nenhuma meta ativa.</p>
              )}
            </div>
          </section>

          {/* Career Timeline */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-3">
              <div className="w-1.5 h-4 bg-[#7B2CBF] rounded-full"></div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A0A0A0]">Timeline da Jornada</h4>
            </div>
            
            <div className="bg-[#1A1A1A] p-8 rounded-[40px] border border-[#2D2D2D] space-y-6">
              <div className="space-y-4">
                <input 
                  value={newLog.text}
                  onChange={e => setNewLog({...newLog, text: e.target.value})}
                  placeholder="Relate um momento marcante..."
                  className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs focus:border-[#7B2CBF] outline-none text-white italic placeholder:text-white/20"
                />
                
                <div className="space-y-3">
                   <div className="flex items-center justify-between ml-2">
                      <label className="text-[8px] font-black uppercase text-[#A0A0A0]">Conquistas da Temporada</label>
                      <span className="text-[7px] font-bold text-[#7B2CBF] uppercase tracking-widest">{Object.keys(selectedTrophies).length} Selecionados</span>
                   </div>
                   <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pt-1 pr-2">
                      {TROPHY_CATEGORIES.map(category => (
                        <div key={category.name} className="space-y-2">
                           <h5 className="text-[7px] font-black uppercase text-white/30 tracking-[0.3em] ml-2">{category.name}</h5>
                           <div className="grid grid-cols-5 gap-2 px-1">
                              {category.trophies.map(trophy => (
                                 <motion.button
                                    key={trophy.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleTrophy(trophy.name)}
                                    className={`relative h-12 rounded-xl flex items-center justify-center text-lg border transition-all ${
                                       selectedTrophies[trophy.name] 
                                       ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white shadow-lg shadow-[#7B2CBF33]' 
                                       : 'bg-black/40 border-[#2D2D2D] text-white/20 hover:border-[#7B2CBF44] hover:text-white/40'
                                    }`}
                                    title={trophy.name}
                                 >
                                    {trophy.icon}
                                    {selectedTrophies[trophy.name] > 1 && (
                                      <div className="absolute -top-1 -right-1 bg-white text-[#7B2CBF] text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-300">
                                         {selectedTrophies[trophy.name]}
                                      </div>
                                    )}
                                    {selectedTrophies[trophy.name] === 1 && (
                                      <div className="absolute -top-1 -right-1 bg-white/20 text-white text-[6px] font-black w-3 h-3 rounded-full flex items-center justify-center">
                                         1
                                      </div>
                                    )}
                                 </motion.button>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-[#A0A0A0] ml-2">Temporada Nº</label>
                      <input 
                        type="number"
                        min="1"
                        value={newLog.seasonNumber}
                        onChange={e => setNewLog({...newLog, seasonNumber: parseInt(e.target.value) || 1})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-xl px-4 py-2 text-[10px] text-[#7B2CBF] font-black"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-[#A0A0A0] ml-2">Melhor Jogador</label>
                      <input 
                        value={newLog.bestPlayer}
                        onChange={e => setNewLog({...newLog, bestPlayer: e.target.value})}
                        placeholder="Nome do Craque"
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-xl px-4 py-2 text-[10px] text-white"
                      />
                   </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-black uppercase text-[#A0A0A0] ml-2">Títulos (Outros)</label>
                       <input 
                         value={newLog.titles}
                         onChange={e => setNewLog({...newLog, titles: e.target.value})}
                         placeholder="Digitado..."
                         className="w-full bg-black/40 border border-[#2D2D2D] rounded-xl px-4 py-2 text-[10px] text-white"
                       />
                    </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[8px] font-black uppercase text-[#A0A0A0] ml-2">Tática Utilizada</label>
                   <input 
                     value={newLog.tactic}
                     onChange={e => setNewLog({...newLog, tactic: e.target.value})}
                     placeholder="Ex: 4-3-3 Tiki-Taka"
                     className="w-full bg-black/40 border border-[#2D2D2D] rounded-xl px-4 py-2 text-[10px] text-white italic"
                   />
                </div>

                <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                   <label className="text-[8px] font-black uppercase text-[#7B2CBF] tracking-[0.2em] block mb-1">Elenco da Temporada</label>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                         <label className="text-[7px] font-black uppercase text-[#666] ml-1">Goleiro</label>
                         <input 
                           value={newLog.squad.goalie}
                           onChange={e => setNewLog({...newLog, squad: {...newLog.squad, goalie: e.target.value}})}
                           className="w-full bg-black/40 border border-[#2D2D2D] rounded-lg px-3 py-1.5 text-[9px] text-white"
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[7px] font-black uppercase text-[#666] ml-1">Capitão</label>
                         <input 
                           value={newLog.squad.captain}
                           onChange={e => setNewLog({...newLog, squad: {...newLog.squad, captain: e.target.value}})}
                           className="w-full bg-black/40 border border-[#2D2D2D] rounded-lg px-3 py-1.5 text-[9px] text-white"
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[7px] font-black uppercase text-[#666] ml-1">Artilheiro</label>
                         <input 
                           value={newLog.squad.topScorer}
                           onChange={e => setNewLog({...newLog, squad: {...newLog.squad, topScorer: e.target.value}})}
                           className="w-full bg-black/40 border border-[#2D2D2D] rounded-lg px-3 py-1.5 text-[9px] text-white"
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[7px] font-black uppercase text-[#666] ml-1">Jovem Promessa</label>
                         <input 
                           value={newLog.squad.youngTalent}
                           onChange={e => setNewLog({...newLog, squad: {...newLog.squad, youngTalent: e.target.value}})}
                           className="w-full bg-black/40 border border-[#2D2D2D] rounded-lg px-3 py-1.5 text-[9px] text-white"
                         />
                      </div>
                      <div className="col-span-2 space-y-1">
                         <label className="text-[7px] font-black uppercase text-[#666] ml-1">Melhor do Time (Craque)</label>
                         <input 
                           value={newLog.squad.starPlayer}
                           onChange={e => setNewLog({...newLog, squad: {...newLog.squad, starPlayer: e.target.value}})}
                           className="w-full bg-[#7B2CBF]/10 border border-[#7B2CBF]/30 rounded-lg px-3 py-1.5 text-[9px] text-white font-bold italic"
                         />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="flex items-center gap-2 bg-black/40 border border-[#2D2D2D] rounded-xl px-4 py-2">
                      <BarChart3 size={12} className="text-green-500" />
                      <input 
                        type="number"
                        value={newLog.wins}
                        onChange={e => setNewLog({...newLog, wins: parseInt(e.target.value) || 0})}
                        className="bg-transparent w-full text-[10px] text-white border-none outline-none"
                      />
                   </div>
                   <div className="flex items-center gap-2 bg-black/40 border border-[#2D2D2D] rounded-xl px-4 py-2">
                      <BarChart3 size={12} className="text-red-500" />
                      <input 
                        type="number"
                        value={newLog.losses}
                        onChange={e => setNewLog({...newLog, losses: parseInt(e.target.value) || 0})}
                        className="bg-transparent w-full text-[10px] text-white border-none outline-none"
                      />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[8px] font-black uppercase text-[#A0A0A0] ml-2">Maior Invencibilidade (Jogos)</label>
                   <input 
                     type="number"
                     value={newLog.maxUnbeatenRun}
                     onChange={e => setNewLog({...newLog, maxUnbeatenRun: parseInt(e.target.value) || 0})}
                     placeholder="Ex: 15"
                     className="w-full bg-black/40 border border-[#2D2D2D] rounded-xl px-4 py-2 text-[10px] text-white"
                   />
                </div>

                <button onClick={handleAddLog} className="w-full bg-[#7B2CBF] py-4 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-[#7B2CBF33] active:scale-95 transition-all">
                  Registrar Temporada
                </button>
              </div>

              <div className="space-y-12 relative pt-4">
                <div className="absolute left-[-1.5px] top-4 bottom-4 w-[3px] bg-gradient-to-b from-[#7B2CBF] to-transparent rounded-full opacity-20"></div>
                
                {Object.entries(
                  (selectedSave.history || []).reduce((acc: any, log) => {
                    const season = log.season || 'Temporada Base';
                    if (!acc[season]) acc[season] = [];
                    acc[season].push(log);
                    return acc;
                  }, {})
                ).reverse().map(([season, logs]: [string, any], sIdx) => (
                  <div key={season} className="space-y-6">
                    <div className="flex items-center gap-2 relative z-10">
                       <div className="px-4 py-1 bg-[#7B2CBF] rounded-lg shadow-lg shadow-[#7B2CBF33]">
                          <span className="text-[10px] font-black text-white uppercase italic tracking-widest">{season}</span>
                       </div>
                       <div className="flex-1 h-[2px] bg-gradient-to-r from-[#7B2CBF33] to-transparent"></div>
                    </div>
                    
                    <div className="space-y-8 pl-4">
                      {logs.slice().reverse().map((log: any, idx: number) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={log.id} 
                          className="relative pl-8 group"
                        >
                          <div className="absolute left-[-21.5px] top-1.5 w-3 h-3 bg-[#7B2CBF] rounded-full border-2 border-[#1A1A1A] shadow-[0_0_8px_rgba(123,44,191,0.5)] group-hover:scale-125 transition-transform"></div>
                          <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-2">
                                {log.badge && (
                                  <span className="px-2 py-0.5 bg-[#7B2CBF]/20 text-[#7B2CBF] text-[7px] font-black uppercase rounded-lg border border-[#7B2CBF44] animate-pulse">{log.badge}</span>
                                )}
                                {sIdx === 0 && idx === 0 && !log.badge && (
                                  <span className="px-2 py-0.5 bg-[#7B2CBF]/20 text-[#7B2CBF] text-[7px] font-black uppercase rounded-lg border border-[#7B2CBF44]">🔥 Recente</span>
                                )}
                             </div>
                             <span className="text-[8px] text-[#A0A0A0] font-black uppercase">{new Date(log.date).toLocaleDateString()}</span>
                          </div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 border-l-2 border-l-[#7B2CBF44] space-y-3">
                            <p className="text-xs text-[#E0E0E0] font-medium leading-relaxed italic">"{log.content}"</p>
                            
                            {(log.bestPlayer || log.titles || log.wins || log.losses || log.tactic || log.squad) && (
                              <div className="space-y-3">
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {log.bestPlayer && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                                      <Star size={10} className="text-yellow-500" />
                                      <span className="text-[8px] font-black uppercase text-white">{log.bestPlayer}</span>
                                    </div>
                                  )}
                                  {log.titles && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                                      <Trophy size={10} className="text-[#7B2CBF]" />
                                      <span className="text-[8px] font-black uppercase text-white">{log.titles}</span>
                                    </div>
                                  )}
                                  {log.tactic && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                                      <Zap size={10} className="text-blue-400" />
                                      <span className="text-[8px] font-black uppercase text-white italic">{log.tactic}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <span className="text-[8px] font-black text-green-500">V: {log.wins || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded-lg border border-red-500/20">
                                    <span className="text-[8px] font-black text-red-500">D: {log.losses || 0}</span>
                                  </div>
                                </div>

                                {log.squad && (Object.values(log.squad).some(v => v)) && (
                                  <div className="grid grid-cols-2 gap-2 p-3 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden group">
                                     <div className="absolute top-0 right-0 p-2 opacity-5 text-white">
                                        <Users size={20} />
                                     </div>
                                     <div className="col-span-2 border-b border-white/5 pb-2 mb-1">
                                        <p className="text-[7px] font-black uppercase text-[#7B2CBF] tracking-widest">Elenco da Temporada</p>
                                     </div>
                                     <div className="space-y-0.5">
                                        <p className="text-[6px] font-black text-[#555] uppercase">Goleiro</p>
                                        <p className="text-[9px] font-bold text-white uppercase truncate">{log.squad.goalie || '-'}</p>
                                     </div>
                                     <div className="space-y-0.5">
                                        <p className="text-[6px] font-black text-[#555] uppercase">Capitão</p>
                                        <p className="text-[9px] font-bold text-white uppercase truncate">{log.squad.captain || '-'}</p>
                                     </div>
                                     <div className="space-y-0.5">
                                        <p className="text-[6px] font-black text-[#555] uppercase">Artilheiro</p>
                                        <p className="text-[9px] font-bold text-white uppercase truncate">{log.squad.topScorer || '-'}</p>
                                     </div>
                                     <div className="space-y-0.5">
                                        <p className="text-[6px] font-black text-[#555] uppercase">Jovem Promessa</p>
                                        <p className="text-[9px] font-bold text-white uppercase truncate">{log.squad.youngTalent || '-'}</p>
                                     </div>
                                     <div className="col-span-2 mt-1 pt-1 border-t border-white/5">
                                        <p className="text-[6px] font-black text-[#7B2CBF] uppercase">Melhor do Time (Craque)</p>
                                        <p className="text-[10px] font-black text-white uppercase italic tracking-tighter truncate">{log.squad.starPlayer || '-'}</p>
                                     </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {!selectedSave.history?.length && (
                  <div className="text-center py-12 space-y-4 border border-dashed border-[#2D2D2D] rounded-3xl">
                     <Calendar size={32} className="mx-auto text-[#A0A0A0] opacity-20" />
                     <p className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-widest">Nenhum evento registrado ainda.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Gallery Section */}
          <section className="space-y-4">
             <div className="flex items-center gap-3 px-3">
              <div className="w-1.5 h-4 bg-[#7B2CBF] rounded-full"></div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A0A0A0]">Galeria do Save</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {selectedSave.images?.map((img, i) => (
                 <div key={i} className="aspect-video bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] overflow-hidden group relative">
                    <img src={img} alt="Screenshot" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <button 
                      onClick={() => {
                        const updated = selectedSave.images.filter((_, idx) => idx !== i);
                        const updatedSaves = saves.map(s => s.id === selectedSave.id ? { ...s, images: updated, updatedAt: Date.now() } : s);
                        setSaves(updatedSaves);
                        storage.setSaves(updatedSaves);
                        setSelectedSave({ ...selectedSave, images: updated });
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                 </div>
               ))}
               
               {(selectedSave.images?.length || 0) < 3 && (
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="aspect-video bg-black/20 border-2 border-dashed border-[#2D2D2D] rounded-2xl flex flex-col items-center justify-center gap-2 text-[#A0A0A0] hover:border-[#7B2CBF44] hover:text-[#7B2CBF] transition-all group"
                 >
                    <Camera size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Adicionar Print</span>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </button>
               )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="space-y-4">
             {selectedSave.status === 'finished' ? (
                <div className="space-y-4">
                   <div className="bg-yellow-500/10 border border-yellow-500/30 p-8 rounded-[40px] text-center space-y-2">
                      <Trophy size={40} className="mx-auto text-yellow-500" />
                      <h4 className="text-lg font-black uppercase italic text-white tracking-tighter">CARREIRA IMORTALIZADA</h4>
                      <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Esta conta está encerrada no Hall da Fama</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: `Fox Managers - Carreira com ${selectedSave.team}`,
                              text: `🎮 MINHA CARREIRA NO FOX MANAGER!\n\nTime: ${selectedSave.team}\nTítulos: ${selectedSave.stats?.titles || 0}\n\nCrie sua jornada em: ${window.location.origin}`,
                              url: window.location.origin
                            }).catch(() => {
                               navigator.clipboard.writeText(`🎮 MINHA CARREIRA NO FOX MANAGER!\n\nTime: ${selectedSave.team}\nTítulos: ${selectedSave.stats?.titles || 0}\n\nCrie sua jornada em: ${window.location.origin}`);
                               alert('Resumo copiado para a área de transferência!');
                            });
                          } else {
                            alert("Compartilhamento não suportado neste navegador. Tire um print da sua glória!");
                          }
                        }}
                        className="bg-blue-600/20 border border-blue-600/30 py-4 rounded-2xl flex items-center justify-center gap-2 group hover:bg-blue-600/30 transition-all"
                      >
                         <Share2 size={16} className="text-blue-400" />
                         <span className="text-[10px] font-black uppercase text-white">Compartilhar</span>
                      </button>
                      <button 
                        onClick={() => exportToPDF(selectedSave)}
                        className="bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-2 group hover:bg-white/10 transition-all"
                      >
                         <Download size={16} className="text-white/40 group-hover:text-white" />
                         <span className="text-[10px] font-black uppercase text-[#A0A0A0] group-hover:text-white">Baixar Relatório</span>
                      </button>
                   </div>
                </div>
             ) : (
                <button 
                  onClick={handleEndSave}
                  className="w-full bg-[#7B2CBF] text-white py-5 rounded-[24px] font-black uppercase italic tracking-[0.2em] shadow-2xl shadow-[#7B2CBF44] flex items-center justify-center gap-3 active:scale-95 transition-all group overflow-hidden relative"
                >
                   <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                   <Trophy size={20} fill="white" /> ENCERRAR CARREIRA (HALL OF FAME)
                </button>
             )}
             
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => openEdit(selectedSave)} className="bg-white/5 border border-white/10 py-5 rounded-[24px] flex items-center justify-center gap-2 group hover:bg-white/10 transition-all active:scale-95">
                  <Edit3 size={18} className="text-[#A0A0A0] group-hover:text-[#7B2CBF]" />
                  <span className="text-[10px] font-black uppercase text-[#A0A0A0] group-hover:text-white">Editar Setup</span>
                </button>
                <button onClick={() => handleDelete(selectedSave.id)} className="bg-red-500/5 border border-red-500/20 py-5 rounded-[24px] flex items-center justify-center gap-2 group hover:bg-red-500/10 transition-all active:scale-95">
                  <Trash2 size={18} className="text-red-500/50 group-hover:text-red-500" />
                  <span className="text-[10px] font-black uppercase text-red-500/50 group-hover:text-red-500">Deletar Save</span>
                </button>
             </div>
          </div>
        </motion.div>
      )}

      {/* Save Creation/Edit Modal */}
      <AnimatePresence>
        {(isCreating || editingSave) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[110] flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0F0F0F] border border-[#2D2D2D] w-full max-w-md rounded-[40px] p-8 space-y-6 max-h-[90vh] overflow-y-auto scrollbar-hide"
            >
               <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase italic text-[#7B2CBF]">{editingSave ? 'Editar Save' : 'Novo Save'}</h3>
                    <p className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-widest">Configure sua próxima jornada</p>
                  </div>
                  <button onClick={() => { setIsCreating(false); resetForm(); }} className="p-3 bg-white/5 rounded-2xl text-[#A0A0A0] hover:text-white transition-all"><X size={24} /></button>
               </div>

               {showError && (
                 <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-500 animate-shake">
                   <AlertCircle size={20} />
                   <p className="text-xs font-black uppercase italic tracking-tighter">{showError}</p>
                 </div>
               )}

               <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">
                         Nome do Save {CHALLENGE_TEMPLATES[formData.category]?.requiredFields?.includes('name') && <span className="text-[#7B2CBF]">*</span>}
                       </label>
                       <input 
                         type="text" 
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         placeholder="Ex: Minha Carreira No AFC"
                         className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-6 py-4 text-sm focus:border-[#7B2CBF] outline-none text-white italic" 
                       />
                    </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Categoria do Desafio</label>
                    <div className="grid grid-cols-2 gap-2">
                       {CAREER_CATEGORIES.map(cat => (
                         <button
                           key={cat}
                           onClick={() => {
                             const template = CHALLENGE_TEMPLATES[cat];
                             setFormData({
                               ...formData, 
                               category: cat,
                               selectedDuration: template?.minSeasons || 3
                             });
                           }}
                           className={`p-3 rounded-xl border text-[9px] font-black uppercase tracking-tight transition-all ${
                             formData.category === cat 
                               ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white shadow-lg shadow-[#7B2CBF33]' 
                               : 'bg-black/40 border-[#2D2D2D] text-[#A0A0A0] hover:border-[#7B2CBF44]'
                           }`}
                         >
                           {cat}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-2 bg-[#7B2CBF]/5 p-5 rounded-[28px] border border-[#7B2CBF]/10">
                     <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black text-[#7B2CBF] uppercase italic tracking-widest ml-1">Prazo do Desafio</label>
                        <span className="text-[10px] font-black text-white">{formData.selectedDuration} Temporadas</span>
                     </div>
                     <input 
                       type="range"
                       min={CHALLENGE_TEMPLATES[formData.category]?.minSeasons || 1}
                       max={CHALLENGE_TEMPLATES[formData.category]?.maxSeasons || 15}
                       value={formData.selectedDuration}
                       onChange={e => setFormData({...formData, selectedDuration: parseInt(e.target.value)})}
                       className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[#7B2CBF]"
                     />
                     <div className="flex justify-between mt-1">
                        <span className="text-[8px] font-bold text-[#444] uppercase">Min: {CHALLENGE_TEMPLATES[formData.category]?.minSeasons}</span>
                        <span className="text-[8px] font-bold text-[#444] uppercase">Max: {CHALLENGE_TEMPLATES[formData.category]?.maxSeasons}</span>
                     </div>
                     {CHALLENGE_TEMPLATES[formData.category] && (
                       <div className="mt-4 pt-3 border-t border-[#7B2CBF]/10">
                          <p className="text-[8px] font-black text-[#7B2CBF] uppercase tracking-[0.2em] mb-2">Regras do Desafio:</p>
                          <ul className="grid grid-cols-2 gap-2">
                             {CHALLENGE_TEMPLATES[formData.category].rules.map((rule, i) => (
                               <li key={i} className="flex items-center gap-2 text-[10px] text-white/60">
                                  <div className="w-1 h-1 bg-[#7B2CBF] rounded-full"></div>
                                  {rule}
                               </li>
                             ))}
                          </ul>
                       </div>
                     )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Jogo</label>
                       <select 
                         value={formData.game}
                         onChange={e => setFormData({...formData, game: e.target.value})}
                         className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-5 py-4 text-xs focus:border-[#7B2CBF] outline-none text-white font-bold italic appearance-none"
                       >
                         {currentGames.map(g => <option key={g} value={g}>{g}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Dificuldade</label>
                       <select 
                         value={formData.difficulty}
                         onChange={e => setFormData({...formData, difficulty: e.target.value})}
                         className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-5 py-4 text-xs focus:border-[#7B2CBF] outline-none text-white font-bold italic appearance-none"
                       >
                         {currentDifficulties.map(d => <option key={d} value={d}>{d}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">
                         Time {CHALLENGE_TEMPLATES[formData.category]?.requiredFields?.includes('team') && <span className="text-[#7B2CBF]">*</span>}
                       </label>
                       <input 
                         type="text" 
                         value={formData.team}
                         onChange={e => setFormData({...formData, team: e.target.value})}
                         placeholder="Ex: AFC Richmond"
                         className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-6 py-3.5 text-xs text-white" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Personalidade</label>
                       <select 
                         value={formData.managerPersonality}
                         onChange={e => setFormData({...formData, managerPersonality: e.target.value})}
                         className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-5 py-4 text-xs focus:border-[#7B2CBF] outline-none text-white font-bold italic appearance-none"
                       >
                         {['Estrategista', 'Temperamental', 'Defensivo', 'Ofensivo', 'Gestor'].map(p => <option key={p} value={p}>{p}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">
                         Estádio {CHALLENGE_TEMPLATES[formData.category]?.requiredFields?.includes('stadiumName') && <span className="text-[#7B2CBF]">*</span>}
                       </label>
                       <input 
                         type="text" 
                         value={formData.stadiumName}
                         onChange={e => setFormData({...formData, stadiumName: e.target.value})}
                         placeholder="Ex: Nelson Knight"
                         className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-6 py-3.5 text-xs text-white" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">
                         Capacidade {CHALLENGE_TEMPLATES[formData.category]?.requiredFields?.includes('stadiumCapacity') && <span className="text-[#7B2CBF]">*</span>}
                       </label>
                       <input 
                         type="number" 
                         value={formData.stadiumCapacity}
                         onChange={e => setFormData({...formData, stadiumCapacity: parseInt(e.target.value) || 0})}
                         placeholder="Ex: 50000"
                         className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-6 py-3.5 text-xs text-white" 
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">País</label>
                       <input 
                         type="text" 
                         value={formData.country}
                         onChange={e => setFormData({...formData, country: e.target.value})}
                         placeholder="Ex: Brasil"
                         className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-6 py-3.5 text-xs text-white" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Liga</label>
                       <input 
                         type="text" 
                         value={formData.league}
                         onChange={e => setFormData({...formData, league: e.target.value})}
                         placeholder="Ex: Premier League"
                         className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-6 py-3.5 text-xs text-white" 
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">
                         Filosofia {CHALLENGE_TEMPLATES[formData.category]?.requiredFields?.includes('philosophy') && <span className="text-[#7B2CBF]">*</span>}
                       </label>
                       <select 
                         value={formData.philosophy}
                         onChange={e => setFormData({...formData, philosophy: e.target.value})}
                         className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-5 py-4 text-xs focus:border-[#7B2CBF] outline-none text-white font-bold italic appearance-none"
                       >
                         {PHILOSOPHIES.map(p => <option key={p} value={p}>{p}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">
                        Objetivo Principal {CHALLENGE_TEMPLATES[formData.category]?.requiredFields?.includes('objective') && <span className="text-[#7B2CBF]">*</span>}
                      </label>
                      <input 
                        type="text" 
                        value={formData.objective}
                        onChange={e => setFormData({...formData, objective: e.target.value})}
                        placeholder="Ex: Ganhar a Champions"
                        className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white" 
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#2D2D2D]">
                    <h4 className="text-[10px] font-black text-[#7B2CBF] uppercase tracking-widest ml-1">Estatísticas Atuais</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Títulos Totais</label>
                         <input 
                           type="number" 
                           value={formData.titles}
                           onChange={e => setFormData({...formData, titles: parseInt(e.target.value) || 0})}
                           className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-6 py-3 text-xs text-white" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Melhor Jogador</label>
                         <input 
                           type="text" 
                           value={formData.bestPlayer}
                           onChange={e => setFormData({...formData, bestPlayer: e.target.value})}
                           className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-6 py-3 text-xs text-white" 
                         />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest text-green-500">Vitórias</label>
                         <input 
                           type="number" 
                           value={formData.wins}
                           onChange={e => setFormData({...formData, wins: parseInt(e.target.value) || 0})}
                           className="w-full bg-[#1A1A1A] border border-green-500/20 rounded-2xl px-6 py-3 text-xs text-white" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest text-red-500">Derrotas</label>
                         <input 
                           type="number" 
                           value={formData.losses}
                           onChange={e => setFormData({...formData, losses: parseInt(e.target.value) || 0})}
                           className="w-full bg-[#1A1A1A] border border-red-500/20 rounded-2xl px-6 py-3 text-xs text-white" 
                         />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={editingSave ? handleUpdate : handleCreate}
                    className="w-full bg-[#7B2CBF] py-5 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#7B2CBF44] active:scale-95 transition-all text-white animate-fade-in"
                  >
                    {editingSave ? 'Salvar Setup' : 'INICIAR CARREIRA'}
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPlayerModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[120] flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#1A1A1A] border border-[#2D2D2D] w-full max-w-sm rounded-[40px] p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase italic text-[#7B2CBF]">Imortalizar Craque</h3>
                <button onClick={() => setShowPlayerModal(false)} className="text-[#A0A0A0] hover:text-white"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic tracking-widest ml-1">Nome do Jogador</label>
                  <input 
                    type="text"
                    value={newPlayer.name}
                    onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    placeholder="Ex: Erling Haaland"
                    className="w-full bg-black border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-[#7B2CBF] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic tracking-widest ml-1">Papel na Conquista</label>
                  <select 
                    value={newPlayer.role}
                    onChange={e => setNewPlayer({ ...newPlayer, role: e.target.value as any })}
                    className="w-full bg-black border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-[#7B2CBF] transition-all appearance-none"
                  >
                    <option value="artilheiro">⚽ Artilheiro</option>
                    <option value="garçom">👟 Garçom (Assistências)</option>
                    <option value="paredão">🧤 Paredão (Goleiro)</option>
                    <option value="líder">©️ Líder / Capitão</option>
                    <option value="promessa">👶 Jovem Promessa</option>
                    <option value="craque">💎 Craque do Time</option>
                  </select>
                </div>
                
                <button 
                  onClick={handleAddPlayer}
                  className="w-full bg-[#7B2CBF] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-[#7B2CBF33] active:scale-95 transition-all mt-4"
                >
                  Confirmar Craque
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEndReport && selectedSave && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/98 z-[150] flex items-center justify-center p-4 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0F0F0F] border-2 border-[#7B2CBF]/30 w-full max-w-lg rounded-[48px] overflow-hidden shadow-[0_0_50px_rgba(123,44,191,0.2)] flex flex-col max-h-[90vh]"
            >
               {/* Report Header */}
               <div className="bg-[#7B2CBF] p-8 text-center relative">
                  <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                     <Trophy size={200} />
                  </div>
                  <Trophy size={48} className="mx-auto text-white mb-4 animate-bounce" />
                  <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none">RELATÓRIO FINAL</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mt-2">Dossiê Técnico • Fox Manager System</p>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                  {/* Basic Info */}
                  <div className="flex justify-between items-end border-b border-white/10 pb-4">
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-[#7B2CBF] uppercase tracking-widest">Manager</p>
                        <h4 className="text-xl font-black text-white uppercase italic">{selectedSave.name}</h4>
                     </div>
                     <div className="text-right space-y-1">
                        <p className="text-[8px] font-black text-[#A0A0A0] uppercase tracking-widest">Filosofia</p>
                        <h4 className="text-lg font-black text-[#7B2CBF] uppercase italic">{selectedSave.philosophy}</h4>
                     </div>
                  </div>

                  {/* Club Badge & Stats */}
                  <div className="grid grid-cols-3 gap-4">
                     <div className="bg-white/5 border border-white/5 p-4 rounded-3xl text-center space-y-1 font-mono">
                        <span className="text-[7px] font-black text-[#555] uppercase tracking-widest">Títulos</span>
                        <p className="text-2xl font-black text-white">{selectedSave.stats?.titles || 0}</p>
                     </div>
                     <div className="bg-white/5 border border-white/5 p-4 rounded-3xl text-center space-y-1 font-mono">
                        <span className="text-[7px] font-black text-[#555] uppercase tracking-widest">Temporadas</span>
                        <p className="text-2xl font-black text-white">{selectedSave.stats?.seasonsPlayed || 0}</p>
                     </div>
                     <div className="bg-white/5 border border-white/5 p-4 rounded-3xl text-center space-y-1 font-mono">
                        <span className="text-[7px] font-black text-[#555] uppercase tracking-widest">Win Rate</span>
                        <p className="text-2xl font-black text-green-500">{selectedSave.stats?.winRate || 0}%</p>
                     </div>
                  </div>

                  {/* Legend Players */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Users size={14} className="text-[#7B2CBF]" />
                       <span className="text-[9px] font-black text-white uppercase tracking-widest">Lendas do Clube</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       {(selectedSave.importantPlayers || []).slice(0, 4).map(p => (
                         <div key={p.id} className="bg-black/20 border border-white/5 p-3 rounded-2xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#7B2CBF]/20 flex items-center justify-center text-[#7B2CBF]">
                               <Star size={14} fill="currentColor" />
                            </div>
                            <div className="overflow-hidden">
                               <p className="text-[10px] font-black text-white uppercase truncate">{p.name}</p>
                               <p className="text-[7px] font-bold text-[#A0A0A0] uppercase">{p.role}</p>
                            </div>
                         </div>
                       ))}
                       {(selectedSave.importantPlayers || []).length === 0 && (
                          <p className="col-span-2 text-[9px] text-[#444] font-bold uppercase italic text-center py-4">Nenhuma lenda registrada</p>
                       )}
                    </div>
                  </div>

                  {/* Career Highlights Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Zap size={14} className="text-yellow-500" />
                       <span className="text-[9px] font-black text-white uppercase tracking-widest">Destaques da Carreira</span>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-4">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase text-[#666]">
                          <span>Estádio</span>
                          <span className="text-white italic">{selectedSave.stadiumName || 'Arena Fox'} ({(selectedSave.stadiumCapacity || 0).toLocaleString()})</span>
                       </div>
                       <div className="flex justify-between items-center text-[9px] font-black uppercase text-[#666]">
                          <span>Persona do Manager</span>
                          <span className="text-white italic">{selectedSave.managerPersonality || 'Estrategista'}</span>
                       </div>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-[#1A1A1A] p-6 rounded-[32px] border border-[#2D2D2D] relative group">
                     <div className="absolute top-0 right-0 p-4 opacity-5 text-[#7B2CBF]">
                        <History size={40} />
                     </div>
                     <div className="flex items-center gap-2 mb-2">
                        <Edit3 size={12} className="text-[#7B2CBF]" />
                        <span className="text-[9px] font-black text-[#7B2CBF] uppercase tracking-widest">Resumo da Carreira</span>
                     </div>
                     <p className="text-[11px] text-white/80 font-medium italic leading-relaxed">
                        "{generateAutomaticHistory(selectedSave)}"
                     </p>
                  </div>

                  {/* Achievements List */}
                  <div className="space-y-4 pb-8">
                     <span className="text-[8px] font-black text-[#555] uppercase tracking-widest ml-1">Hall da Fama Especial</span>
                     <div className="flex flex-wrap gap-2">
                        <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2">
                           <Award size={12} className="text-yellow-500" />
                           <span className="text-[8px] font-black text-yellow-500 uppercase">Carreira Imortalizada</span>
                        </div>
                        <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2">
                           <BarChart3 size={12} className="text-blue-500" />
                           <span className="text-[8px] font-black text-blue-500 uppercase">{selectedSave.game} Elite</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Footer Actions */}
               <div className="p-8 bg-black/40 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="col-span-2 grid grid-cols-2 gap-4 mb-2">
                     <button 
                       onClick={() => {
                          const text = `🎮 MINHA CARREIRA NO FOX MANAGER!\n\nTime: ${selectedSave.team}\nTítulos: ${selectedSave.stats?.titles || 0}\nTemporadas: ${selectedSave.stats?.seasonsPlayed || 0}\n\n"${generateAutomaticHistory(selectedSave)}"\n\nCrie sua jornada em: ${window.location.origin} `;
                          if (navigator.share) {
                             navigator.share({
                               title: 'Minha Carreira Fox Manager',
                               text: text,
                               url: window.location.origin
                             }).catch(() => {
                                navigator.clipboard.writeText(text);
                                alert('Resumo copiado para a área de transferência!');
                             });
                          } else {
                             navigator.clipboard.writeText(text);
                             alert('Resumo copiado para a área de transferência!');
                          }
                       }}
                       className="bg-[#7B2CBF]/10 border border-[#7B2CBF]/30 text-[#7B2CBF] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                     >
                       <Share2 size={16} /> Compartilhar
                     </button>
                     <button 
                       onClick={() => exportToPDF(selectedSave)}
                       className="bg-white/5 border border-white/10 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                     >
                       <Smartphone size={16} /> Salvar PDF
                     </button>
                  </div>
                  <button 
                    onClick={() => setShowEndReport(false)}
                    className="col-span-2 bg-[#7B2CBF] text-white py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#7B2CBF33] active:scale-95 transition-all"
                  >
                    FINALIZAR RELATÓRIO
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
