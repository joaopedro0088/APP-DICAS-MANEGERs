/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Home, Zap, Save as SaveIcon, User as UserIcon, Settings, Shield, Terminal, LogOut, Compass, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';
import { storage } from './store';
import { User, UserRole, ImportedCareer } from './types';
import { auth, db } from './firebase';

// Views
import HomeView from './views/HomeView';
import GeneratorView from './views/GeneratorView';
import SavesView from './views/SavesView';
import ProfileView from './views/ProfileView';
import AdminDashboard from './views/AdminDashboard';
import LogsView from './views/LogsView';
import LibraryView from './views/LibraryView';
import LoginView from './views/LoginView';
import CareersDiscoveryView from './views/CareersDiscoveryView';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'generator' | 'saves' | 'profile' | 'library' | 'careers'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isLogsView, setIsLogsView] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'settings', 'global'));
        setDbStatus({ ok: true, message: 'Fox Cloud: Ativa e Segura' });
      } catch (error: any) {
        if (error.message?.includes('offline')) {
          setDbStatus({ ok: false, message: 'Sem conexão com o banco' });
        } else {
          setDbStatus({ ok: true, message: 'Fox Cloud: Ativa' }); // If it's a permission error, it's still "active"
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await storage.getUser(firebaseUser.uid);
        if (userData) {
          setUser(userData);
          localStorage.setItem('fox_managers_cached_user', JSON.stringify(userData));
        } else {
          // Profile might not exist yet if just signed up
          const cached = storage.getCurrentUser();
          if (cached && cached.id === firebaseUser.uid) {
            setUser(cached);
          }
        }

        // Seed initial generator data if empty (for new apps)
        try {
          const currentGenLists = await storage.getGenLists();
          if (currentGenLists.length === 0) {
            await storage.setGenLists([
              {
                id: 'football-manager',
                game: 'Football Manager',
                teams: [
                  'Schalke 04|Alemanha|Médio|Rebuild',
                  'Sunderland|Inglaterra|Médio|Rebuild',
                  'Paris FC|França|Pequeno|Desafio Extremo',
                  'Deportivo La Coruña|Espanha|Médio|Rebuild',
                  'Como|Itália|Médio|Normal',
                  'Estrela da Amadora|Portugal|Pequeno|Sem Dinheiro',
                  'Wimbledon|Inglaterra|Pequeno|Base/Youth',
                  'Notts County|Inglaterra|Pequeno|Normal',
                  'Santos|Brasil|Grande|Rebuild',
                  'Palermo|Itália|Médio|Rebuild'
                ],
                objectives: ['Vencer a Champions League', 'Ter 70% do time da base', 'Ser o time com mais gols na liga', 'Vencer a Copa Nacional', 'Subir de divisão no 1º ano'],
                rules: ['Apenas contratações sub-23', 'Apenas jogadores nacionais', 'Vender qualquer jogador com oferta do dobro do valor', 'Não usar empréstimos', 'Limite salarial de 1M/mês'],
                styles: ['Gegenpress', 'Tiki-Taka', 'Catenaccio', 'Contra-Ataque Direto', 'Posicional']
              },
              {
                id: 'ea-sports-fc',
                game: 'EA Sports FC (FIFA)',
                teams: [
                  'Wrexhan|Inglaterra|Pequeno|Normal',
                  'Malaga|Espanha|Médio|Rebuild',
                  'Bordeaux|França|Médio|Rebuild',
                  'Monza|Itália|Pequeno|Normal',
                  'Moreirense|Portugal|Pequeno|Normal',
                  'Inter Miami|Outros|Grande|Normal',
                  'Al-Nassr|Outros|Grande|Normal',
                  'Union Berlin|Alemanha|Médio|Normal',
                  'Luton Town|Inglaterra|Pequeno|Desafio Extremo',
                  'RB Leipzig|Alemanha|Grande|Base/Youth'
                ],
                objectives: ['Ganhar a Tríplice Coroa', 'Desenvolver um craque 90+', 'Ter o estádio sempre lotado', 'Vencer o rival local', 'Não sofrer gols em 15 jogos'],
                rules: ['Nenhuma contratação na 1ª janela', 'Apenas jogadores livres', 'Apenas trocas de jogadores', 'Máximo 3 estrangeiros', 'Apenas olheiros da base'],
                styles: ['4-3-3 Ofensivo', '3-5-2 Murado', '4-4-2 Clássico', '4-2-3-1 Moderno', '5-3-2 Retranca']
              },
              {
                id: 'world-soccer-champs',
                game: 'World Soccer Champs',
                teams: [
                  'Ibiza|Espanha|Pequeno|Sem Dinheiro',
                  'Salford City|Inglaterra|Pequeno|Normal',
                  'Chaves|Portugal|Pequeno|Normal',
                  'Parma|Itália|Médio|Rebuild',
                  'St. Etienne|França|Médio|Rebuild',
                  'Vasco da Gama|Brasil|Grande|Rebuild',
                  'Sporting Braga|Portugal|Grande|Normal',
                  'Darmstadt|Alemanha|Pequeno|Desafio Extremo',
                  'Plymouth Argyle|Inglaterra|Pequeno|Normal',
                  'Como 1907|Itália|Pequeno|Normal'
                ],
                objectives: ['Vencer o mundial de clubes', 'Ser campeão invicto', 'Ter o artilheiro da liga', 'Reformar o CT ao máximo', 'Ganhar 5 títulos seguidos'],
                rules: ['Vender jogadores acima de 30 anos', 'Apenas jogadores da América do Sul', 'Não renovar contratos acima de 3 anos', 'Apenas 1 craque no time', 'Time 100% jovem'],
                styles: ['Ataque Total', 'Defesa Sólida', 'Jogo pelas Pontas', 'Meio Campo Forte', 'Bola Parada']
              },
              {
                id: 'soccer-manager-25',
                game: 'Soccer Manager 2025',
                teams: [
                   'Sunderland|Inglaterra|Médio|Rebuild',
                   'QPR|Inglaterra|Médio|Rebuild',
                   'Middlesbrough|Inglaterra|Médio|Normal',
                   'Hamburger SV|Alemanha|Grande|Rebuild',
                   'Hertha Berlin|Alemanha|Médio|Rebuild',
                   'Bari|Itália|Médio|Normal',
                   'Levante|Espanha|Médio|Normal',
                   'Auxerre|França|Médio|Rebuild',
                   'Vitória de Guimarães|Portugal|Grande|Normal',
                   'Sport Recife|Brasil|Médio|Normal'
                ],
                objectives: ['Alcançar status continental', 'Dobrar o valor do clube', 'Revelar 5 promessas', 'Vencer a Liga 1', 'Construir um novo estádio'],
                rules: ['Saldo de transferências positivo', 'Salários em dia', 'Apenas jogadores da liga nacional', 'Sem contratar nomes famosos', 'Apenas base'],
                styles: ['Tudo ou Nada', 'Park the Bus', 'Wing Play', 'Direct', 'Positional']
              }
            ]);
          }

          // Seed Careers (10 per game)
          const currentCareers = await storage.getImportedCareers();
          if (currentCareers.length === 0) {
            const seedCareers: ImportedCareer[] = [];
            const games = ['FIFA 23', 'FC 24', 'FC 25', 'Football Manager'];
            
            games.forEach(game => {
              for (let i = 1; i <= 10; i++) {
                seedCareers.push({
                  id: `seed-${game}-${i}`,
                  name: `Desafio ${i} - ${game}`,
                  game: game,
                  team: i === 1 ? 'Santos' : i === 2 ? 'Real Madrid' : i === 3 ? 'Wrexham' : `Time ${i}`,
                  difficulty: i % 3 === 0 ? 'Lendário' : i % 2 === 0 ? 'Difícil' : 'Médio',
                  category: i % 2 === 0 ? 'Rebuild' : 'Longa Duração',
                  country: 'Vários',
                  league: 'Várias',
                  objective: `Objetivo principal para o desafio ${i} no ${game}.`,
                  rules: 'Sem gastar mais de 50M, Usar base, Vencer liga em 3 anos',
                  style: 'Varia',
                  description: `Uma jornada épica começando com o pé direito no ${game}.`,
                  type: i % 2 === 0 ? 'Official' : 'Special',
                  status: 'published',
                  published: true,
                  featured: i === 1,
                  authorId: 'system',
                  createdAt: Date.now()
                });
              }
            });
            await storage.setImportedCareers(seedCareers);
          }
        } catch (e) {
          console.warn("Seeding failed", e);
        }
      } else {
        setUser(null);
        localStorage.removeItem('fox_managers_cached_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#7B2CBF] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginView onLogin={setUser} />
        {dbStatus && !dbStatus.ok && (
          <div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-bounce z-[999]">
            <p className="text-[10px] font-black uppercase text-red-500 tracking-widest">{dbStatus.message}</p>
          </div>
        )}
      </>
    );
  }

  const renderContent = () => {
    if (isLogsView) return <LogsView onBack={() => setIsLogsView(false)} />;
    if (isAdminView && user && user.role !== UserRole.USER) {
      return <AdminDashboard user={user} onBack={() => setIsAdminView(false)} />;
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeView 
            onGenerate={() => setActiveTab('generator')} 
            onSeeSaves={() => setActiveTab('saves')}
            onSeeLogs={() => setIsLogsView(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        );
      case 'generator':
        return <GeneratorView />;
      case 'saves':
        return <SavesView />;
      case 'careers':
        return <CareersDiscoveryView />;
      case 'library':
        return <LibraryView />;
      case 'profile':
        return (
          <ProfileView 
            user={user} 
            onOpenAdmin={() => setIsAdminView(true)}
            onOpenLogs={() => setIsLogsView(true)}
            onOpenSettings={() => setShowSettings(true)}
            onLogout={() => {
              storage.logout();
              setUser(null);
            }}
          />
        );
      default:
        return <HomeView 
          onGenerate={() => setActiveTab('generator')} 
          onSeeSaves={() => setActiveTab('saves')} 
          onSeeLogs={() => setIsLogsView(true)} 
          onOpenSettings={() => setShowSettings(true)}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-sans selection:bg-[#7B2CBF] selection:text-white pb-32">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7B2CBF]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#9D4EDD]/5 blur-[120px] rounded-full"></div>
      </div>

      <header className="px-8 py-10 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('home')}>
          <motion.div 
            whileHover={{ rotate: 180 }}
            className="w-10 h-10 bg-gradient-to-br from-[#7B2CBF] to-[#5A189A] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7B2CBF33] border border-white/10"
          >
            <Zap size={22} fill="white" className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-black tracking-widest uppercase italic leading-none">Fox Managers</h1>
            <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-[0.3em] mt-1">Elite Edition</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user && user.role !== UserRole.USER && (
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAdminView(!isAdminView)}
              className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-all border ${isAdminView ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white shadow-lg shadow-[#7B2CBF44]' : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#A0A0A0] hover:text-white'}`}
            >
              <Shield size={20} />
            </motion.button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogsView ? 'logs' : (isAdminView ? 'admin' : activeTab)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="px-6"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Navigation Bar - Revamped for better UX */}
      {!isAdminView && !isLogsView && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
          <nav className="bg-[#1A1A1A]/80 backdrop-blur-2xl border border-white/10 p-2 rounded-[32px] flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <NavItem 
              active={activeTab === 'home'} 
              icon={<Home size={20} />} 
              label="Home" 
              onClick={() => setActiveTab('home')} 
            />
            <NavItem 
              active={activeTab === 'generator'} 
              icon={<Zap size={20} />} 
              label="Gerar" 
              onClick={() => setActiveTab('generator')} 
            />
            <NavItem 
              active={activeTab === 'library'} 
              icon={<Book size={20} />} 
              label="Ideias" 
              onClick={() => setActiveTab('library')} 
            />
            <NavItem 
              active={activeTab === 'saves'} 
              icon={<SaveIcon size={20} />} 
              label="Saves" 
              onClick={() => setActiveTab('saves')} 
            />
            <div className="w-10 h-10 rounded-2xl overflow-hidden ml-1 border border-white/10 group cursor-pointer active:scale-90 transition-transform" onClick={() => setActiveTab('profile')}>
              <img 
                src={user?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} 
                className={`w-full h-full object-cover transition-opacity ${activeTab === 'profile' ? 'opacity-100 ring-2 ring-[#7B2CBF]' : 'opacity-40 group-hover:opacity-100'}`} 
                alt="Profile"
              />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

function NavItem({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`relative py-3 px-4 flex flex-col items-center gap-1.5 transition-all group ${active ? 'text-[#7B2CBF]' : 'text-[#A0A0A0] hover:text-white'}`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      {active && (
        <motion.div 
          layoutId="tab-underline"
          className="absolute -top-1 w-1 h-4 bg-[#7B2CBF] rounded-full shadow-[0_0_10px_rgba(123,44,191,0.5)]" 
        />
      )}
      <span className={`text-[8px] font-black uppercase tracking-widest transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {label}
      </span>
    </button>
  );
}
