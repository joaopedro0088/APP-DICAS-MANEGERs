/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Home, Zap, Save as SaveIcon, User as UserIcon, Settings, Shield, Terminal, LogOut, Compass, Book, History, Trophy, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDocFromServer, onSnapshot } from 'firebase/firestore';
import { storage } from './store';
import { INITIAL_GEN_LISTS } from './data/generatorData';
import { User, UserRole, ImportedCareer } from './types';
import { auth, db } from './firebase';
import { GAMES } from './constants';

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
import HallOfFameView from './views/HallOfFameView';
import WeeklyEventsView from './views/WeeklyEventsView';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'generator' | 'saves' | 'profile' | 'library' | 'careers' | 'halloffame' | 'events'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isLogsView, setIsLogsView] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 8000); // 8 seconds for slower connections

    // Test connection
    const testConnection = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        // Simple reachability check
        await getDocFromServer(docRef);
        setDbStatus({ ok: true, message: 'Fox Cloud: Ativa e Segura' });
      } catch (error: any) {
        console.error("Firestore test connection error:", error);
        const errorMessage = (error.message || "").toLowerCase();
        
        // Only show error if it's explicitly a connection/offline issue
        if (errorMessage.includes('offline') || errorMessage.includes('unavailable') || errorMessage.includes('network') || errorMessage.includes('failed to connect')) {
          setDbStatus({ ok: false, message: 'Fox Cloud: Offline - Verifique sua conexão' });
        } else if (errorMessage.includes('quota') || errorMessage.includes('limit exceeded')) {
          setDbStatus({ ok: false, message: 'Fox Cloud: Limite de Uso Excedido' });
        } else if (errorMessage.includes('not-found') || errorMessage.includes('not found')) {
          // Document not found is still a connection success!
          setDbStatus({ ok: true, message: 'Fox Cloud: Ativa (Config)' });
        } else {
          // If it's a permission error (e.g. settings not seeded yet) or something else, consider it OK
          setDbStatus({ ok: true, message: 'Fox Cloud: Ativa' }); 
        }
      }
    };
    testConnection();

    let unsubUser: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Cleanup previous user listener if it exists
      if (unsubUser) {
        unsubUser();
        unsubUser = null;
      }

      try {
        if (firebaseUser) {
          // Listen to real-time updates for User
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          unsubUser = onSnapshot(userDocRef, (docSnap) => {
             if (docSnap.exists()) {
               const userData = docSnap.data() as User;
               setUser(userData);
               localStorage.setItem('fox_managers_cached_user', JSON.stringify(userData));
             }
          });

          // Seed initial generator data if empty (for new apps)
          try {
            const currentGenLists = await storage.getGenLists();
            if (currentGenLists.length === 0) {
              await storage.setGenLists(INITIAL_GEN_LISTS);
            }

            // Seed Careers (10 per game)
            const currentCareers = await storage.getImportedCareers();
            if (currentCareers.length === 0) {
              const seedCareers: ImportedCareer[] = [];
              const games = ['Football Manager', 'EA Sports FC (FIFA)', 'World Soccer Champs', 'PES 2021', 'Soccer Manager 2025'];
              
              games.forEach(game => {
                for (let i = 1; i <= 10; i++) {
                  seedCareers.push({
                    id: `seed-${game}-${i}`,
                    name: `Desafio ${i} - ${game}`,
                    game: game,
                    team: i === 1 ? 'Santos' : i === 2 ? 'Real Madrid' : i === 3 ? 'Wrexham' : `Time ${i}`,
                    difficulty: i % 3 === 0 ? 'Lendário' : i % 2 === 0 ? 'Extremo' : 'Médio',
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
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubUser) unsubUser();
      clearTimeout(safetyTimeout);
    };
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
    if (isLogsView) return <LogsView user={user} onBack={() => setIsLogsView(false)} />;
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
      case 'halloffame':
        return <HallOfFameView />;
      case 'events':
        return <WeeklyEventsView />;
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

      <header className="px-6 py-6 sm:px-8 sm:py-10 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('home')}>
          <motion.div 
            whileHover={{ rotate: 180 }}
            className="w-10 h-10 bg-gradient-to-br from-[#7B2CBF] to-[#5A189A] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-[#7B2CBF33] border border-white/10"
          >
            <Zap size={22} fill="white" className="text-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-widest uppercase italic leading-none">Fox Managers</h1>
            </div>
            <p className="text-[8px] sm:text-[10px] font-bold text-[#A0A0A0] uppercase tracking-[0.3em] mt-1">Elite Edition</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setIsLogsView(!isLogsView); setIsAdminView(false); }}
            className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-all border ${isLogsView ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white shadow-lg shadow-[#7B2CBF44]' : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#A0A0A0] hover:text-white'}`}
          >
            <History size={20} />
          </motion.button>

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

      <main className="max-w-md mx-auto relative flex-1 overflow-y-auto no-scrollbar pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogsView ? 'logs' : (isAdminView ? 'admin' : activeTab)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="px-4 pb-32 sm:px-6"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Navigation Bar - Revamped for better UX */}
      {!isAdminView && !isLogsView && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-sm z-50">
          <nav className="bg-[#1A1A1A]/90 backdrop-blur-3xl border border-white/10 p-1 rounded-[28px] sm:rounded-[32px] flex justify-around items-center shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
            <NavItem 
              active={activeTab === 'home'} 
              icon={<Home size={20} />} 
              label="Home" 
              onClick={() => setActiveTab('home')} 
            />
            <NavItem 
              active={activeTab === 'generator'} 
              icon={<Wand2 size={20} />} 
              label="Gerador" 
              onClick={() => setActiveTab('generator')} 
            />
            <NavItem 
              active={activeTab === 'events'} 
              icon={<Zap size={20} />} 
              label="Eventos" 
              onClick={() => setActiveTab('events')} 
            />
            <NavItem 
              active={activeTab === 'halloffame'} 
              icon={<Trophy size={20} />} 
              label="Lendas" 
              onClick={() => setActiveTab('halloffame')} 
            />
            <NavItem 
              active={activeTab === 'saves'} 
              icon={<SaveIcon size={20} />} 
              label="Saves" 
              onClick={() => setActiveTab('saves')} 
            />
            <div className="w-10 h-10 rounded-2xl overflow-hidden mr-1 border border-white/10 group cursor-pointer active:scale-90 transition-transform" onClick={() => setActiveTab('profile')}>
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
      className={`relative py-3 px-2 flex flex-col items-center gap-1 transition-all group ${active ? 'text-[#7B2CBF]' : 'text-[#A0A0A0] hover:text-white'}`}
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
