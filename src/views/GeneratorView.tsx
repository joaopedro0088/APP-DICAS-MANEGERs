/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Zap, Bot, RefreshCw, ChevronDown, Check, Clipboard, History, Save as SaveIcon, Sparkles, Wand2, Filter, Globe, BarChart3, Target, AlertCircle, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../store';
import { GAMES, DIFFICULTIES, CAREER_TYPES, LIMITS, COUNTRIES, TEAM_SIZES, GEN_TYPES } from '../constants';
import { Save, GeneratorResult } from '../types';

import { sounds } from '../utils/sounds';

export default function GeneratorView() {
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTIES[1]);
  const [selectedType, setSelectedType] = useState(CAREER_TYPES[0]);
  
  // Advanced Filters
  const [selectedCountry, setSelectedCountry] = useState('Qualquer');
  const [selectedTeamSize, setSelectedTeamSize] = useState('Qualquer');
  const [selectedGenType, setSelectedGenType] = useState('Qualquer');
  const [selectedPhilosophy, setSelectedPhilosophy] = useState('Qualquer');
  const [managerName, setManagerName] = useState('');
  const [genMode, setGenMode] = useState<'Aleatório' | 'Oficial' | 'Especial'>('Aleatório');

  const [result, setResult] = useState<GeneratorResult | null>(null);
  const [history, setHistory] = useState<GeneratorResult[]>([]);
  
  const [appSettings, setAppSettings] = useState<any>(null);
  const [generationsCount, setGenerationsCount] = useState(0);
  const [botMessage, setBotMessage] = useState("Olá! Sou o Fox Bot. Use os filtros avançados para o desafio de elite!");

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await storage.getAppSettings();
      setAppSettings(settings);
      
      const legacyGames = ['Football Manager', 'EA Sports FC (FIFA)', 'World Soccer Champs', 'Soccer Manager 2025'];
      let games = settings.managedGames && settings.managedGames.length > 0 ? settings.managedGames : GAMES;
      
      // Auto-patch for UI if it's the old default list
      if (games.length === 4 && games.every(g => legacyGames.includes(g))) {
        games = GAMES;
      }

      const difficulties = settings.managedDifficulties && settings.managedDifficulties.length > 0 ? settings.managedDifficulties : DIFFICULTIES;
      
      setSelectedGame(games[0]);
      setSelectedDifficulty(difficulties[1] || difficulties[0]);
    };
    fetchSettings();
  }, []);

  const legacyGames = ['Football Manager', 'EA Sports FC (FIFA)', 'World Soccer Champs', 'Soccer Manager 2025'];
  let currentGames = appSettings?.managedGames && appSettings.managedGames.length > 0 ? appSettings.managedGames : GAMES;
  
  if (currentGames.length === 4 && currentGames.every((g: string) => legacyGames.includes(g))) {
    currentGames = GAMES;
  }

  const currentDifficulties = appSettings?.managedDifficulties && appSettings.managedDifficulties.length > 0 ? appSettings.managedDifficulties : DIFFICULTIES;
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const user = storage.getCurrentUser();
      if (user) {
        const stats = storage.getUserStats(user.id);
        const today = new Date().toISOString().split('T')[0];
        if (stats.lastGenerationDate === today) {
          setGenerationsCount(stats.generationsToday);
        }
      }
    };
    fetchStats();
  }, []);

  const buds = ['Baixo (Austero)', 'Médio (Sustentável)', 'Alto (Rico)', 'Ilimitado (Sugar Daddy)'];
  const youthFocs = ['Prioridade Total', 'Equilibrado', 'Foco em Vendas', 'Negligenciado'];
  const philosophies = ['Ofensivo', 'Defensivo', 'Base', 'Contra-ataque', 'Posse de bola'];
  const durations = ['Curta (1-2 Temp.)', 'Média (3-5 Temp.)', 'Longa (6-10 Temp.)', 'Extrema (Legado)'];
  const extraTags = ['💸 Sem dinheiro', '👶 Jovens', '🛡 Defensivo', '🔥 Hardcore', '⚽ Base forte', '💎 Prospecção', '🧱 Muralha', '🏹 Contra-ataque', '📉 Crise', '🏆 Ambicioso'];
  const rewardBadges = ['Mestre Financeiro', 'Rei do Rebuild', 'Lenda Fox', 'Mestre da Base', 'Coração de Ferro', 'Gênio Tático', 'Explorador de Talentos'];
  const clubHistories = [
    "O clube vive crise financeira e precisa voltar à elite.",
    "Clube tradicional tentando reconstruir sua história de glórias.",
    "Uma equipe modesta com o sonho de bater de frente com os gigantes.",
    "Após anos de ostracismo, a torcida exige títulos imediatos.",
    "Com uma base promissora, o futuro depende de uma gestão tática impecável.",
    "O elenco está envelhecido e uma renovação completa é urgente.",
    "Um gigante adormecido que esqueceu como é levantar um troféu.",
    "Localizado em uma região apaixonada, o clube é o coração da cidade."
  ];

  const handleGenerate = async () => {
    const user = storage.getCurrentUser();
    if (!user) return;

    if (generationsCount >= LIMITS.GENERATIONS_PER_DAY) {
      setBotMessage("Limite atingido! Volte amanhã.");
      return;
    }

    setIsGenerating(true);
    sounds.generate();
    if (genMode === 'Oficial' || genMode === 'Especial') {
      const type = genMode === 'Oficial' ? 'Official' : 'Special';
      const careers = (await storage.getImportedCareers()).filter(c => c.type === type && c.game === selectedGame);
      
      if (careers.length > 0) {
        const c = careers[Math.floor(Math.random() * careers.length)];
        const newResult: GeneratorResult = {
          team: c.team,
          objective: c.objective,
          rule: c.rules.split(',')[0] || c.rules,
          style: c.style,
          philosophy: selectedPhilosophy === 'Qualquer' ? (c.philosophy || philosophies[Math.floor(Math.random() * philosophies.length)]) : selectedPhilosophy,
          youthFocus: 'Nivel Alto',
          difficulty: c.difficulty,
          type: 'Curadoria',
          game: c.game,
          country: c.country,
          league: c.league,
          miniHistory: clubHistories[Math.floor(Math.random() * clubHistories.length)],
          duration: durations[Math.floor(Math.random() * durations.length)],
          tags: Array.from({ length: 3 }, () => extraTags[Math.floor(Math.random() * extraTags.length)]),
          rewardBadge: rewardBadges[Math.floor(Math.random() * rewardBadges.length)],
          timestamp: Date.now(),
        };
        setResult(newResult);
        setHistory(prev => [newResult, ...prev].slice(0, 10));
        setGenerationsCount(prev => prev + 1);
        storage.updateUserStats(user.id, {
          generationsToday: generationsCount + 1,
          lastGenerationDate: new Date().toISOString().split('T')[0],
        });
        setBotMessage(`Mística pura! Carreira ${genMode} selecionada: ${c.name}. Boa sorte Manager!`);
        setIsGenerating(false);
        return;
      } else {
        setBotMessage(`Fox Bot não encontrou carreiras ${genMode} para este jogo. Gerando aleatória...`);
      }
    }

    setBotMessage("Cruzando dados de ligas licenciadas e mods...");

    setTimeout(async () => {
      const lists = await storage.getGenLists();
      const list = lists.find(l => l.game === selectedGame) || lists[0];
      
      if (!list || !list.teams) {
        setBotMessage("O banco de dados de times ainda está vazio para este jogo. Peça ao ADM para importar os dados.");
        setIsGenerating(false);
        return;
      }
      
      // Filter logic
      let filteredTeams = list.teams.map(t => {
        const [name, country, size, type] = t.split('|');
        return { name, country: country || 'Desconhecido', size: size || 'Médio', type: type || 'Normal' };
      });

      if (selectedCountry !== 'Qualquer') {
        filteredTeams = filteredTeams.filter(t => t.country === selectedCountry);
      }
      if (selectedTeamSize !== 'Qualquer') {
        filteredTeams = filteredTeams.filter(t => t.size === selectedTeamSize);
      }
      if (selectedGenType !== 'Qualquer') {
        filteredTeams = filteredTeams.filter(t => t.type === selectedGenType);
      }

      // Fallback if filters are too strict
      if (filteredTeams.length === 0) {
        filteredTeams = list.teams.map(t => {
          const [name] = t.split('|');
          return { name, country: 'Fallback', size: 'Médio', type: 'Normal' };
        });
        setBotMessage("Nenhum time exato com esses filtros. Fox Bot sugere este alternativo!");
      }

      const teamObj = filteredTeams[Math.floor(Math.random() * filteredTeams.length)];
      
      const newResult: GeneratorResult = {
        team: teamObj.name,
        objective: list.objectives[Math.floor(Math.random() * list.objectives.length)],
        rule: list.rules[Math.floor(Math.random() * list.rules.length)],
        style: list.styles[Math.floor(Math.random() * list.styles.length)],
        philosophy: selectedPhilosophy === 'Qualquer' ? philosophies[Math.floor(Math.random() * philosophies.length)] : selectedPhilosophy,
        transferBudget: buds[Math.floor(Math.random() * buds.length)],
        youthFocus: youthFocs[Math.floor(Math.random() * youthFocs.length)],
        difficulty: selectedDifficulty,
        country: teamObj.country,
        league: teamObj.size === 'Grande' ? 'Elite Division' : 'Lower Divisions',
        miniHistory: clubHistories[Math.floor(Math.random() * clubHistories.length)],
        duration: durations[Math.floor(Math.random() * durations.length)],
        tags: Array.from({ length: 3 }, () => extraTags[Math.floor(Math.random() * extraTags.length)]),
        rewardBadge: rewardBadges[Math.floor(Math.random() * rewardBadges.length)],
        timestamp: Date.now(),
      };

      setResult(newResult);
      setHistory(prev => [newResult, ...prev].slice(0, 5));
      setIsGenerating(false);
      
      const newCount = generationsCount + 1;
      setGenerationsCount(newCount);
      storage.updateUserStats(user.id, {
        generationsToday: newCount,
        lastGenerationDate: new Date().toISOString().split('T')[0],
      });

    }, 400);
  };

  const saveAsNewCareer = async () => {
    if (!result) return;
    const user = storage.getCurrentUser();
    if (!user) return;

    const newSave: Save = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      managerName: managerName || user.name,
      name: `Desafio: ${result.team}`,
      game: selectedGame,
      team: result.team,
      category: result.type || 'Aleatório',
      selectedDuration: result.duration ? (result.duration.includes('1-2') ? 2 : result.duration.includes('3-5') ? 5 : result.duration.includes('6-10') ? 10 : 15) : 5,
      country: result.country,
      league: result.league,
      season: 'Temporada 1 (2024/25)',
      tactic: result.style,
      philosophy: result.philosophy,
      objective: result.objective,
      miniHistory: result.miniHistory,
      difficulty: selectedDifficulty,
      rewardBadge: result.rewardBadge,
      tags: result.tags,
      description: `Gerado pelo Fox Bot.\nRegra: ${result.rule}\nOrçamento: ${result.transferBudget}\nBase: ${result.youthFocus}`,
      images: [],
      history: [],
      goals: [
        { id: '1', text: 'Estabelecer filosofia tática', completed: false },
        { id: '2', text: 'Analisar elenco principal', completed: false },
        { id: '3', text: result.objective, completed: false }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stats: {
        seasonsPlayed: 0,
        titles: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        bestPlayer: 'N/A',
        progress: 0,
        winRate: 0
      },
      status: 'active',
      theme: 'default',
      clubHistory: []
    };

    await storage.addSave(newSave);
    sounds.save();
    setBotMessage("Desafio aceito! Visualize em Meus Saves.");
    alert("Desafio aceito! Verifique sua nova jornada na aba 'Saves'.");
  };

  return (
    <div className="space-y-6">
      {/* Bot Chat */}
      <section className="bg-[#1A1A1A] border border-[#7B2CBF44] rounded-2xl p-4 flex gap-4 items-start shadow-inner">
        <div className="w-10 h-10 bg-[#7B2CBF] rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-[#7B2CBF44]">
          <Bot size={24} color="white" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] font-bold text-[#7B2CBF] uppercase tracking-wider">Fox Bot Intelligence</span>
            {history.length > 0 && (
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="text-[10px] text-[#A0A0A0] hover:text-white flex items-center gap-1"
              >
                <History size={12} /> {showHistory ? 'Fechar' : 'Histórico'}
              </button>
            )}
          </div>
          <p className="text-sm text-white leading-relaxed">{botMessage}</p>
        </div>
      </section>

      {/* History Dropdown */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-2"
          >
            {history.map((h, i) => (
              <div key={i} onClick={() => { setResult(h); setShowHistory(false); }} className="bg-[#1A1A1A] p-3 rounded-xl border border-[#2D2D2D] flex justify-between items-center cursor-pointer hover:border-[#7B2CBF44]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#7B2CBF] rounded-full"></div>
                  <span className="text-xs font-bold">{h.team}</span>
                </div>
                <span className="text-[9px] text-[#A0A0A0]">{new Date(h.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generator Form */}
      <section className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wand2 size={16} className="text-[#7B2CBF]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#A0A0A0]">Configurações Base</h3>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border transition-all ${showFilters ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white' : 'bg-transparent border-[#2D2D2D] text-[#A0A0A0]'}`}
            >
              <Filter size={12} /> {showFilters ? 'Ocultar Filtros' : 'Filtros Pro'}
            </button>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">Modo de Geração</label>
            <div className="flex gap-2">
              {(['Aleatório', 'Oficial', 'Especial'] as const).map(mode => (
                <button 
                  key={mode}
                  onClick={() => setGenMode(mode)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all border ${genMode === mode ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white shadow-lg shadow-[#7B2CBF33]' : 'bg-[#0F0F0F] border-[#2D2D2D] text-[#A0A0A0]'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">Interface do Jogo</label>
                <div className="relative">
                  <select 
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2D2D2D] rounded-xl px-4 py-3 text-sm appearance-none focus:border-[#7B2CBF] outline-none transition-all"
                  >
                    {currentGames.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0]" size={16} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">Seu Nome (Treinador)</label>
                <input 
                  type="text"
                  value={managerName}
                  onChange={e => setManagerName(e.target.value)}
                  placeholder="Ex: Sir Alex Fox"
                  className="w-full bg-[#0F0F0F] border border-[#2D2D2D] rounded-xl px-4 py-3 text-sm focus:border-[#7B2CBF] outline-none transition-all text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">País de Interesse</label>
                <div className="relative">
                  <select 
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2D2D2D] rounded-xl px-4 py-3 text-sm appearance-none focus:border-[#7B2CBF] outline-none transition-all"
                  >
                    <option>Qualquer</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0]" size={16} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">Dificuldade Básica</label>
                <div className="relative">
                  <select 
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2D2D2D] rounded-xl px-4 py-3 text-sm appearance-none focus:border-[#7B2CBF] outline-none"
                  >
                    {currentDifficulties.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0]" size={16} />
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden pt-2"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#7B2CBF] uppercase tracking-widest flex items-center gap-1.5"><BarChart3 size={10} /> Porte do Time</label>
                    <select value={selectedTeamSize} onChange={e => setSelectedTeamSize(e.target.value)} className="w-full bg-[#0F0F0F] border border-[#2D2D2D] rounded-xl px-4 py-2 text-xs">
                      <option>Qualquer</option>
                      {TEAM_SIZES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#7B2CBF] uppercase tracking-widest flex items-center gap-1.5"><Target size={10} /> Modalidade</label>
                    <select value={selectedGenType} onChange={e => setSelectedGenType(e.target.value)} className="w-full bg-[#0F0F0F] border border-[#2D2D2D] rounded-xl px-4 py-2 text-xs">
                      <option>Qualquer</option>
                      {GEN_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#7B2CBF] uppercase tracking-widest flex items-center gap-1.5"><Zap size={10} /> Filosofia</label>
                  <select value={selectedPhilosophy} onChange={e => setSelectedPhilosophy(e.target.value)} className="w-full bg-[#0F0F0F] border border-[#2D2D2D] rounded-xl px-4 py-2 text-xs">
                    <option>Qualquer</option>
                    {philosophies.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            {/* Remover Dificuldade daqui pois já está em cima ou redundante */}
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">Nicho do Desafio</label>
              <div className="relative">
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-[#2D2D2D] rounded-xl px-4 py-3 text-sm appearance-none focus:border-[#7B2CBF] outline-none"
                >
                  {CAREER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0]" size={16} />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-[#7B2CBF] hover:bg-[#9D4EDD] disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-xl font-black text-sm uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#7B2CBF44]"
        >
          {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
          {isGenerating ? 'Processando Database...' : 'Gerar Nova Carreira'}
        </button>

        <div className="flex justify-between items-center text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Local Sync</div>
          <span>Capacidade: {generationsCount}/{LIMITS.GENERATIONS_PER_DAY}</span>
        </div>
      </section>

      {/* Enhanced Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.section 
            key={result.timestamp}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="space-y-4"
          >
            <div className="bg-[#1A1A1A] border-2 border-[#7B2CBF] rounded-[40px] p-8 space-y-6 relative overflow-hidden shadow-[0_20px_50px_rgba(123,44,191,0.25)] group">
              
              {/* Dynamic Background Elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] grayscale group-hover:grayscale-0 group-hover:opacity-[0.08] transition-all duration-700 rotate-12 scale-150 transform">
                  <Zap size={200} />
                </div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#7B2CBF]/10 rounded-full blur-[80px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none">
                  {/* Tactical Line Pattern simulation */}
                  <svg width="100%" height="100%" className="text-white">
                    <pattern id="tactical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                       <circle cx="2" cy="2" r="1" fill="currentColor" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#tactical-grid)" />
                  </svg>
                </div>
              </div>

              {/* Top Row: Difficulty & Game */}
              <div className="flex justify-between items-center relative z-10">
                 <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 border ${
                   (result.difficulty || '').toLowerCase().includes('fácil') ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                   (result.difficulty || '').toLowerCase().includes('médio') ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                   (result.difficulty || '').toLowerCase().includes('difícil') ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                   'bg-[#7B2CBF]/20 text-[#9D4EDD] border-[#7B2CBF]/30 animate-pulse'
                 }`}>
                   <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                   {result.difficulty || 'ESPECIAL'} 
                   {result.difficulty?.toLowerCase().includes('extremo') && ' 🔥'}
                 </div>
                 <div className="text-[9px] font-black uppercase text-[#7B2CBF] tracking-widest flex items-center gap-1.5">
                    <Globe size={10} /> {selectedGame}
                 </div>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="space-y-1 text-center md:text-left">
                  <span className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                     <Crown size={12} className="text-[#7B2CBF]" /> Clube Destino
                  </span>
                  <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 justify-center md:justify-start">
                    <h1 className="font-black text-4xl md:text-5xl tracking-tighter text-white drop-shadow-sm leading-none">
                      {result.team}
                    </h1>
                    {(result.country || result.league) && (
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">
                        <span className="text-lg">{(result.country === 'Brasil' ? '🇧🇷' : result.country === 'Portugal' ? '🇵🇹' : result.country === 'Espanha' ? '🇪🇸' : result.country === 'Inglaterra' ? '🏴󠁧󠁢󠁥󠁮󠁧󠁿' : '🌍')}</span>
                        {result.country} • {result.league}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Tags Section */}
                {result.tags && (
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-fade-right">
                    {result.tags.map((tag, i) => (
                      <span key={i} className="shrink-0 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-[#E0E0E0] shadow-md hover:bg-[#7B2CBF]/20 hover:border-[#7B2CBF]/40 transition-colors">
                        {tag}
                      </span>
                    ))}
                    {result.transferBudget?.includes('Baixo') && (
                      <span className="shrink-0 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-red-400">
                        📉 Crise Financeira
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Club History Blur */}
              {result.miniHistory && (
                <div className="relative z-10 py-1">
                  <p className="text-[11px] md:text-sm text-[#A0A0A0] font-medium leading-relaxed max-w-2xl italic tracking-tight opacity-80 border-l-2 border-[#7B2CBF]/30 pl-4">
                    "{result.miniHistory}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 pt-4 border-t border-[#2D2D2D]">
                
                {/* Visual DNA Badge */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-[#7B2CBF] uppercase tracking-widest flex items-center gap-2">
                     <Target size={12} /> ADN Tático Gamer
                  </span>
                  <div className="bg-gradient-to-br from-[#7B2CBF22] to-transparent p-4 rounded-3xl border border-[#7B2CBF33] flex items-center gap-4 group/dna transition-all hover:scale-[1.02]">
                     <div className="w-10 h-10 bg-[#7B2CBF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7B2CBF44] text-white">
                        <Zap size={20} className="group-hover/dna:scale-110 transition-transform" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-white uppercase tracking-tighter leading-none">{result.style}</p>
                        <p className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mt-1">Estratégia Recomendada</p>
                     </div>
                  </div>
                </div>

                {/* Duration & Reward */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest flex items-center gap-2">
                       <History size={12} /> Duração Estimada
                    </span>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                       <p className="text-[10px] font-black text-white uppercase tracking-tighter">{result.duration || '3-5 temporadas'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest flex items-center gap-2 text-yellow-500">
                       <Crown size={12} /> Recompensa
                    </span>
                    <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-center">
                       <p className="text-[10px] font-black text-yellow-600 uppercase tracking-tighter truncate">{result.rewardBadge || 'Mestre Fox'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Philosophy Section */}
              {result.philosophy && (
                <div className="relative z-10 p-5 bg-gradient-to-r from-[#7B2CBF11] to-transparent rounded-3xl border-l-4 border-[#7B2CBF] flex items-center justify-between group/phil hover:bg-[#7B2CBF15] transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={14} className="text-[#7B2CBF]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#7B2CBF]">Filosofia do Técnico</span>
                    </div>
                    <p className="text-lg font-black text-white uppercase tracking-tighter italic">{result.philosophy}</p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center text-[#7B2CBF] opacity-20 group-hover/phil:opacity-40 transition-opacity">
                    <Bot size={32} />
                  </div>
                </div>
              )}

              <div className="space-y-4 relative z-10 pt-4 border-t border-[#2D2D2D]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#7B2CBF] uppercase tracking-widest flex items-center gap-2">
                    <Target size={12} /> Missão Principal
                  </span>
                  <div className="flex gap-4">
                    <div className="text-right">
                       <p className="text-[8px] font-black text-[#A0A0A0] uppercase tracking-widest">Orçamento</p>
                       <p className="text-[10px] font-black text-white uppercase">{result.transferBudget}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-black text-[#A0A0A0] uppercase tracking-widest">Base</p>
                       <p className="text-[10px] font-black text-white uppercase">{result.youthFocus}</p>
                    </div>
                  </div>
                </div>
                <div className="relative group/objective">
                   <div className="absolute -inset-1 bg-gradient-to-r from-[#7B2CBF55] to-transparent rounded-3xl blur opacity-0 group-hover/objective:opacity-100 transition duration-500"></div>
                   <p className="relative text-sm md:text-md bg-[#0F0F0F] p-5 rounded-3xl italic text-[#E0E0E0] border-l-4 border-[#7B2CBF] leading-relaxed shadow-lg">
                     "{result.objective}"
                   </p>
                </div>
              </div>

              {/* Protocol Restriction */}
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest flex items-center gap-2">
                   <AlertCircle size={12} className="text-red-500" /> Protocolo de Restrição
                </span>
                <div className="flex items-start gap-4 text-[11px] bg-red-500/5 p-4 rounded-3xl border border-red-500/10 group/restriction hover:bg-red-500/10 transition-colors duration-300">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <AlertCircle size={16} className="text-red-500 group-hover/restriction:animate-bounce" />
                  </div>
                  <p className="leading-relaxed text-[#E0E0E0] font-medium py-1">
                    <span className="font-black text-red-500 uppercase tracking-widest">REGRA DE OURO:</span> {result.rule}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 relative z-10">
                <button 
                  onClick={saveAsNewCareer}
                  className="flex-[2] bg-[#7B2CBF] hover:bg-[#9D4EDD] py-5 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(123,44,191,0.4)] active:scale-95 group/save"
                >
                  <SaveIcon size={18} className="group-hover/save:rotate-12 transition-transform" /> 
                  Aceitar Desafio
                </button>
                <button 
                  onClick={() => {
                    const text = `Fox Managers Challenge: \n🏆 Time: ${result.team}\n🎯 Missão: ${result.objective}\n⚡ Estilo: ${result.style}\n🚫 Regra: ${result.rule}`;
                    navigator.clipboard.writeText(text);
                    sounds.success();
                    alert('Desafio copiado!');
                  }}
                  className="flex-1 p-5 bg-white/5 hover:bg-white/10 rounded-[24px] text-white transition-all border border-white/10 flex items-center justify-center gap-2 group/copy"
                >
                  <Clipboard size={18} className="group-hover/copy:scale-110 transition-transform" />
                  <span className="sm:hidden text-[10px] font-black uppercase">Copiar</span>
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}


