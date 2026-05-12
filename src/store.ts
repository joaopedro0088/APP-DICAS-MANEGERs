/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  Timestamp,
  orderBy,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { User, Save, AppLog, GeneratorItem, UserRole, Report, UserStats, OfficialChallenge, ImportedCareer, CommunityTip, LibraryIdea, AppSettings, PromoCode, WeeklyEvent, HallOfFameEntry } from './types';
import { LIMITS } from './constants';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  
  // Log to backend audit
  const logId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  setDoc(doc(db, 'logs', logId), {
    id: logId,
    user: auth.currentUser?.email || 'Sistema',
    text: `Falha em ${operationType} em ${path}: ${errInfo.error}`,
    title: 'Erro de Sistema',
    type: 'error',
    timestamp: Date.now(),
    details: errInfo
  }).catch(e => console.error("Critical Failure: Could not even log the error.", e));

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const storage = {
  // SETTINGS
  getAppSettings: async (): Promise<AppSettings> => {
    const DEFAULT_SETTINGS: AppSettings = {
      generatorActive: true,
      uploadsAllowed: true,
      logsPublic: true,
      reportsEnabled: true,
      dailySaveLimit: 1,
      dailyGenLimit: 10,
      theme: 'default',
      language: 'pt',
      vibration: true,
      sounds: true,
      animations: true,
      economyMode: false,
      managedEras: ['Rebuild', 'Time Pequeno', 'Sem Dinheiro', 'Jovens/Promessas', 'Desafio Difícil', 'Longa Duração', 'Carreira Curta'],
      managedGames: ['Football Manager', 'World Soccer Champs', 'EA Sports FC (FIFA)', 'PES 2021 ps4 e pc(com mods de 2026 elenco atualizado)', 'Soccer Manager 2025', 'Fottball manager 2021 touch atualizado'],
      managedDifficulties: ['Fácil', 'Médio', 'Difícil', 'Lendário', 'Extremo']
    };

    try {
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as AppSettings : DEFAULT_SETTINGS;
    } catch (error) {
      console.warn('Failed to fetch settings from Firestore, using defaults.', error);
      return DEFAULT_SETTINGS;
    }
  },

  setAppSettings: async (settings: AppSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    }
  },

  // USERS
  getUsers: async (): Promise<User[]> => {
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return [];
    }
  },

  getUser: async (uid: string): Promise<User | null> => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as User : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  },

  setUsers: async (users: User[]) => {
    // Note: In Firestore we usually set one by one, but this is a bridge
    for (const user of users) {
      await storage.setCurrentUser(user);
    }
  },
  
  deleteUser: async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    }
  },

  // SAVES
  getSaves: async (userId?: string): Promise<Save[]> => {
    try {
      const path = 'saves';
      let q = query(collection(db, path), orderBy('createdAt', 'desc'));
      if (userId) {
        q = query(collection(db, path), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Save);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'saves');
      return [];
    }
  },

  addSave: async (save: Save) => {
    try {
      await setDoc(doc(db, 'saves', save.id), save);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `saves/${save.id}`);
    }
  },

  updateSave: async (save: Save) => {
    try {
      await setDoc(doc(db, 'saves', save.id), save);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `saves/${save.id}`);
    }
  },

  setSaves: async (saves: Save[]) => {
    for (const save of saves) {
      await storage.addSave(save);
    }
  },

  deleteSave: async (saveId: string) => {
    try {
      await deleteDoc(doc(db, 'saves', saveId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `saves/${saveId}`);
    }
  },
  
  // LOGS
  getLogs: async (): Promise<AppLog[]> => {
    try {
      const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as AppLog);
    } catch (error) {
      console.warn('Could not fetch logs by timestamp, trying date...', error);
      try {
        const q2 = query(collection(db, 'logs'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q2);
        return querySnapshot.docs.map(doc => doc.data() as any);
      } catch (e) {
        return [];
      }
    }
  },

  addLog: async (log: Partial<AppLog>) => {
    try {
      const id = log.id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const fullLog: AppLog = {
        id,
        user: log.user || auth.currentUser?.email || 'Sistema',
        text: log.text || 'Ação do sistema',
        type: log.type || 'info',
        timestamp: log.timestamp || Date.now(),
        ...log
      };
      await setDoc(doc(db, 'logs', id), fullLog);
    } catch (error) {
      console.error('Error adding log:', error);
    }
  },

  setLogs: async (logs: AppLog[]) => {
    // If empty list, we might want to clear logs (for debug/reset)
    if (logs.length === 0) {
      // In a real app we'd probably call a cloud function or batch delete
      // Here just to clear local UI if it's set locally
      return;
    }
    for (const log of logs) {
      await storage.addLog(log);
    }
  },
  
  // GEN LISTS
  getGenLists: async (): Promise<GeneratorItem[]> => {
    try {
      const q = query(collection(db, 'generator_lists'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as GeneratorItem);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'generator_lists');
      return [];
    }
  },

  setGenLists: async (lists: GeneratorItem[]) => {
    for (const list of lists) {
      await setDoc(doc(db, 'generator_lists', list.id), list);
    }
  },
  
  // OFFICIAL CHALLENGES
  getOfficialChallenges: async (): Promise<OfficialChallenge[]> => {
    try {
      const q = query(collection(db, 'official_challenges'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as OfficialChallenge);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'official_challenges');
      return [];
    }
  },

  setOfficialChallenges: async (challenges: OfficialChallenge[]) => {
    for (const challenge of challenges) {
      await setDoc(doc(db, 'official_challenges', challenge.id), challenge);
    }
  },

  // LIBRARY IDEAS
  getLibraryIdeas: async (): Promise<LibraryIdea[]> => {
    try {
      const q = query(collection(db, 'library_ideas'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as LibraryIdea);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'library_ideas');
      return [];
    }
  },

  setLibraryIdeas: async (ideas: LibraryIdea[]) => {
    for (const idea of ideas) {
      await setDoc(doc(db, 'library_ideas', idea.id), idea);
    }
  },

  // COMMUNITY TIPS
  getCommunityTips: async (): Promise<CommunityTip[]> => {
    try {
      const q = query(collection(db, 'community_tips'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as CommunityTip);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'community_tips');
      return [];
    }
  },

  setCommunityTips: async (tips: CommunityTip[]) => {
    for (const tip of tips) {
      await setDoc(doc(db, 'community_tips', tip.id), tip);
    }
  },

  updateCommunityTip: async (tipId: string, updates: Partial<CommunityTip>) => {
    try {
      await updateDoc(doc(db, 'community_tips', tipId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `community_tips/${tipId}`);
    }
  },

  deleteCommunityTip: async (tipId: string) => {
    try {
      await deleteDoc(doc(db, 'community_tips', tipId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `community_tips/${tipId}`);
    }
  },

  // REPORTS
  getReports: async (): Promise<Report[]> => {
    try {
      const q = query(collection(db, 'reports'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Report);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'reports');
      return [];
    }
  },

  addReport: async (report: Report) => {
    try {
      await setDoc(doc(db, 'reports', report.id), report);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `reports/${report.id}`);
    }
  },

  deleteReport: async (reportId: string) => {
    try {
      await deleteDoc(doc(db, 'reports', reportId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reports/${reportId}`);
    }
  },

  // IMPORTED CAREERS
  getImportedCareers: async (): Promise<ImportedCareer[]> => {
    try {
      const q = query(collection(db, 'imported_careers'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as ImportedCareer);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'imported_careers');
      return [];
    }
  },

  addImportedCareer: async (career: ImportedCareer) => {
    try {
      await setDoc(doc(db, 'imported_careers', career.id), career);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `imported_careers/${career.id}`);
    }
  },

  updateImportedCareer: async (careerId: string, updates: Partial<ImportedCareer>) => {
    try {
      await updateDoc(doc(db, 'imported_careers', careerId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `imported_careers/${careerId}`);
    }
  },

  deleteImportedCareer: async (careerId: string) => {
    try {
      await deleteDoc(doc(db, 'imported_careers', careerId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `imported_careers/${careerId}`);
    }
  },

  setImportedCareers: async (careers: ImportedCareer[]) => {
    for (const career of careers) {
      await storage.addImportedCareer(career);
    }
  },

  // PROMO CODES
  getCodes: async (): Promise<PromoCode[]> => {
    try {
      const q = query(collection(db, 'codes'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as PromoCode);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'codes');
      return [];
    }
  },

  addCode: async (code: PromoCode) => {
    try {
      await setDoc(doc(db, 'codes', code.id), code);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `codes/${code.id}`);
    }
  },

  deleteCode: async (codeId: string) => {
    try {
      await deleteDoc(doc(db, 'codes', codeId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `codes/${codeId}`);
    }
  },

  redeemCode: async (userId: string, codeId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const docRef = doc(db, 'codes', codeId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, message: 'Código inválido ou inexistente' };
      }

      const codeData = docSnap.data() as PromoCode;
      const user = await storage.getUser(userId);

      if (!user) return { success: false, message: 'Usuário não encontrado' };
      if (user.usedCodes?.includes(codeId)) {
        return { success: false, message: 'Você já resgatou este código' };
      }

      if (codeData.uses >= codeData.maxUses) {
        return { success: false, message: 'Este código atingiu o limite de usos' };
      }

      if (codeData.expiresAt && Date.now() > codeData.expiresAt) {
        return { success: false, message: 'Este código expirou' };
      }

      // Apply effects
      const updates: Partial<User> = {
        usedCodes: [...(user.usedCodes || []), codeId]
      };

      if (codeData.type === 'badge') {
        if (!user.badges.includes(codeData.value)) {
          updates.badges = [...user.badges, codeData.value];
        }
      } else if (codeData.type === 'role') {
        updates.role = codeData.value as UserRole;
      } else if (codeData.type === 'level') {
        updates.level = (user.level || 0) + parseInt(codeData.value);
      } else if (codeData.type === 'status') {
        // Just adding a badge as proof of status
        if (!user.badges.includes(codeData.value)) {
          updates.badges = [...user.badges, codeData.value];
        }
      }

      await storage.updateUser(userId, updates);
      await updateDoc(docRef, { uses: codeData.uses + 1 });

      return { success: true, message: `Sucesso! Você ativou: ${codeData.value}` };
    } catch (error) {
      console.error('Redeem error:', error);
      return { success: false, message: 'Erro ao processar o resgate' };
    }
  },

  // WEEKLY EVENTS
  getWeeklyEvents: async (): Promise<WeeklyEvent[]> => {
    try {
      const q = query(collection(db, 'weekly_events'), orderBy('startDate', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as WeeklyEvent);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'weekly_events');
      return [];
    }
  },

  addWeeklyEvent: async (event: WeeklyEvent) => {
    try {
      await setDoc(doc(db, 'weekly_events', event.id), event);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `weekly_events/${event.id}`);
    }
  },

  deleteWeeklyEvent: async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'weekly_events', eventId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `weekly_events/${eventId}`);
    }
  },

  // HALL OF FAME
  getHallOfFame: async (): Promise<HallOfFameEntry[]> => {
    try {
      const q = query(collection(db, 'hall_of_fame'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as HallOfFameEntry);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'hall_of_fame');
      return [];
    }
  },

  addToHallOfFame: async (entry: HallOfFameEntry) => {
    try {
      await setDoc(doc(db, 'hall_of_fame', entry.id), entry);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `hall_of_fame/${entry.id}`);
    }
  },

  deleteFromHallOfFame: async (entryId: string) => {
    try {
      await deleteDoc(doc(db, 'hall_of_fame', entryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `hall_of_fame/${entryId}`);
    }
  },

  // AUTH
  resetPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'E-mail de redefinição enviado com sucesso!' };
    } catch (error: any) {
      console.error('Reset error:', error);
      let message = 'Erro ao enviar e-mail de redefinição.';
      if (error.code === 'auth/user-not-found') message = 'Usuário não encontrado.';
      if (error.code === 'auth/invalid-email') message = 'E-mail inválido.';
      return { success: false, message };
    }
  },

  addXP: async (userId: string, amount: number) => {
    try {
      const user = await storage.getUser(userId);
      if (!user) return;

      const newXP = (user.xp || 0) + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      
      const updates: Partial<User> = { xp: newXP };
      if (newLevel > (user.level || 1)) {
        updates.level = newLevel;
        await storage.addLog({
          user: user.email,
          text: `Subiu para o Nível ${newLevel}! 🦊🔥`,
          type: 'info',
          title: 'Level Up!'
        });
      }

      await storage.updateUser(userId, updates);
    } catch (error) {
      console.error('XP Error:', error);
    }
  },

  addBadge: async (userId: string, badgeName: string) => {
    try {
      const user = await storage.getUser(userId);
      if (!user || user.badges.includes(badgeName)) return;

      const updatedBadges = [...user.badges, badgeName];
      await storage.updateUser(userId, { badges: updatedBadges });
      await storage.addXP(userId, 500); // 500 XP for each new badge
      
      await storage.addLog({
        user: user.email,
        text: `Conquistou a medalha: ${badgeName}! 🏅`,
        type: 'info',
        title: 'Nova Conquista!'
      });
    } catch (error) {
      console.error('Badge Error:', error);
    }
  },

  getCurrentUser: (): User | null => {
    // This is synchronous in the original store, but Firebase is async.
    // We'll rely on App.tsx to manage the reactive state.
    const saved = localStorage.getItem('fox_managers_cached_user');
    return saved ? JSON.parse(saved) : null;
  },

  setCurrentUser: async (user: User) => {
    try {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
      localStorage.setItem('fox_managers_cached_user', JSON.stringify(user));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
    }
  },

  updateUser: async (userId: string, updates: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
      // If updating current user, sync localStorage
      const current = storage.getCurrentUser();
      if (current && current.id === userId) {
        localStorage.setItem('fox_managers_cached_user', JSON.stringify({ ...current, ...updates }));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  },

  getUserStats: (userId: string): UserStats => {
    const allStats = JSON.parse(localStorage.getItem('fox_managers_user_stats') || '{}');
    const defaultStats: UserStats = {
      generationsToday: 0,
      lastGenerationDate: '',
      savesCreatedThisMonth: 0,
      lastSaveDate: '',
    };
    return allStats[userId] || defaultStats;
  },

  updateUserStats: (userId: string, stats: Partial<UserStats>) => {
    const allStats = JSON.parse(localStorage.getItem('fox_managers_user_stats') || '{}');
    allStats[userId] = { ...storage.getUserStats(userId), ...stats };
    localStorage.setItem('fox_managers_user_stats', JSON.stringify(allStats));
  },

  logout: async () => {
    localStorage.removeItem('fox_managers_cached_user');
    await auth.signOut();
  },
};

