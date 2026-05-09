/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, Globe, Trophy, Star, ChevronRight, Zap, Target, BookOpen, Crown, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../store';
import { ImportedCareer, Save } from '../types';
import { CAREER_CATEGORIES, GAMES } from '../constants';

export default function CareersDiscoveryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedGame, setSelectedGame] = useState('Todos');
  const [selectedType, setSelectedType] = useState<'All' | 'Official' | 'Special'>('All');
  const [careers, setCareers] = useState<ImportedCareer[]>([]);

  useEffect(() => {
    const fetchCareers = async () => {
      setCareers(await storage.getImportedCareers());
    };
    fetchCareers();
  }, []);

  const filteredCareers = careers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || c.category === selectedCategory;
    const matchesGame = selectedGame === 'Todos' || c.game === selectedGame;
    const matchesType = selectedType === 'All' || c.type === selectedType;
    return matchesSearch && matchesCategory && matchesGame && matchesType && c.published;
  });

  const acceptCareer = async (career: ImportedCareer) => {
    const user = storage.getCurrentUser();
    if (!user) return;

    const newSave: Save = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      name: `Desafio: ${career.name}`,
      game: career.game,
      team: career.team,
      season: '2024/25',
      tactic: career.style,
      philosophy: 'Varia',
      objective: career.objective,
      difficulty: career.difficulty,
      description: `Aceito da Curadoria.\nTipo: ${career.type}\nRegras: ${career.rules}`,
      images: [],
      history: [],
      goals: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addSave(newSave);
    alert("Desafio aceito! Visualize em Meus Saves.");
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="space-y-1">
        <h2 className="text-2xl font-black italic">Explorar Carreiras</h2>
        <p className="text-[10px] text-[#7B2CBF] font-bold uppercase tracking-widest px-1">Curadoria de Elite para seu Save</p>
      </header>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
          <input 
            type="text"
            placeholder="Buscar por time ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-[#7B2CBF] outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setSelectedType('All')}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap border ${selectedType === 'All' ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white' : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#A0A0A0]'}`}
          >
            Tudo
          </button>
          <button 
            onClick={() => setSelectedType('Official')}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap border flex items-center gap-2 ${selectedType === 'Official' ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white' : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#A0A0A0]'}`}
          >
            <Crown size={12} /> Oficiais
          </button>
          <button 
            onClick={() => setSelectedType('Special')}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap border flex items-center gap-2 ${selectedType === 'Special' ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white' : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#A0A0A0]'}`}
          >
            <Star size={12} /> Especiais
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-[#A0A0A0] uppercase ml-1">Categoria</span>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#0F0F0F] border border-[#2D2D2D] rounded-xl px-3 py-2 text-xs"
            >
              <option>Todas</option>
              {CAREER_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-[#A0A0A0] uppercase ml-1">Plataforma</span>
            <select 
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full bg-[#0F0F0F] border border-[#2D2D2D] rounded-xl px-3 py-2 text-xs"
            >
              <option>Todos</option>
              {GAMES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Careers Grid */}
      <div className="space-y-4">
        {filteredCareers.length === 0 ? (
          <div className="py-20 text-center opacity-40 italic text-sm">
            Nenhuma carreira encontrada com esses filtros.
          </div>
        ) : (
          filteredCareers.map(career => (
            <CareerCard key={career.id} career={career} onAccept={() => acceptCareer(career)} />
          ))
        )}
      </div>
    </div>
  );
}

function CareerCard({ career, onAccept }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      layout
      className={`bg-[#1A1A1A] border border-[#2D2D2D] rounded-3xl overflow-hidden transition-all ${career.featured ? 'border-[#7B2CBF44] shadow-lg shadow-[#7B2CBF0a]' : ''}`}
    >
      {/* Card Header */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg text-white">{career.name}</h3>
              {career.type === 'Official' && (
                <span className="bg-[#7B2CBF] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
                  <Crown size={8} /> Oficial
                </span>
              )}
            </div>
            <p className="text-xs text-[#7B2CBF] font-bold uppercase">{career.game}</p>
          </div>
          <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase ${
            career.difficulty === 'Extremo' ? 'border-red-500/20 text-red-500' :
            career.difficulty === 'Difícil' ? 'border-orange-500/20 text-orange-500' :
            'border-[#2D2D2D] text-[#A0A0A0]'
          }`}>
            {career.difficulty}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0F0F0F] rounded-2xl p-3 border border-[#2D2D2D]">
            <span className="text-[9px] font-bold text-[#A0A0A0] uppercase block mb-1">Time</span>
            <span className="text-xs font-bold">{career.team}</span>
          </div>
          <div className="bg-[#0F0F0F] rounded-2xl p-3 border border-[#2D2D2D]">
            <span className="text-[9px] font-bold text-[#A0A0A0] uppercase block mb-1">Categoria</span>
            <span className="text-xs font-bold">{career.category}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-[#A0A0A0] font-bold uppercase px-1">
          <div className="flex items-center gap-1.5"><Globe size={12} className="text-[#7B2CBF]" /> {career.country}</div>
          <div className="flex items-center gap-1.5"><Trophy size={12} className="text-[#7B2CBF]" /> {career.league}</div>
        </div>

        <p className="text-xs text-[#A0A0A0] leading-relaxed line-clamp-2">
          {career.description}
        </p>

        <div className="pt-2 flex gap-3">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex-1 bg-[#2D2D2D] text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#3D3D3D] transition-colors"
          >
            {expanded ? 'Ver Menos' : 'Ver Detalhes'}
          </button>
          <button 
            onClick={onAccept}
            className="flex-1 bg-[#7B2CBF] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#7B2CBF33] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={14} /> Aceitar Desafio
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#2D2D2D] bg-[#0F0F0F] p-6 space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#7B2CBF]">
                <Target size={14} strokeWidth={3} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Objetivo Principal</h4>
              </div>
              <p className="text-xs text-[#E0E0E0] font-medium leading-relaxed bg-[#1A1A1A] p-4 rounded-2xl border border-[#2D2D2D]">
                {career.objective}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#7B2CBF]">
                <Shield size={14} strokeWidth={3} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Regras do Desafio</h4>
              </div>
              <p className="text-xs text-[#E0E0E0] font-medium leading-relaxed bg-[#1A1A1A] p-4 rounded-2xl border border-[#2D2D2D]">
                {career.rules}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#7B2CBF]">
                <BookOpen size={14} strokeWidth={3} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Estilo Sugerido</h4>
              </div>
              <span className="inline-block bg-[#7B2CBF]/10 text-[#7B2CBF] px-4 py-2 rounded-xl text-xs font-bold border border-[#7B2CBF22]">
                {career.style}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
