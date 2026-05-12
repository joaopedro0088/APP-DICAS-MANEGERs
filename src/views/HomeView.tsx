/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Zap, Save as SaveIcon, ChevronRight, Trophy, Bot, Newspaper, Star, 
  Target, Crown, Settings, Globe, Palette, X, Check, Wand2,
  Lightbulb, Flame, Award, Bell, Volume2, Monitor, Trash2, RotateCcw, ZapOff,
  Play, Plus, Smartphone, Sparkles, Lock, Layout, MessageSquare, Instagram
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../store';
import { AppSettings, UserRole, Save } from '../types';
import { GAMES } from '../constants';

interface HomeViewProps {
  onGenerate: () => void;
  onSeeSaves: () => void;
  onSeeLogs: () => void;
  onOpenSettings: () => void;
}

import ChangelogModal from '../components/ChangelogModal';

export default function HomeView({ onGenerate, onSeeSaves, onSeeLogs, onOpenSettings }: HomeViewProps) {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [dailySuggestion, setDailySuggestion] = useState<any>(null);
  const [lastSave, setLastSave] = useState<any>(null);
  const [lastLog, setLastLog] = useState<any>(null);
  const [acceptedChallenges, setAcceptedChallenges] = useState<string[]>([]);
  const [showChangelog, setShowChangelog] = useState(false);

  const user = storage.getCurrentUser();

  const acceptSuggestion = async () => {
    if (!user || !dailySuggestion) return;
    
    try {
      // Check for duplicate
      const currentSaves = await storage.getSaves(user.id);
      const isDuplicate = currentSaves.some(s => s.originId === dailySuggestion.id);
      
      if (isDuplicate) {
        setAcceptedChallenges(prev => [...prev, dailySuggestion.id]);
        return;
      }

      const newSave: Save = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        name: `Desafio: ${dailySuggestion.title}`,
        game: dailySuggestion.game || GAMES[0],
        team: dailySuggestion.team || 'A Escolher',
        category: dailySuggestion.category || 'Sugestão',
        selectedDuration: 5,
        season: '2024/25',
        tactic: dailySuggestion.style || '4-3-3',
        philosophy: dailySuggestion.philosophy || 'Equilibrada',
        objective: dailySuggestion.content || dailySuggestion.description || dailySuggestion.objective,
        difficulty: dailySuggestion.difficulty || 'Normal',
        description: `Sugestão do Dia.\nRegras: ${dailySuggestion.rules || 'N/A'}`,
        originId: dailySuggestion.id,
        images: [],
        history: [],
        goals: [],
        status: 'active',
        theme: 'default',
        clubHistory: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await storage.addSave(newSave);
      await storage.addXP(user.id, 150); // XP for accepting a challenge
      setAcceptedChallenges(prev => [...prev, dailySuggestion.id]);
    } catch (error) {
      console.error("Failed to accept suggestion:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settings = await storage.getAppSettings();
        setAppSettings(settings);
      } catch (e) {
        console.error("Error fetching app settings:", e);
      }
      
      // Daily suggestion
      try {
        const [ideas, tips, careers] = await Promise.all([
          storage.getLibraryIdeas(),
          storage.getCommunityTips(),
          storage.getImportedCareers()
        ]);
        const allPossibleSuggestions = [
          ...ideas.map(i => ({ ...i, title: i.title, content: i.content, icon: <Layout size={14}/> })),
          ...tips.filter(t => t.status === 'approved').map(t => ({ ...t, title: t.title, content: t.content, icon: <MessageSquare size={14}/> })),
          ...careers.filter(c => c.status === 'published').map(c => ({ ...c, title: c.name, content: c.description || c.objective, icon: <Trophy size={14}/> }))
        ];
        
        if (allPossibleSuggestions.length > 0) {
          const today = new Date().toDateString();
          // Use a simple hash of the date string to select a different item each day
          let hash = 0;
          for (let i = 0; i < today.length; i++) {
            hash = (hash << 5) - hash + today.charCodeAt(i);
          }
          const index = Math.abs(hash) % allPossibleSuggestions.length;
          setDailySuggestion(allPossibleSuggestions[index]);
        }
      } catch (e) {
        console.error("Error fetching suggestions:", e);
      }

      // Last Save (filtered by user ID)
      if (user) {
        try {
          const userSaves = await storage.getSaves(user.id);
          if (userSaves.length > 0) {
            setLastSave(userSaves[0]); // Sorted by desc createdAt
          }
        } catch (e) {
          console.error("Error fetching user saves:", e);
        }
      }

      // Last CEO Log (if user is CEO)
      try {
        const allLogs = await storage.getLogs();
        if (allLogs.length > 0) {
          setLastLog(allLogs[0]);
        }
      } catch (e) {
        console.error("Error fetching logs:", e);
      }
    };
    fetchData();
  }, []);

  if (!appSettings) return null;

  return (
    <div className={`space-y-8 pb-32 ${appSettings.animations ? '' : 'no-animations'} ${appSettings.theme === 'black' ? 'bg-black' : ''}`}>
      {/* Header with Settings */}
      <header className="flex justify-between items-center py-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Crown size={20} className="text-[#7B2CBF] drop-shadow-[0_0_8px_rgba(123,44,191,0.5)]" />
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white font-display">Olá, {user?.name?.split(' ')?.[0] || 'Manager'}</h2>
          </div>
          <div className="flex items-center gap-3">
             <p className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-widest border-r border-white/10 pr-3 font-mono">Nível {user?.level}</p>
             <div className="flex items-center gap-1.5 bg-[#7B2CBF]/10 px-2 py-0.5 rounded-full border border-[#7B2CBF33]">
                <Award size={10} className="text-[#7B2CBF]" />
                <span className="text-[9px] font-black uppercase text-[#7B2CBF] font-display">{user?.badges.length} Badges</span>
             </div>
          </div>
        </div>
        <button 
          onClick={onOpenSettings}
          className="p-4 glass rounded-[24px] text-[#A0A0A0] hover:text-white hover:border-[#7B2CBF44] transition-all active:scale-95 group"
        >
          <Settings size={22} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </header>

      {/* Quick Actions */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <QuickAction 
          icon={<Play size={16} fill="white" />} 
          label="Continuar Save" 
          onClick={onSeeSaves} 
          active={!!lastSave}
        />
        <QuickAction 
          icon={<Plus size={18} />} 
          label="Novo Save" 
          onClick={onGenerate} 
        />
        <QuickAction 
          icon={<Wand2 size={18} />} 
          label="Gerar Carreira" 
          onClick={onGenerate} 
        />
      </div>

      {/* Hero Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGenerate}
        className="relative w-full h-52 rounded-[48px] overflow-hidden group shadow-[0_20px_50px_-12px_rgba(123,44,191,0.4)]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#7B2CBF] via-[#5A189A] to-black opacity-95 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        
        <div className="relative h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="p-5 bg-white/10 backdrop-blur-xl rounded-full shadow-2xl group-hover:rotate-12 transition-transform duration-500 border border-white/20">
            <Wand2 size={38} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic text-white tracking-widest leading-none font-display text-shadow-lg">Gerar Carreira</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#7B2CBF] mt-3 bg-white/10 px-4 py-1 rounded-full border border-white/5 backdrop-blur-md">🔱 MODO LENDÁRIO</p>
          </div>
        </div>
      </motion.button>

      {/* Grid Widgets */}
      <div className="grid grid-cols-2 gap-5">
        {/* Suggestion Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 glass-dark p-7 rounded-[40px] flex gap-5 hover:border-[#7B2CBF55] transition-all group relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-[#7B2CBF] -rotate-12 group-hover:scale-110 transition-transform">
              <Bot size={120} />
           </div>
           <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-[#7B2CBF] shrink-0">
              <Bot size={32} className="group-hover:scale-110 transition-transform" />
           </div>
           <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#7B2CBF] font-display">Fox Bot: Desafio do Dia</span>
              </div>
              {dailySuggestion ? (
                <div className="flex justify-between items-center w-full min-w-0">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="text-base font-black uppercase tracking-tight text-white line-clamp-1 font-display">{dailySuggestion.title}</h4>
                    <p className="text-[10px] text-[#A0A0A0] leading-relaxed italic line-clamp-1">"{dailySuggestion.content || dailySuggestion.description}"</p>
                  </div>
                  {acceptedChallenges.includes(dailySuggestion.id) ? (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-green-500 text-white px-3 py-2 rounded-xl flex items-center gap-1 ml-4 shadow-xl shadow-green-500/30"
                    >
                      <Check size={14} />
                      <span className="text-[8px] font-black uppercase tracking-tighter">Aceito</span>
                    </motion.div>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); acceptSuggestion(); }}
                      className="bg-[#7B2CBF] text-white p-3 rounded-2xl shadow-xl shadow-[#7B2CBF44] active:scale-90 transition-all ml-4"
                    >
                      <Check size={18} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="h-5 w-40 bg-white/5 rounded-lg animate-pulse"></div>
              )}
           </div>
        </motion.div>

        {/* Last Save Widget */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-dark p-7 rounded-[40px] space-y-4 hover:border-[#7B2CBF55] transition-all relative overflow-hidden group"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="text-[10px] font-black uppercase text-[#A0A0A0] tracking-[0.2em] font-display">Minhas Carreiras</span>
          </div>
          {lastSave ? (
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase italic text-white line-clamp-1 font-display">{(lastSave.team || 'Sem Time').split('|')[0]}</h3>
              <p className="text-[9px] text-[#A0A0A0] uppercase font-black tracking-widest opacity-60 font-mono">{(lastSave.game || 'Gen').split('|')[0]} • {lastSave.season}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[11px] text-[#444] font-black uppercase italic">Nenhum Save</p>
              <p className="text-[8px] text-[#333] font-bold uppercase">Comece no Gerador</p>
            </div>
          )}
        </motion.div>

        {/* CEO Activity / Stats Widget */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-dark p-7 rounded-[40px] space-y-4 hover:border-[#7B2CBF55] transition-all group"
        >
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#7B2CBF] drop-shadow-[0_0_5px_rgba(123,44,191,0.5)]" />
            <span className="text-[10px] font-black uppercase text-[#444] tracking-[0.2em] font-display">Status Fox</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase italic text-white font-display">{user?.role} Mode</h3>
            <p className="text-[9px] text-[#A0A0A0] uppercase font-black tracking-widest opacity-60 font-mono">ID: #{user?.id.slice(0, 4)}</p>
          </div>
        </motion.div>
      </div>

      {/* CEO Logs (Active Widget) */}
      {(user?.role === UserRole.CEO || user?.role === UserRole.ADM) && lastLog && (
        <motion.div 
          whileHover={{ x: 5 }}
          onClick={onSeeLogs}
          className="glass-dark rounded-[40px] p-8 flex items-center justify-between group cursor-pointer"
        >
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-[#7B2CBF] group-hover:scale-110 transition-transform">
                <Lock size={24} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-[#444] tracking-[0.2em] font-display">Portal de Auditoria</span>
                <p className="text-[11px] font-medium text-[#A0A0A0] italic mt-0.5 line-clamp-1 leading-relaxed">
                  "{lastLog.text || lastLog.title || lastLog.message}"
                </p>
              </div>
           </div>
           <ChevronRight size={20} className="text-[#2D2D2D] group-hover:text-[#7B2CBF] group-hover:translate-x-1 transition-all" />
        </motion.div>
      )}

      {/* Social / Instagram Footer */}
      <footer className="pt-4">
        <motion.a 
          href="https://www.instagram.com/jaoxx_99" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full glass-dark p-10 rounded-[48px] flex flex-col items-center justify-center gap-5 group transition-all hover:border-red-500/20 active:scale-[0.98]"
        >
           <div className="w-16 h-16 bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-red-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Instagram size={32} />
           </div>
           <div className="text-center space-y-1">
              <h4 className="text-base font-black uppercase italic tracking-tighter text-white font-display">Portal Oficial Fox</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A0A0A0]">Updates, Parcerias & Bastidores</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                 <span className="w-8 h-[1px] bg-white/10"></span>
                 <p className="text-sm font-black bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-clip-text text-transparent tracking-widest font-display">@jaoxx_99</p>
                 <span className="w-8 h-[1px] bg-white/10"></span>
              </div>
           </div>
        </motion.a>
      </footer>

      <div className="flex justify-center pb-8 opacity-40">
        <button 
          onClick={() => setShowChangelog(true)}
          className="text-[9px] font-black bg-black border border-white/10 text-white px-3 py-1.5 rounded-xl italic tracking-[0.2em] uppercase hover:bg-[#7B2CBF]/20 hover:border-[#7B2CBF33] transition-all active:scale-95 font-display"
        >
          Fox Managers 🔱 V1.5 BETA • Changelog
        </button>
      </div>

      <ChangelogModal isOpen={showChangelog} onClose={() => setShowChangelog(false)} />
    </div>
  );
}

function QuickAction({ icon, label, onClick, active = true }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) {
  return (
    <button 
      onClick={active ? onClick : undefined}
      className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all active:scale-95 border whitespace-nowrap ${active ? 'bg-white/5 border-white/5 hover:border-[#7B2CBF55] text-white cursor-pointer' : 'opacity-20 grayscale border-transparent cursor-not-allowed'}`}
    >
      <div className={`${active ? 'text-[#7B2CBF]' : ''}`}>{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
