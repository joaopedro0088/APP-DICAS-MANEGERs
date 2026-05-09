/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Trash2, Camera, Info, Check, Eye, X, Crown, 
  Dribbble, Gamepad2, Send, Zap, Filter, User, Target,
  MessageSquare, Sparkles, BookOpen, Clock, RotateCcw, Flame, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../store';
import { CommunityTip, Save } from '../types';
import { GAMES, DIFFICULTIES } from '../constants';

const CHALLENGES = [
  'Só sub-23', 'Sem contratar', 'Pressão alta', 'Contra-ataque', 
  'Orçamento baixo', 'Base obrigatória', 'Time pequeno', 
  'Posse de bola', 'Sem scout', 'Jovens promessas'
];

const CATEGORIES = [
  { id: 'rebuild', name: 'Rebuild', icon: <RotateCcw size={14} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'jovens', name: 'Jovens', icon: <Flame size={14} />, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { id: 'financeiro', name: 'Sem Dinheiro', icon: <Target size={14} />, color: 'text-green-400', bg: 'bg-green-400/10' },
  { id: 'hardcore', name: 'Hardcore', icon: <Zap size={14} />, color: 'text-red-400', bg: 'bg-red-400/10' },
  { id: 'longa', name: 'Longa Duração', icon: <Clock size={14} />, color: 'text-[#7B2CBF]', bg: 'bg-[#7B2CBF]/10' },
];

export default function LibraryView() {
  const [showTipForm, setShowTipForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [tipTitle, setTipTitle] = useState('');
  const [tipContent, setTipContent] = useState('');
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [team, setTeam] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [publishToCommunity, setPublishToCommunity] = useState(true);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [officialIdeas, setOfficialIdeas] = useState<any[]>([]);
  const [communityTips, setCommunityTips] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = storage.getCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      setOfficialIdeas(await storage.getLibraryIdeas());
      const tips = await storage.getCommunityTips();
      setCommunityTips(tips.filter(t => t.status === 'approved' && t.publishedToCommunity));
    };
    fetchData();
  }, []);

  const toggleChallenge = (challenge: string) => {
    if (selectedChallenges.includes(challenge)) {
      setSelectedChallenges(selectedChallenges.filter(c => c !== challenge));
    } else if (selectedChallenges.length < 3) {
      setSelectedChallenges([...selectedChallenges, challenge]);
    }
  };

  const calculateDifficulty = () => {
    const count = selectedChallenges.length;
    if (count === 0) return { label: 'EASY', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (count === 1) return { label: 'NORMAL', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    if (count === 2) return { label: 'HARD', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { label: 'HARDCORE 🔥', color: 'text-purple-500', bg: 'bg-purple-500/10' };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) return;
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !tipTitle) return;

    const newTip: CommunityTip = {
      id: Math.random().toString(36).substr(2, 9),
      authorId: user.id,
      authorName: user.name,
      title: tipTitle,
      category: selectedCategory, // Added category
      content: tipContent,
      challenges: selectedChallenges,
      game: selectedGame,
      team: team,
      status: 'pending',
      publishedToCommunity: publishToCommunity,
      imageUrl: imagePreview || undefined,
      createdAt: Date.now()
    };

    const allTips = await storage.getCommunityTips();
    await storage.setCommunityTips([...allTips, newTip]);
    
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowTipForm(false);
      resetForm();
    }, 3000);
  };

  const resetForm = () => {
    setTipTitle('');
    setTipContent('');
    setTeam('');
    setSelectedChallenges([]);
    setImagePreview(null);
  };

  const acceptChallenge = async (item: any) => {
    if (!user) return;
    
    const newSave: Save = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      name: `Desafio: ${item.t}`,
      game: item.game !== 'Oficial' ? item.game : GAMES[0],
      team: item.team || 'A Escolher',
      season: '2024/25',
      tactic: '4-3-3',
      philosophy: 'Equilibrada',
      objective: item.d,
      difficulty: 'Médio',
      description: `Aceito da Biblioteca.\nAutor: ${item.author}\nDesafios: ${item.challenges.join(', ')}`,
      images: [],
      history: [],
      goals: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addSave(newSave);
    alert("Desafio aceito! Visualize em Meus Saves.");
  };

  const getFilteredItems = (items: any[]) => {
    if (!activeCategory) return items;
    return items.filter(item => item.category === activeCategory || (item.challenges && item.challenges.includes(CATEGORIES.find(c => c.id === activeCategory)?.name)));
  };

  const sections = [
    {
      category: 'Curadoria Fox (Oficial)',
      items: getFilteredItems(officialIdeas.map(i => ({ 
        t: i.title, 
        d: i.content, 
        author: i.authorName || 'Equipe Fox', 
        game: 'Oficial', 
        team: '', 
        category: i.category,
        date: Date.now(), 
        mod: 'CEO',
        challenges: i.badge ? [i.badge] : [],
        img: undefined
      })))
    },
    {
      category: 'Dicas da Comunidade',
      items: getFilteredItems(communityTips.map(t => ({ 
        t: t.title, 
        d: t.content, 
        author: t.authorName, 
        game: t.game, 
        team: t.team, 
        category: t.category,
        date: t.createdAt, 
        mod: t.moderatedBy,
        challenges: t.challenges || [],
        img: t.imageUrl
      })))
    }
  ];

  const difficulty = calculateDifficulty();

  return (
    <div className="space-y-8 pb-24">
      <header className="flex justify-between items-end px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Biblioteca</h2>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-[#7B2CBF] animate-pulse"></div>
             <p className="text-[9px] text-[#7B2CBF] font-black uppercase tracking-[0.2em]">Fox Intel Center</p>
          </div>
        </div>
        <button 
          onClick={() => setShowTipForm(true)}
          className="bg-[#7B2CBF] text-white text-[10px] font-black uppercase px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-[#7B2CBF44] active:scale-95 hover:bg-[#8A3CFE] transition-all"
        >
          <Plus size={16} /> Sugerir Dica
        </button>
      </header>

      {/* Category Bar */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none px-1">
        <button 
          onClick={() => setActiveCategory(null)}
          className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${!activeCategory ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white' : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#A0A0A0] hover:border-white/20'}`}
        >
          Todos
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${activeCategory === cat.id ? `${cat.bg} border-${cat.id === 'rebuild' ? 'blue-400/40' : cat.id === 'jovens' ? 'orange-400/40' : 'white/20'} ${cat.color}` : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#A0A0A0] hover:border-white/20'}`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {showTipForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0F0F0F] border border-[#2D2D2D] w-full max-w-lg rounded-[40px] p-8 space-y-6 max-h-[90vh] overflow-y-auto scrollbar-hide relative"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                  <h3 className="font-black text-2xl uppercase italic text-[#7B2CBF]">Sugerir Dica</h3>
                  <p className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-widest">Compartilhe sua visão, Manager</p>
                </div>
                <button onClick={() => setShowTipForm(false)} className="p-3 bg-white/5 rounded-2xl text-[#A0A0A0] hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {submitted ? (
                <div className="py-20 text-center space-y-6">
                  <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                    <Zap size={48} className="animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black uppercase italic">Dica Enviada!</p>
                    <p className="text-xs text-[#A0A0A0] uppercase font-bold tracking-widest">Passe pelo controle do CEO para brilhar na biblioteca.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitTip} className="space-y-8">
                  {/* Basic Info */}
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1">Título Curto</label>
                      <input 
                        required
                        value={tipTitle}
                        onChange={e => setTipTitle(e.target.value)}
                        placeholder="Ex: Como vencer fora de casa"
                        className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#7B2CBF] transition-all text-white placeholder:text-white/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1">Categoria Fox</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`p-3 rounded-xl border text-[9px] font-black uppercase flex items-center gap-2 transition-all ${selectedCategory === cat.id ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white' : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#A0A0A0]'}`}
                          >
                            {cat.icon}
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1">Seleção de Jogo</label>
                        <div className="relative">
                          <select 
                            value={selectedGame}
                            onChange={e => setSelectedGame(e.target.value)}
                            className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-5 py-4 text-xs appearance-none focus:border-[#7B2CBF] outline-none text-white italic font-bold"
                          >
                            {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#7B2CBF]">
                            {selectedGame.includes('Football') ? <Dribbble size={14} /> : <Gamepad2 size={14} />}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1">Nome do Time (Opcional)</label>
                        <input 
                          value={team}
                          onChange={e => setTeam(e.target.value)}
                          placeholder="Ex: Santos"
                          className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-5 py-4 text-xs outline-none focus:border-[#7B2CBF] transition-all text-white placeholder:text-white/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Challenges Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                      <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic">Escolha até 3 desafios</label>
                      <span className="text-[10px] font-black text-[#7B2CBF] uppercase tracking-widest">{selectedChallenges.length}/3 Selecionados</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                      {CHALLENGES.map(challenge => {
                        const isSelected = selectedChallenges.includes(challenge);
                        return (
                          <button
                            key={challenge}
                            type="button"
                            onClick={() => toggleChallenge(challenge)}
                            className={`px-4 py-2.5 rounded-xl transition-all duration-300 border ${
                              isSelected 
                                ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white shadow-lg shadow-[#7B2CBF33] scale-105' 
                                : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#A0A0A0] hover:border-[#7B2CBF44]'
                            }`}
                          >
                            {challenge}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Difficulty Badge (Calculated) */}
                  <div className="bg-[#1A1A1A] p-4 rounded-3xl border border-[#2D2D2D] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target size={18} className="text-[#A0A0A0]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#A0A0A0]">Dificuldade Automática</span>
                    </div>
                    <div className={`${difficulty.bg} ${difficulty.color} px-4 py-1.5 rounded-full text-[10px] font-black italic tracking-tighter border border-white/5 shadow-inner`}>
                      {difficulty.label}
                    </div>
                  </div>

                  {/* Idea Field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1">Conte rapidamente sua ideia de carreira...</label>
                    <textarea 
                      value={tipContent}
                      onChange={e => setTipContent(e.target.value)}
                      maxLength={150}
                      rows={3}
                      placeholder="Limite de 150 caracteres..."
                      className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-5 py-4 text-xs outline-none focus:border-[#7B2CBF] transition-all text-white resize-none italic"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1">Adicionar print (opcional)</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                    
                    {!imagePreview ? (
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-video bg-[#1A1A1A] border-2 border-dashed border-[#2D2D2D] rounded-[32px] flex flex-col items-center justify-center gap-3 text-[#A0A0A0] hover:border-[#7B2CBF44] hover:text-[#7B2CBF] transition-all group"
                      >
                        <Camera size={32} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Máximo 1MB</span>
                      </button>
                    ) : (
                      <div className="relative rounded-[32px] overflow-hidden border-2 border-[#7B2CBF33] aspect-video">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setImagePreview(null)}
                          className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-xl text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Preview Section */}
                  <div className="pt-4 border-t border-[#2D2D2D] space-y-4">
                    <div className="flex items-center gap-2">
                      <Eye size={14} className="text-[#7B2CBF]" />
                      <span className="text-[10px] font-black uppercase text-[#A0A0A0]">Preview do Card</span>
                    </div>
                    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#7B2CBF22] p-5 rounded-[32px] pointer-events-none opacity-80">
                       <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-xs uppercase text-white truncate max-w-[150px]">{tipTitle || 'Título da Carreira'}</h4>
                            <p className="text-[8px] text-[#7B2CBF] font-bold uppercase tracking-widest mt-0.5">{team || 'Seu Time'} • {selectedGame}</p>
                          </div>
                          <div className={`${difficulty.bg} ${difficulty.color} px-3 py-1 rounded-lg text-[8px] font-black italic`}>{difficulty.label}</div>
                       </div>
                       <div className="flex flex-wrap gap-1 mt-3">
                          {selectedChallenges.length > 0 ? selectedChallenges.map(c => (
                            <span key={c} className="text-[7px] bg-white/5 px-2 py-0.5 rounded text-[#A0A0A0] font-black uppercase tracking-widest">#{c}</span>
                          )) : <span className="text-[7px] text-white/10 uppercase font-black italic">Sem desafios</span>}
                       </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#7B2CBF] text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 shadow-2xl shadow-[#7B2CBF66] relative overflow-hidden group"
                  >
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-center"></div>
                    <Send size={20} /> ENVIAR PARA ANÁLISE
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-10">
        {sections.map((section, idx) => (
          <section key={idx} className="space-y-5">
            <div className="flex items-center gap-3 px-2">
              <div className="w-1 h-4 bg-[#7B2CBF] rounded-full"></div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A0A0A0]">{section.category}</h3>
            </div>
            <div className="grid gap-5">
              {section.items.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  key={i} 
                  className="bg-[#1A1A1A] border border-[#2D2D2D] p-6 rounded-[32px] space-y-4 hover:border-[#7B2CBF44] transition-all group relative overflow-hidden active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm uppercase tracking-tight text-white group-hover:text-[#7B2CBF] transition-colors truncate">{item.t}</h4>
                        {section.category.includes('Fox') && <Crown size={12} className="text-[#7B2CBF] flex-shrink-0" />}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.category && (
                          <span className={`text-[8px] px-2 py-1 rounded-lg font-black uppercase tracking-widest border border-white/5 ${CATEGORIES.find(c => c.id === item.category)?.bg || 'bg-white/5'} ${CATEGORIES.find(c => c.id === item.category)?.color || 'text-[#A0A0A0]'}`}>
                            {item.category}
                          </span>
                        )}
                        <span className="text-[8px] px-2 py-1 rounded-lg bg-[#7B2CBF]/10 text-[#7B2CBF] font-black uppercase tracking-widest">{item.game}</span>
                        {item.team && <span className="text-[8px] px-2 py-1 rounded-lg bg-white/5 text-[#A0A0A0] font-bold uppercase tracking-widest">{item.team}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                       <div className="bg-white/5 px-2.5 py-1.5 rounded-xl flex items-center gap-2">
                          <div className="w-4 h-4 bg-white/10 rounded-lg flex items-center justify-center">
                            <User size={10} className="text-[#A0A0A0]" />
                          </div>
                          <span className="text-[8px] text-[#E0E0E0] font-black uppercase tracking-widest">{item.author}</span>
                       </div>
                       <span className="text-[7px] text-[#555] block mt-1.5 uppercase font-black tracking-widest">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {item.challenges.map(c => (
                      <span key={c} className="text-[7px] bg-[#7B2CBF]/5 border border-[#7B2CBF22] px-2 py-0.5 rounded text-[#7B2CBF] font-black uppercase tracking-widest">#{c}</span>
                    ))}
                  </div>

                  <p className="text-xs text-[#A0A0A0] leading-relaxed italic border-l-2 border-[#7B2CBF22] pl-4 py-1 font-medium bg-black/10 rounded-r-xl">"{item.d}"</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => acceptChallenge(item)}
                      className="bg-[#7B2CBF]/10 hover:bg-[#7B2CBF] text-[#7B2CBF] hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-[#7B2CBF22]"
                    >
                      <Sparkles size={12} /> Aceitar Desafio
                    </button>
                  </div>

                  {item.img && (
                    <div className="relative h-40 rounded-2xl overflow-hidden border border-[#2D2D2D] mt-2">
                       <img src={item.img} alt="Career Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}

                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                     <Dribbble size={80} />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="bg-gradient-to-r from-[#7B2CBF22] to-transparent border border-[#7B2CBF33] p-8 rounded-[40px] relative overflow-hidden group">
        <Sparkles className="absolute top-4 right-4 text-[#7B2CBF] animate-pulse" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/5 rounded-xl">
                <Info size={18} className="text-[#7B2CBF]" />
             </div>
             <h4 className="font-black text-sm uppercase tracking-[0.2em] italic">Intel Report</h4>
          </div>
          <p className="text-xs text-[#A0A0A0] italic leading-relaxed font-medium">
            "A biblioteca é o legado dos Foxes. Compartilhe suas descobertas táticas e torne-se uma lenda do banco de reservas."
          </p>
        </div>
        <Gamepad2 size={120} className="absolute -left-10 -bottom-10 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
      </div>
    </div>
  );
}
