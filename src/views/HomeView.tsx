/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Zap, Save as SaveIcon, ChevronRight, Trophy, Bot, Newspaper, Star, 
  Target, Crown, Settings, Globe, Palette, X, Check,
  Lightbulb, Flame, Award, Bell, Volume2, Monitor, Trash2, RotateCcw, ZapOff,
  Play, Plus, Smartphone, Sparkles, Lock, Layout, MessageSquare
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

export default function HomeView({ onGenerate, onSeeSaves, onSeeLogs, onOpenSettings }: HomeViewProps) {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [dailySuggestion, setDailySuggestion] = useState<any>(null);
  const [lastSave, setLastSave] = useState<any>(null);
  const [lastLog, setLastLog] = useState<any>(null);

  const user = storage.getCurrentUser();

  const acceptSuggestion = async () => {
    if (!user || !dailySuggestion) return;
    
    const newSave: Save = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      name: `Desafio: ${dailySuggestion.title}`,
      game: dailySuggestion.game || GAMES[0],
      team: dailySuggestion.team || 'A Escolher',
      season: '2024/25',
      tactic: dailySuggestion.style || '4-3-3',
      philosophy: dailySuggestion.philosophy || 'Equilibrada',
      objective: dailySuggestion.content || dailySuggestion.description || dailySuggestion.objective,
      difficulty: dailySuggestion.difficulty || 'Normal',
      description: `Sugestão do Dia.\nRegras: ${dailySuggestion.rules || 'N/A'}`,
      images: [],
      history: [],
      goals: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addSave(newSave);
    alert("Desafio aceito! Visualize em Meus Saves.");
  };

  useEffect(() => {
    const fetchData = async () => {
      const settings = await storage.getAppSettings();
      setAppSettings(settings);
      
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
        const userSaves = await storage.getSaves(user.id);
        if (userSaves.length > 0) {
          setLastSave(userSaves[0]); // Sorted by desc createdAt
        }
      }

      // Last CEO Log (if user is CEO)
      const allLogs = await storage.getLogs();
      if (allLogs.length > 0) {
        setLastLog(allLogs[0]);
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
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Olá, {user?.name?.split(' ')?.[0] || 'Manager'}</h2>
          </div>
          <div className="flex items-center gap-3">
             <p className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-widest border-r border-white/10 pr-3">Nível {user?.level}</p>
             <div className="flex items-center gap-1.5 bg-[#7B2CBF]/10 px-2 py-0.5 rounded-full border border-[#7B2CBF33]">
                <Award size={10} className="text-[#7B2CBF]" />
                <span className="text-[9px] font-black uppercase text-[#7B2CBF]">{user?.badges.length} Badges</span>
             </div>
          </div>
        </div>
        <button 
          onClick={onOpenSettings}
          className="p-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-[24px] text-[#A0A0A0] hover:text-white hover:border-[#7B2CBF44] transition-all active:scale-95 group"
        >
          <Settings size={22} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </header>

      {/* Quick Actions */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <QuickAction 
          icon={<Play size={16} fill="white" />} 
          label="Continuar" 
          onClick={onSeeSaves} 
          active={!!lastSave}
        />
        <QuickAction 
          icon={<Plus size={18} />} 
          label="Novo Save" 
          onClick={onGenerate} 
        />
        <QuickAction 
          icon={<Lightbulb size={18} />} 
          label="Ideia Fox" 
          onClick={() => onGenerate()} // Assuming it could lead to ideas too
        />
      </div>

      {/* Hero Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGenerate}
        className="relative w-full h-44 rounded-[48px] overflow-hidden group shadow-[0_20px_50px_-12px_rgba(123,44,191,0.3)]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#7B2CBF] via-[#9D4EDD] to-[#240046] opacity-90 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="relative h-full flex flex-col items-center justify-center gap-2 p-6 text-center">
          <div className="p-4 bg-white/20 backdrop-blur-md rounded-full shadow-xl group-hover:rotate-12 transition-transform duration-500 border border-white/20">
            <Zap size={32} fill="white" className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic text-white tracking-widest leading-none">Gerar Carreira</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mt-2">Algoritmo Fox Elite</p>
          </div>
        </div>
      </motion.button>

      {/* Grid Widgets */}
      <div className="grid grid-cols-2 gap-5">
        {/* Suggestion Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 bg-[#1A1A1A] border border-[#2D2D2D] p-6 rounded-[40px] flex gap-5 hover:border-[#7B2CBF55] transition-all group"
        >
           <div className="w-14 h-14 bg-[#7B2CBF]/10 rounded-2xl flex items-center justify-center text-[#7B2CBF] shrink-0 border border-[#7B2CBF22]">
              {dailySuggestion?.icon || <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />}
           </div>
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#7B2CBF] drop-shadow-[0_0_8px_rgba(123,44,191,0.2)]">Sugestão do Dia</span>
              </div>
              {dailySuggestion ? (
                <div className="flex justify-between items-center w-full">
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-black uppercase tracking-tight text-white line-clamp-1">{dailySuggestion.title}</h4>
                    <p className="text-[10px] text-[#A0A0A0] leading-relaxed italic line-clamp-1">"{dailySuggestion.content || dailySuggestion.description}"</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); acceptSuggestion(); }}
                    className="bg-[#7B2CBF] text-white p-2 rounded-xl shadow-lg shadow-[#7B2CBF33] active:scale-90 transition-all ml-4"
                    title="Aceitar Desafio"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <div className="h-4 w-32 bg-white/5 rounded animate-pulse"></div>
              )}
           </div>
        </motion.div>

        {/* Last Save Widget */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#1A1A1A] border border-[#2D2D2D] p-6 rounded-[40px] space-y-4 hover:border-[#7B2CBF55] transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-3 bg-green-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase text-[#A0A0A0] tracking-widest">Suas Jornadas</span>
          </div>
          {lastSave ? (
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase italic text-white line-clamp-1">{(lastSave.team || 'Sem Time').split('|')[0]}</h3>
              <p className="text-[9px] text-[#A0A0A0] uppercase font-black tracking-widest opacity-60">{(lastSave.game || 'Gen').split('|')[0]} • {lastSave.season}</p>
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
          className="bg-[#1A1A1A] border border-[#2D2D2D] p-6 rounded-[40px] space-y-4 hover:border-[#7B2CBF55] transition-all"
        >
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" />
            <span className="text-[10px] font-black uppercase text-[#444] tracking-widest">Atividade</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase italic text-white">{user?.role} Mode</h3>
            <p className="text-[9px] text-[#A0A0A0] uppercase font-black tracking-widest opacity-60">Status Online</p>
          </div>
        </motion.div>
      </div>

      {/* CEO Logs (Active Widget) */}
      {user?.role === UserRole.CEO && lastLog && (
        <motion.div 
          whileHover={{ x: 5 }}
          onClick={onSeeLogs}
          className="bg-black/40 border border-[#2D2D2D]/50 rounded-[40px] p-8 flex items-center justify-between group hover:bg-[#1A1A1A] transition-all cursor-pointer"
        >
           <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#7B2CBF] group-hover:scale-110 transition-transform">
                <Lock size={20} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-[#444] tracking-widest">Último Log do CEO</span>
                <p className="text-xs font-medium text-[#A0A0A0] italic mt-0.5 line-clamp-1 leading-relaxed">
                  "{lastLog.title || lastLog.message}"
                </p>
              </div>
           </div>
           <ChevronRight size={20} className="text-[#2D2D2D] group-hover:text-[#7B2CBF] transition-colors" />
        </motion.div>
      )}
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
