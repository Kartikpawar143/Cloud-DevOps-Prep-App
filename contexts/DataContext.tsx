import { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question, Module, UserProgress, ModuleId, DifficultyLevel, StreakData, ModuleReadiness, WeakAreaStatus } from '@/types';
import { useAuth } from './AuthContext';
import { questionsData } from '@/data/questions';
import { modules } from '@/data/modules';

const getDateString = (date: Date = new Date()) => {
  return date.toISOString().split('T')[0];
};

export const [DataProvider, useData] = createContextHook(() => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    practiceHistory: [],
  });
  const [customModules, setCustomModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const allModules = [...modules, ...customModules];

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setUserProgress([]);
      setUserQuestions([]);
      setCustomModules([]);
      setStreakData({ currentStreak: 0, longestStreak: 0, lastPracticeDate: null, practiceHistory: [] });
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [progressData, questionsResult, streakResult, modulesResult] = await Promise.all([
        AsyncStorage.getItem(`progress_${user.id}`),
        AsyncStorage.getItem(`user_questions_${user.id}`),
        AsyncStorage.getItem(`streak_${user.id}`),
        AsyncStorage.getItem(`custom_modules_${user.id}`),
      ]);
      
      if (progressData) {
        setUserProgress(JSON.parse(progressData));
      }
      if (questionsResult) {
        setUserQuestions(JSON.parse(questionsResult));
      }
      if (streakResult) {
        setStreakData(JSON.parse(streakResult));
      }
      if (modulesResult) {
        setCustomModules(JSON.parse(modulesResult));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recordPractice = useCallback(async () => {
    if (!user) return;
    const today = getDateString();
    
    setStreakData(prev => {
      if (prev.practiceHistory.includes(today)) return prev;

      const yesterday = getDateString(new Date(Date.now() - 86400000));
      const isConsecutive = prev.lastPracticeDate === yesterday || prev.lastPracticeDate === today;
      const newStreak = isConsecutive ? prev.currentStreak + 1 : 1;
      const newData: StreakData = {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, prev.longestStreak),
        lastPracticeDate: today,
        practiceHistory: [...prev.practiceHistory.slice(-90), today],
      };

      AsyncStorage.setItem(`streak_${user.id}`, JSON.stringify(newData));
      return newData;
    });
  }, [user]);

  const getAllQuestions = useCallback((moduleId?: ModuleId, difficulty?: DifficultyLevel) => {
    let questions = [...questionsData, ...userQuestions];
    
    if (moduleId) {
      questions = questions.filter(q => q.moduleId === moduleId);
    }
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty);
    }
    
    return questions;
  }, [userQuestions]);

  const searchQuestions = useCallback((moduleId: ModuleId, query: string) => {
    const allQuestions = getAllQuestions(moduleId);
    if (!query.trim()) return allQuestions;
    
    const lowerQuery = query.toLowerCase();
    return allQuestions.filter(q =>
      q.question.toLowerCase().includes(lowerQuery) ||
      q.keywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
      q.difficulty.toLowerCase().includes(lowerQuery)
    );
  }, [getAllQuestions]);

  const getQuestionById = useCallback((id: string): Question | undefined => {
    return [...questionsData, ...userQuestions].find(q => q.id === id);
  }, [userQuestions]);

  const toggleBookmark = async (questionId: string) => {
    if (!user) return;
    
    const existing = userProgress.find(p => p.questionId === questionId);
    let newProgress: UserProgress[];
    
    if (existing) {
      newProgress = userProgress.map(p => 
        p.questionId === questionId 
          ? { ...p, isBookmarked: !p.isBookmarked }
          : p
      );
    } else {
      const newEntry: UserProgress = {
        id: `${user.id}_${questionId}`,
        userId: user.id,
        questionId,
        isCompleted: false,
        isBookmarked: true,
      };
      newProgress = [...userProgress, newEntry];
    }
    
    setUserProgress(newProgress);
    await AsyncStorage.setItem(`progress_${user.id}`, JSON.stringify(newProgress));
  };

  const toggleComplete = async (questionId: string) => {
    if (!user) return;
    
    const existing = userProgress.find(p => p.questionId === questionId);
    let newProgress: UserProgress[];
    
    if (existing) {
      newProgress = userProgress.map(p => 
        p.questionId === questionId 
          ? { ...p, isCompleted: !p.isCompleted, completedAt: !p.isCompleted ? new Date().toISOString() : undefined }
          : p
      );
    } else {
      const newEntry: UserProgress = {
        id: `${user.id}_${questionId}`,
        userId: user.id,
        questionId,
        isCompleted: true,
        isBookmarked: false,
        completedAt: new Date().toISOString(),
      };
      newProgress = [...userProgress, newEntry];
    }
    
    setUserProgress(newProgress);
    await AsyncStorage.setItem(`progress_${user.id}`, JSON.stringify(newProgress));
    await recordPractice();
  };

  const addUserQuestion = async (question: Omit<Question, 'id' | 'isUserCreated' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    const newQuestion: Question = {
      ...question,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isUserCreated: true,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    
    const newQuestions = [...userQuestions, newQuestion];
    setUserQuestions(newQuestions);
    await AsyncStorage.setItem(`user_questions_${user.id}`, JSON.stringify(newQuestions));
    
    return newQuestion;
  };

  const updateUserQuestion = async (id: string, updates: Partial<Question>) => {
    if (!user) return;
    
    const newQuestions = userQuestions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    );
    setUserQuestions(newQuestions);
    await AsyncStorage.setItem(`user_questions_${user.id}`, JSON.stringify(newQuestions));
  };

  const deleteUserQuestion = async (id: string) => {
    if (!user) return;
    
    const newQuestions = userQuestions.filter(q => q.id !== id);
    setUserQuestions(newQuestions);
    await AsyncStorage.setItem(`user_questions_${user.id}`, JSON.stringify(newQuestions));
  };

  const isBookmarked = useCallback((questionId: string) => {
    return userProgress.find(p => p.questionId === questionId)?.isBookmarked ?? false;
  }, [userProgress]);

  const isCompleted = useCallback((questionId: string) => {
    return userProgress.find(p => p.questionId === questionId)?.isCompleted ?? false;
  }, [userProgress]);

  const getBookmarkedQuestions = useCallback(() => {
    const bookmarkedIds = userProgress.filter(p => p.isBookmarked).map(p => p.questionId);
    return [...questionsData, ...userQuestions].filter(q => bookmarkedIds.includes(q.id));
  }, [userProgress, userQuestions]);

  const getCompletedCount = useCallback((moduleId?: ModuleId) => {
    const completedIds = userProgress.filter(p => p.isCompleted).map(p => p.questionId);
    let questions = [...questionsData, ...userQuestions];
    if (moduleId) {
      questions = questions.filter(q => q.moduleId === moduleId);
    }
    return questions.filter(q => completedIds.includes(q.id)).length;
  }, [userProgress, userQuestions]);

  const getTotalCount = useCallback((moduleId?: ModuleId) => {
    let questions = [...questionsData, ...userQuestions];
    if (moduleId) {
      questions = questions.filter(q => q.moduleId === moduleId);
    }
    return questions.length;
  }, [userQuestions]);

  const getRandomQuestion = useCallback(() => {
    const allQuestions = [...questionsData, ...userQuestions];
    return allQuestions[Math.floor(Math.random() * allQuestions.length)];
  }, [userQuestions]);

  const getDailyQuestions = useCallback((count: number = 5) => {
    const allQuestions = [...questionsData, ...userQuestions];
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, [userQuestions]);

  const addCustomModule = async (module: Omit<Module, 'questionCount'>) => {
    if (!user) return;
    const newModule: Module = { ...module, questionCount: 0 };
    const updated = [...customModules, newModule];
    setCustomModules(updated);
    await AsyncStorage.setItem(`custom_modules_${user.id}`, JSON.stringify(updated));
    console.log('Custom module added:', newModule.id);
    return newModule;
  };

  const deleteCustomModule = async (moduleId: ModuleId) => {
    if (!user) return;
    const updated = customModules.filter(m => m.id !== moduleId);
    setCustomModules(updated);
    await AsyncStorage.setItem(`custom_modules_${user.id}`, JSON.stringify(updated));
    console.log('Custom module deleted:', moduleId);
  };

  const getModuleReadiness = useCallback((): ModuleReadiness[] => {
    return allModules.map(module => {
      const moduleQuestions = [...questionsData, ...userQuestions].filter(q => q.moduleId === module.id);
      const total = moduleQuestions.length;
      if (total === 0) {
        return { moduleId: module.id, status: 'weak' as WeakAreaStatus, completionRate: 0, bookmarkRate: 0, skippedCount: 0 };
      }

      const completedIds = userProgress.filter(p => p.isCompleted).map(p => p.questionId);
      const bookmarkedIds = userProgress.filter(p => p.isBookmarked).map(p => p.questionId);
      
      const completed = moduleQuestions.filter(q => completedIds.includes(q.id)).length;
      const bookmarked = moduleQuestions.filter(q => bookmarkedIds.includes(q.id)).length;
      
      const completionRate = completed / total;
      const bookmarkRate = bookmarked / total;

      let status: WeakAreaStatus = 'weak';
      if (completionRate >= 0.7) {
        status = 'strong';
      } else if (completionRate >= 0.3) {
        status = 'needs_work';
      }

      return {
        moduleId: module.id,
        status,
        completionRate,
        bookmarkRate,
        skippedCount: 0,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProgress, userQuestions, customModules]);

  const getWeakModules = useCallback(() => {
    return getModuleReadiness()
      .filter(m => m.status === 'weak' || m.status === 'needs_work')
      .sort((a, b) => a.completionRate - b.completionRate);
  }, [getModuleReadiness]);

  const getOverallReadiness = useCallback(() => {
    const readiness = getModuleReadiness();
    const strong = readiness.filter(r => r.status === 'strong').length;
    const needsWork = readiness.filter(r => r.status === 'needs_work').length;
    const weak = readiness.filter(r => r.status === 'weak').length;
    const total = readiness.length;
    const score = total > 0 ? Math.round(((strong * 1 + needsWork * 0.5) / total) * 100) : 0;
    return { strong, needsWork, weak, score };
  }, [getModuleReadiness]);

  const getMockInterviewQuestions = useCallback((moduleIds: ModuleId[], count: number, experienceLevel?: string) => {
    let pool = [...questionsData, ...userQuestions];
    
    if (moduleIds.length > 0) {
      pool = pool.filter(q => moduleIds.includes(q.moduleId));
    }

    if (experienceLevel === 'fresher') {
      pool = pool.filter(q => ['beginner', 'intermediate'].includes(q.difficulty));
    } else if (experienceLevel === 'mid') {
      pool = pool.filter(q => ['intermediate', 'advanced', 'scenario'].includes(q.difficulty));
    } else if (experienceLevel === 'senior') {
      pool = pool.filter(q => ['advanced', 'scenario', 'troubleshooting', 'architecture'].includes(q.difficulty));
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, [userQuestions]);

  return {
    isLoading,
    userProgress,
    userQuestions,
    streakData,
    getAllQuestions,
    searchQuestions,
    getQuestionById,
    toggleBookmark,
    toggleComplete,
    addUserQuestion,
    updateUserQuestion,
    deleteUserQuestion,
    isBookmarked,
    isCompleted,
    getBookmarkedQuestions,
    getCompletedCount,
    getTotalCount,
    getRandomQuestion,
    getDailyQuestions,
    getModuleReadiness,
    getWeakModules,
    getOverallReadiness,
    getMockInterviewQuestions,
    recordPractice,
    allModules,
    customModules,
    addCustomModule,
    deleteCustomModule,
  };
});
