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

export default function GeneratorView() {
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTIES[1]);
  const [selectedType, setSelectedType] = useState(CAREER_TYPES[0]);
  
  // Advanced Filters
  const [selectedCountry, setSelectedCountry] = useState('Qualquer');
  const [selectedTeamSize, setSelectedTeamSize] = useState('Qualquer');
  const [selectedGenType, setSelectedGenType] = useState('Qualquer');
  const [selectedPhilosophy, setSelectedPhilosophy] = useState('Qualquer');
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
      
      const games = settings.managedGames && settings.managedGames.length > 0 ? settings.managedGames : GAMES;
      const difficulties = settings.managedDifficulties && settings.managedDifficulties.length > 0 ? settings.managedDifficulties : DIFFICULTIES;
      
      setSelectedGame(games[0]);
      setSelectedDifficulty(difficulties[1] || difficulties[0]);
    };
    fetchSettings();
  }, []);

  const currentGames = appSettings?.managedGames && appSettings.managedGames.length > 0 ? appSettings.managedGames : GAMES;
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

  const handleGenerate = async () => {
    const user = storage.getCurrentUser();
    if (!user) return;

    if (generationsCount >= LIMITS.GENERATIONS_PER_DAY) {
      setBotMessage("Limite atingido! Volte amanhã.");
      return;
    }

    setIsGenerating(true);
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

    }, 1500);
  };

  const saveAsNewCareer = async () => {
    if (!result) return;
    const user = storage.getCurrentUser();
    if (!user) return;

    const newSave: Save = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      name: `Desafio: ${result.team}`,
      game: selectedGame,
      team: result.team,
      season: '2024/25',
      tactic: result.style,
      philosophy: result.philosophy,
      objective: result.objective,
      difficulty: selectedDifficulty,
      description: `Gerado pelo Fox Bot.\nRegra: ${result.rule}\nOrçamento: ${result.transferBudget}\nBase: ${result.youthFocus}`,
      images: [],
      history: [],
      goals: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addSave(newSave);
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
                    <label className="text-[10px] font-bold text-[#7B2CBF] uppercase tracking-widest flex items-center gap-1.5"><Globe size={10} /> País</label>
                    <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="w-full bg-[#0F0F0F] border border-[#2D2D2D] rounded-xl px-4 py-2 text-xs">
                      <option>Qualquer</option>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#7B2CBF] uppercase tracking-widest flex items-center gap-1.5"><BarChart3 size={10} /> Porte</label>
                    <select value={selectedTeamSize} onChange={e => setSelectedTeamSize(e.target.value)} className="w-full bg-[#0F0F0F] border border-[#2D2D2D] rounded-xl px-4 py-2 text-xs">
                      <option>Qualquer</option>
                      {TEAM_SIZES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#7B2CBF] uppercase tracking-widest flex items-center gap-1.5"><Target size={10} /> Modalidade</label>
                  <select value={selectedGenType} onChange={e => setSelectedGenType(e.target.value)} className="w-full bg-[#0F0F0F] border border-[#2D2D2D] rounded-xl px-4 py-2 text-xs">
                    <option>Qualquer</option>
                    {GEN_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
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
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">Dificuldade</label>
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
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">Nicho</label>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-[#1A1A1A] border-2 border-[#7B2CBF] rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12">
                <Zap size={140} />
              </div>
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#7B2CBF] uppercase tracking-widest bg-[#7B2CBF]/10 px-2 py-0.5 rounded">Clube Destino</span>
                  <p className="font-black text-2xl tracking-tight">{result.team}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">DNA Tático</span>
                  <p className="font-bold text-md text-white">{result.style}</p>
                </div>
              </div>

              {result.philosophy && (
                <div className="p-4 bg-gradient-to-r from-[#7B2CBF11] to-transparent rounded-2xl border-l-4 border-[#7B2CBF]">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown size={14} className="text-[#7B2CBF]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#7B2CBF]">Filosofia do Técnico</span>
                  </div>
                  <p className="text-sm font-bold text-white uppercase tracking-tighter">{result.philosophy}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#2D2D2D]">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#A0A0A0] uppercase">Orçamento</span>
                  <p className="text-xs font-bold text-[#7B2CBF]">{result.transferBudget}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#A0A0A0] uppercase">Foco Base</span>
                  <p className="text-xs font-bold text-[#7B2CBF]">{result.youthFocus}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#7B2CBF] uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={12} /> Missão Principal
                </span>
                <p className="text-sm bg-[#0F0F0F] p-4 rounded-2xl italic text-[#E0E0E0] border-l-2 border-[#7B2CBF]">
                  "{result.objective}"
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Protocolo de Restrição</span>
                <div className="flex items-start gap-3 text-xs bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="leading-relaxed opacity-90"><span className="font-bold text-red-500">REGRA:</span> {result.rule}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={saveAsNewCareer}
                  className="flex-1 bg-[#7B2CBF] hover:bg-[#9D4EDD] py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#7B2CBF33]"
                >
                  <SaveIcon size={16} /> Aceitar Desafio
                </button>
                <button 
                  onClick={() => {
                    const text = `Fox Managers Challenge: \n🏆 Time: ${result.team}\n🎯 Missão: ${result.objective}\n⚡ Estilo: ${result.style}\n🚫 Regra: ${result.rule}`;
                    navigator.clipboard.writeText(text);
                  }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors border border-white/10"
                >
                  <Clipboard size={18} />
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}


