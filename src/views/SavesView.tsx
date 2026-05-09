/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Save as SaveIcon, Trash2, Edit3, X, Image as ImageIcon, 
  ChevronRight, AlertCircle, Calendar, Check, Play, 
  Target, BarChart3, Trophy, Users, Star, Flame, Camera, Crown, Dna,
  TrendingUp, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../store';
import { Save, SaveGoal } from '../types';
import { GAMES, DIFFICULTIES, LIMITS } from '../constants';

export default function SavesView() {
  const [saves, setSaves] = useState<Save[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSave, setEditingSave] = useState<Save | null>(null);
  const [showError, setShowError] = useState<string | null>(null);
  const [selectedSave, setSelectedSave] = useState<Save | null>(null);
  const [newLog, setNewLog] = useState({
    text: '',
    titles: '',
    bestPlayer: '',
    wins: 0,
    losses: 0
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    game: GAMES[0],
    team: '',
    season: '2024/25',
    tactic: '4-3-3',
    philosophy: 'Equilibrado',
    objective: '',
    difficulty: DIFFICULTIES[1],
    description: '',
    titles: 0,
    wins: 0,
    losses: 0,
    bestPlayer: ''
  });

  const [appSettings, setAppSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSaves = async () => {
      const user = storage.getCurrentUser();
      const settings = await storage.getAppSettings();
      setAppSettings(settings);
      if (user) {
        setSaves(await storage.getSaves(user.id));
      }
    };
    fetchSaves();
  }, []);

  const currentGames = appSettings?.managedGames && appSettings.managedGames.length > 0 ? appSettings.managedGames : GAMES;
  const currentDifficulties = appSettings?.managedDifficulties && appSettings.managedDifficulties.length > 0 ? appSettings.managedDifficulties : DIFFICULTIES;

  const resetForm = () => {
    setFormData({
      name: '',
      game: currentGames[0],
      team: '',
      season: '2024/25',
      tactic: '4-3-3',
      objective: '',
      difficulty: currentDifficulties[1] || currentDifficulties[0],
      description: '',
      titles: 0,
      wins: 0,
      losses: 0,
      bestPlayer: ''
    });
    setEditingSave(null);
    setShowError(null);
    setImagePreview(null);
  };

  const handleCreate = async () => {
    const user = storage.getCurrentUser();
    if (!user) return;

    const stats = storage.getUserStats(user.id);
    const today = new Date().toISOString().split('T')[0];

    // Limits check
    if (saves.length >= LIMITS.MAX_SAVES) {
      setShowError(`Máximo de ${LIMITS.MAX_SAVES} saves atingido.`);
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
    
    storage.updateUserStats(user.id, {
      savesCreatedThisMonth: stats.savesCreatedThisMonth + 1,
      lastSaveDate: today,
    });

    setIsCreating(false);
    resetForm();
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
      season: save.season,
      tactic: save.tactic,
      philosophy: save.philosophy || 'Ofensivo',
      objective: save.objective,
      difficulty: save.difficulty,
      description: save.description,
      titles: save.stats?.titles || 0,
      wins: save.stats?.wins || 0,
      losses: save.stats?.losses || 0,
      bestPlayer: save.stats?.bestPlayer || ''
    });
  };

  const handleAddLog = async () => {
    if (!selectedSave || !newLog.text) return;
    const newLogItem = {
      id: Math.random().toString(36).substr(2, 9),
      season: selectedSave.season,
      content: newLog.text,
      titles: newLog.titles,
      bestPlayer: newLog.bestPlayer,
      wins: newLog.wins,
      losses: newLog.losses,
      date: Date.now()
    };
    const updatedSave = { ...selectedSave, history: [...(selectedSave.history || []), newLogItem], updatedAt: Date.now() };
    await storage.updateSave(updatedSave);
    setSaves(saves.map(s => s.id === selectedSave.id ? updatedSave : s));
    setSelectedSave(updatedSave);
    setNewLog({ text: '', titles: '', bestPlayer: '', wins: 0, losses: 0 });
  };

  const toggleGoal = async (goalId: string) => {
    if (!selectedSave) return;
    const updatedGoals = selectedSave.goals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g);
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
      case 'Hard': case 'Difícil': return { label: '🔴 HARD', color: 'text-red-500', bg: 'bg-red-500/10', glow: 'shadow-red-500/20' };
      case 'Extreme': case 'Extremo': return { label: '🟣 HARDCORE 🔥', color: 'text-purple-500', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/20' };
      default: return { label: '🟡 MÉDIO', color: 'text-yellow-500', bg: 'bg-yellow-500/10', glow: 'shadow-yellow-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
          {selectedSave ? 'Diário de Carreira' : 'Meus Saves'}
        </h2>
        {!selectedSave && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-[#7B2CBF] p-3 rounded-2xl text-white shadow-xl shadow-[#7B2CBF33] active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        )}
        {selectedSave && (
          <button onClick={() => setSelectedSave(null)} className="p-3 bg-white/5 rounded-2xl text-[#A0A0A0] hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {!selectedSave ? (
        <>
          {/* Stats Header */}
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
            <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-3xl min-w-[140px] space-y-1 relative overflow-hidden">
              <span className="text-[10px] text-[#A0A0A0] uppercase font-black tracking-widest block">Armazenamento</span>
              <p className="font-black text-2xl text-white">{saves.length}/20</p>
              <div className="absolute right-[-10px] bottom-[-10px] opacity-5">
                <SaveIcon size={60} />
              </div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-3xl min-w-[140px] space-y-1 relative overflow-hidden">
              <span className="text-[10px] text-[#7B2CBF] uppercase font-black tracking-widest block">Limite Mensal</span>
              <p className="font-black text-2xl text-white">3 Saves</p>
              <div className="absolute right-[-10px] bottom-[-10px] opacity-5 text-[#7B2CBF]">
                <Flame size={60} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-2">
            {saves.length === 0 ? (
              <div className="text-center py-24 bg-[#1A1A1A]/50 rounded-[40px] border-2 border-dashed border-[#2D2D2D]">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SaveIcon size={40} className="opacity-20" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-[#A0A0A0]">Nenhum save encontrado.</p>
                <button onClick={() => setIsCreating(true)} className="mt-6 text-[#7B2CBF] font-black uppercase text-xs">Começar sua jornada</button>
              </div>
            ) : (
              saves.map(save => (
                <motion.div 
                  key={save.id}
                  layout
                  onClick={() => setSelectedSave(save)}
                  className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[32px] p-6 flex justify-between items-center group hover:border-[#7B2CBF44] transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="space-y-4 relative z-10 w-full">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-black text-lg uppercase italic text-white group-hover:text-[#7B2CBF] transition-colors">{save.name}</h3>
                          <div className="px-2 py-1 bg-[#7B2CBF]/10 border border-[#7B2CBF22] rounded-lg">
                            <span className="text-[8px] font-black uppercase text-[#7B2CBF]">{save.game}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Trophy size={11} className="text-[#7B2CBF]" /> {save.team}</span>
                          <span className="opacity-20">•</span>
                          <span className="flex items-center gap-1 text-[#E0E0E0]">{save.season}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-[#7B2CBF] group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5">
                        <div className="space-y-0.5">
                           <span className="text-[7px] font-black text-[#555] uppercase tracking-widest">Títulos</span>
                           <p className="text-[10px] font-black text-white">{save.stats?.titles || 0}</p>
                        </div>
                        <div className="space-y-0.5">
                           <span className="text-[7px] font-black text-green-500/50 uppercase tracking-widest">Vitórias</span>
                           <p className="text-[10px] font-black text-green-500">{save.stats?.wins || 0}</p>
                        </div>
                        <div className="space-y-0.5">
                           <span className="text-[7px] font-black text-red-500/50 uppercase tracking-widest">Derrotas</span>
                           <p className="text-[10px] font-black text-red-500">{save.stats?.losses || 0}</p>
                        </div>
                        <div className="space-y-0.5">
                           <span className="text-[7px] font-black text-[#555] uppercase tracking-widest">Melhor</span>
                           <p className="text-[10px] font-black text-white truncate">{save.stats?.bestPlayer || '-'}</p>
                        </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 pb-32 px-2">
          {/* Header Gamer */}
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#2D2D2D] rounded-[40px] p-8 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12 text-[#7B2CBF]">
               <Trophy size={160} />
            </div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#7B2CBF] rounded-xl">
                    <SaveIcon size={20} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">{selectedSave.team}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] text-[#7B2CBF] font-black uppercase tracking-[0.2em]">{selectedSave.game}</p>
                  <div className={`px-3 py-1 rounded-full ${getDifficultyBadge(selectedSave.difficulty).bg} ${getDifficultyBadge(selectedSave.difficulty).color} text-[8px] font-black italic tracking-tight border border-white/5 shadow-lg ${getDifficultyBadge(selectedSave.difficulty).glow}`}>
                    {getDifficultyBadge(selectedSave.difficulty).label}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-white font-black">{selectedSave.season}</span>
              </div>
            </div>

            {/* Philosophy Display */}
            {selectedSave.philosophy && (
               <div className="relative z-10 px-6 py-4 bg-gradient-to-r from-[#7B2CBF]/20 to-transparent border-l-4 border-[#7B2CBF] rounded-2xl">
                  <div className="flex items-center gap-2 mb-1">
                     <Crown size={12} className="text-[#7B2CBF]" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-[#7B2CBF]">Filosofia do Manager</span>
                  </div>
                  <p className="text-sm font-black uppercase italic text-white tracking-tighter">{selectedSave.philosophy}</p>
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
               <p className="text-[9px] text-[#A0A0A0] font-bold uppercase text-center mt-1">Temporadas Concluídas: {selectedSave.stats?.seasonsPlayed || 1}</p>
            </div>
          </div>

          {/* Career Calendar / Evolution */}
          <section className="space-y-4">
             <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-4 bg-[#7B2CBF] rounded-full"></div>
                   <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A0A0A0]">Calendário de Evolução</h4>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                   <TrendingUp size={12} className="text-[#7B2CBF]" />
                   <span className="text-[9px] font-black text-white uppercase italic">Análise de Performance</span>
                </div>
             </div>

             <div className="grid grid-cols-3 gap-3 px-1">
                {[1, 2, 3].map(season => {
                   const seasonLog = (selectedSave.history || []).find(h => h.season.includes(`S${season}`) || h.season.includes(`Temporada ${season}`));
                   const isCompleted = !!seasonLog || (selectedSave.stats?.seasonsPlayed || 0) >= season;
                   
                   return (
                      <div key={season} className={`bg-[#1A1A1A] p-4 rounded-3xl border transition-all flex flex-col items-center gap-3 ${isCompleted ? 'border-[#7B2CBF44] bg-gradient-to-b from-[#7B2CBF08] to-transparent' : 'border-[#2D2D2D] opacity-40'}`}>
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white' : 'bg-black/20 border-[#2D2D2D] text-[#444]'}`}>
                            <span className="text-xs font-black">S{season}</span>
                         </div>
                         <div className="space-y-1 text-center">
                            <p className={`text-[9px] font-black uppercase tracking-widest ${isCompleted ? 'text-white' : 'text-[#444]'}`}>T{season}</p>
                            {isCompleted ? (
                               <Activity size={12} className="mx-auto text-[#7B2CBF] animate-pulse" />
                            ) : (
                               <X size={12} className="mx-auto text-[#2D2D2D]" />
                            )}
                         </div>
                      </div>
                   );
                })}
             </div>
          </section>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-[#1A1A1A] p-4 rounded-3xl border border-[#2D2D2D] space-y-1">
                <span className="text-[8px] text-[#A0A0A0] font-black uppercase tracking-widest flex items-center gap-1"><Trophy size={10} className="text-[#7B2CBF]" /> Títulos</span>
                <p className="text-xl font-black text-white">{selectedSave.stats?.titles || 0}</p>
             </div>
             <div className="bg-[#1A1A1A] p-4 rounded-3xl border border-[#2D2D2D] space-y-1">
                <span className="text-[8px] text-[#A0A0A0] font-black uppercase tracking-widest flex items-center gap-1"><Star size={10} className="text-[#7B2CBF]" /> Melhor Jogador</span>
                <p className="text-[11px] font-black text-white truncate">{selectedSave.stats?.bestPlayer || 'Nenhum'}</p>
             </div>
             <div className="bg-[#1A1A1A] p-4 rounded-3xl border border-[#2D2D2D] space-y-1">
                <span className="text-[8px] text-[#A0A0A0] font-black uppercase tracking-widest flex items-center gap-1"><BarChart3 size={10} className="text-green-500" /> Vitórias</span>
                <p className="text-xl font-black text-white">{selectedSave.stats?.wins || 0}</p>
             </div>
             <div className="bg-[#1A1A1A] p-4 rounded-3xl border border-[#2D2D2D] space-y-1">
                <span className="text-[8px] text-[#A0A0A0] font-black uppercase tracking-widest flex items-center gap-1"><BarChart3 size={10} className="text-red-500" /> Derrotas</span>
                <p className="text-xl font-black text-white">{selectedSave.stats?.losses || 0}</p>
             </div>
          </div>

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
                
                <div className="grid grid-cols-2 gap-3">
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
                      <label className="text-[8px] font-black uppercase text-[#A0A0A0] ml-2">Títulos</label>
                      <input 
                        value={newLog.titles}
                        onChange={e => setNewLog({...newLog, titles: e.target.value})}
                        placeholder="Ex: Libertadores"
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-xl px-4 py-2 text-[10px] text-white"
                      />
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

                <button onClick={handleAddLog} className="w-full bg-[#7B2CBF] py-4 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-[#7B2CBF33] active:scale-95 transition-all">
                  Registrar Temporada
                </button>
              </div>

              <div className="space-y-8 relative pt-4">
                <div className="absolute left-[-1.5px] top-4 bottom-4 w-[3px] bg-gradient-to-b from-[#7B2CBF] to-transparent rounded-full opacity-20"></div>
                
                {(selectedSave.history || []).slice().reverse().map((log, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={log.id} 
                    className="relative pl-8 group"
                  >
                    <div className="absolute left-[-5.5px] top-1.5 w-3 h-3 bg-[#7B2CBF] rounded-full border-2 border-[#1A1A1A] shadow-[0_0_8px_rgba(123,44,191,0.5)] group-hover:scale-125 transition-transform"></div>
                    <div className="flex justify-between items-center mb-2">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#7B2CBF] uppercase italic tracking-[0.1em]">{log.season}</span>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 bg-[#7B2CBF]/20 text-[#7B2CBF] text-[7px] font-black uppercase rounded-lg border border-[#7B2CBF44] animate-pulse">🔥 Marcante</span>
                          )}
                       </div>
                       <span className="text-[8px] text-[#A0A0A0] font-black uppercase">{new Date(log.date).toLocaleDateString()}</span>
                    </div>
                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5 border-l-2 border-l-[#7B2CBF44] space-y-3">
                      <p className="text-xs text-[#E0E0E0] font-medium leading-relaxed italic">"{log.content}"</p>
                      
                      {(log.bestPlayer || log.titles || log.wins || log.losses) && (
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
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-lg border border-green-500/20">
                            <span className="text-[8px] font-black text-green-500">V: {log.wins || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded-lg border border-red-500/20">
                            <span className="text-[8px] font-black text-red-500">D: {log.losses || 0}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
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
             <button className="w-full bg-[#7B2CBF] text-white py-5 rounded-[24px] font-black uppercase italic tracking-[0.2em] shadow-2xl shadow-[#7B2CBF44] flex items-center justify-center gap-3 active:scale-95 transition-all group overflow-hidden relative">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                <Play size={20} fill="white" /> CONTINUAR SAVE
             </button>
             
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
                    <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Nome do Save</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Minha Carreira No AFC"
                      className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-6 py-4 text-sm focus:border-[#7B2CBF] outline-none text-white italic" 
                    />
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
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Time</label>
                       <input 
                         type="text" 
                         value={formData.team}
                         onChange={e => setFormData({...formData, team: e.target.value})}
                         placeholder="Ex: AFC Richmond"
                         className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-6 py-3.5 text-xs text-white" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Filosofia</label>
                       <select 
                         value={formData.philosophy}
                         onChange={e => setFormData({...formData, philosophy: e.target.value})}
                         className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-5 py-4 text-xs focus:border-[#7B2CBF] outline-none text-white font-bold italic appearance-none"
                       >
                         {['Ofensivo', 'Defensivo', 'Base', 'Contra-ataque', 'Posse de bola', 'Equilibrado'].map(p => <option key={p} value={p}>{p}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Objetivo Principal</label>
                    <input 
                      type="text" 
                      value={formData.objective}
                      onChange={e => setFormData({...formData, objective: e.target.value})}
                      placeholder="Ex: Ganhar a Champions"
                      className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white" 
                    />
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
    </div>
  );
}
