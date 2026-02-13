import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Play,
  Clock,
  Eye,
  CheckCircle,
  SkipForward,
  X,
  Zap,
} from 'lucide-react-native';
import { theme, difficultyColors, moduleColors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { modules } from '@/data/modules';
import { Question, ModuleId } from '@/types';

type Phase = 'setup' | 'interview' | 'results';
type Duration = 30 | 45 | 60;

const DURATIONS: { value: Duration; label: string; questions: number }[] = [
  { value: 30, label: '30 min', questions: 8 },
  { value: 45, label: '45 min', questions: 12 },
  { value: 60, label: '60 min', questions: 16 },
];

export default function MockInterviewScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { getMockInterviewQuestions, recordPractice } = useData();

  const [phase, setPhase] = useState<Phase>('setup');
  const [duration, setDuration] = useState<Duration>(30);
  const [selectedModules, setSelectedModules] = useState<ModuleId[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            setPhase('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerActive]);

  const toggleModule = useCallback((moduleId: ModuleId) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  }, []);

  const startInterview = useCallback(() => {
    const config = DURATIONS.find(d => d.value === duration);
    const count = config?.questions || 8;
    const level = profile?.experienceLevel;
    const interviewQuestions = getMockInterviewQuestions(selectedModules, count, level);

    if (interviewQuestions.length === 0) {
      return;
    }

    setQuestions(interviewQuestions);
    setCurrentIndex(0);
    setShowAnswer(false);
    setAnsweredCount(0);
    setSkippedCount(0);
    setTimeRemaining(duration * 60);
    setIsTimerActive(true);
    setPhase('interview');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [duration, selectedModules, profile, getMockInterviewQuestions]);

  const handleRevealAnswer = useCallback(() => {
    setShowAnswer(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleAnswered = useCallback(() => {
    setAnsweredCount(prev => prev + 1);
    recordPractice();
    goToNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordPractice]);

  const handleSkip = useCallback(() => {
    setSkippedCount(prev => prev + 1);
    goToNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setIsTimerActive(false);
      setPhase('results');
    }
  }, [currentIndex, questions.length, fadeAnim]);

  const endInterview = useCallback(() => {
    setIsTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('results');
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];

  if (phase === 'setup') {
    return (
      <>
        <Stack.Screen options={{ title: 'Mock Interview' }} />
        <ScrollView style={styles.container} contentContainerStyle={styles.setupContent}>
          <View style={styles.setupHeader}>
            <View style={styles.setupIconContainer}>
              <Play size={32} color="#FF6B35" />
            </View>
            <Text style={styles.setupTitle}>Mock Interview</Text>
            <Text style={styles.setupSubtitle}>
              Simulate real interview pressure with timed sessions
            </Text>
          </View>

          <View style={styles.setupSection}>
            <Text style={styles.setupLabel}>Duration</Text>
            <View style={styles.durationRow}>
              {DURATIONS.map(d => (
                <TouchableOpacity
                  key={d.value}
                  style={[
                    styles.durationCard,
                    duration === d.value && styles.durationCardActive,
                  ]}
                  onPress={() => setDuration(d.value)}
                >
                  <Clock size={18} color={duration === d.value ? '#FF6B35' : theme.colors.textMuted} />
                  <Text style={[styles.durationText, duration === d.value && styles.durationTextActive]}>
                    {d.label}
                  </Text>
                  <Text style={styles.durationQuestions}>{d.questions} Qs</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.setupSection}>
            <Text style={styles.setupLabel}>
              Modules {selectedModules.length > 0 ? `(${selectedModules.length} selected)` : '(all if none selected)'}
            </Text>
            <View style={styles.modulesGrid}>
              {modules.map(m => {
                const isSelected = selectedModules.includes(m.id);
                const color = moduleColors[m.id] || theme.colors.primary;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.moduleChip,
                      isSelected && { backgroundColor: `${color}20`, borderColor: color },
                    ]}
                    onPress={() => toggleModule(m.id)}
                  >
                    <Text style={[styles.moduleChipText, isSelected && { color }]}>
                      {m.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.setupSection}>
            <Text style={styles.setupLabel}>Experience Level</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>
                {profile?.experienceLevel === 'fresher' ? 'Fresher (Beginner-Intermediate Qs)' :
                 profile?.experienceLevel === 'mid' ? 'Mid-Level (Intermediate-Advanced Qs)' :
                 profile?.experienceLevel === 'senior' ? 'Senior (Advanced-Architecture Qs)' :
                 'All Levels'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startInterview}>
            <Play size={20} color={theme.colors.background} />
            <Text style={styles.startButtonText}>Start Interview</Text>
          </TouchableOpacity>
        </ScrollView>
      </>
    );
  }

  if (phase === 'results') {
    return (
      <>
        <Stack.Screen options={{ title: 'Results', headerLeft: () => null }} />
        <ScrollView style={styles.container} contentContainerStyle={styles.resultsContent}>
          <View style={styles.resultsHeader}>
            <CheckCircle size={48} color={theme.colors.success} />
            <Text style={styles.resultsTitle}>Interview Complete</Text>
            <Text style={styles.resultsSubtitle}>
              {timeRemaining === 0 ? 'Time is up!' : 'All questions attempted'}
            </Text>
          </View>

          <View style={styles.resultsGrid}>
            <View style={styles.resultCard}>
              <Text style={[styles.resultValue, { color: theme.colors.success }]}>{answeredCount}</Text>
              <Text style={styles.resultLabel}>Answered</Text>
            </View>
            <View style={styles.resultCard}>
              <Text style={[styles.resultValue, { color: theme.colors.warning }]}>{skippedCount}</Text>
              <Text style={styles.resultLabel}>Skipped</Text>
            </View>
            <View style={styles.resultCard}>
              <Text style={[styles.resultValue, { color: theme.colors.primary }]}>{questions.length}</Text>
              <Text style={styles.resultLabel}>Total</Text>
            </View>
          </View>

          <View style={styles.resultAccuracy}>
            <Text style={styles.resultAccuracyLabel}>Completion Rate</Text>
            <Text style={styles.resultAccuracyValue}>
              {questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0}%
            </Text>
            <View style={styles.resultAccuracyBar}>
              <View
                style={[
                  styles.resultAccuracyFill,
                  { width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` },
                ]}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setPhase('setup')}
          >
            <Zap size={20} color={theme.colors.background} />
            <Text style={styles.startButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerLeft: () => (
            <TouchableOpacity onPress={endInterview} style={styles.headerBtn}>
              <X size={22} color={theme.colors.error} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.timerContainer}>
              <Clock size={16} color={timeRemaining < 120 ? theme.colors.error : theme.colors.textSecondary} />
              <Text style={[
                styles.timerText,
                timeRemaining < 120 && { color: theme.colors.error },
              ]}>
                {formatTime(timeRemaining)}
              </Text>
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.interviewProgress}>
          <Text style={styles.interviewCounter}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
          <View style={styles.interviewProgressBar}>
            <View
              style={[
                styles.interviewProgressFill,
                { width: `${((currentIndex + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {currentQuestion && (
          <Animated.View style={[styles.interviewContent, { opacity: fadeAnim }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.interviewScrollContent}>
              <View style={styles.interviewMeta}>
                <View style={[styles.interviewModuleBadge, { backgroundColor: `${moduleColors[currentQuestion.moduleId] || theme.colors.primary}20` }]}>
                  <Text style={[styles.interviewModuleText, { color: moduleColors[currentQuestion.moduleId] || theme.colors.primary }]}>
                    {modules.find(m => m.id === currentQuestion.moduleId)?.title || currentQuestion.moduleId}
                  </Text>
                </View>
                <View style={[styles.interviewDiffBadge, { backgroundColor: `${difficultyColors[currentQuestion.difficulty]}20` }]}>
                  <Text style={[styles.interviewDiffText, { color: difficultyColors[currentQuestion.difficulty] }]}>
                    {currentQuestion.difficulty}
                  </Text>
                </View>
              </View>

              <Text style={styles.interviewQuestion}>{currentQuestion.question}</Text>

              {!showAnswer ? (
                <TouchableOpacity style={styles.revealButton} onPress={handleRevealAnswer}>
                  <Eye size={20} color={theme.colors.primary} />
                  <Text style={styles.revealButtonText}>Reveal Answer</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.answerContainer}>
                  <View style={styles.answerSection}>
                    <Text style={styles.answerLabel}>Explanation</Text>
                    <Text style={styles.answerText}>{currentQuestion.explanation}</Text>
                  </View>
                  <View style={styles.answerSection}>
                    <Text style={styles.answerLabel}>Example</Text>
                    <View style={styles.codeBlock}>
                      <Text style={styles.codeText}>{currentQuestion.example}</Text>
                    </View>
                  </View>
                  <View style={styles.answerSection}>
                    <Text style={styles.answerLabel}>Keywords</Text>
                    <View style={styles.keywordsRow}>
                      {currentQuestion.keywords.map((kw, i) => (
                        <View key={i} style={styles.keywordChip}>
                          <Text style={styles.keywordText}>{kw}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        )}

        <View style={styles.interviewFooter}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <SkipForward size={18} color={theme.colors.warning} />
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.answeredBtn, !showAnswer && styles.answeredBtnDisabled]}
            onPress={handleAnswered}
            disabled={!showAnswer}
          >
            <CheckCircle size={18} color={showAnswer ? theme.colors.background : theme.colors.textMuted} />
            <Text style={[styles.answeredBtnText, !showAnswer && styles.answeredBtnTextDisabled]}>
              Answered
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  setupContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  setupHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  setupIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  setupTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  setupSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  setupSection: {
    marginBottom: theme.spacing.xl,
  },
  setupLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  durationRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  durationCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    gap: 4,
  },
  durationCardActive: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  durationText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  durationTextActive: {
    color: '#FF6B35',
  },
  durationQuestions: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  moduleChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  moduleChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  levelBadge: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  levelBadgeText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: '#FF6B35',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  startButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  headerBtn: {
    padding: theme.spacing.sm,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  timerText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
  interviewProgress: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  interviewCounter: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  interviewProgressBar: {
    height: 4,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  interviewProgressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  interviewContent: {
    flex: 1,
  },
  interviewScrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  interviewMeta: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  interviewModuleBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  interviewModuleText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  interviewDiffBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  interviewDiffText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    textTransform: 'capitalize' as const,
  },
  interviewQuestion: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    lineHeight: 30,
    marginBottom: theme.spacing.xl,
  },
  revealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(88, 166, 255, 0.12)',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  revealButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  answerContainer: {
    gap: theme.spacing.lg,
  },
  answerSection: {
    gap: theme.spacing.sm,
  },
  answerLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  answerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 24,
  },
  codeBlock: {
    backgroundColor: theme.colors.codeBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.codeBorder,
  },
  codeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  keywordChip: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  keywordText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  interviewFooter: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  skipBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(210, 153, 34, 0.12)',
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  skipBtnText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.warning,
  },
  answeredBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.success,
  },
  answeredBtnDisabled: {
    backgroundColor: theme.colors.surfaceLight,
  },
  answeredBtnText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  answeredBtnTextDisabled: {
    color: theme.colors.textMuted,
  },
  resultsContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    alignItems: 'center',
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  resultsTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  resultsSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  resultsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    width: '100%',
  },
  resultCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  resultValue: {
    fontSize: 28,
    fontWeight: theme.fontWeight.bold,
  },
  resultLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  resultAccuracy: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.xl,
  },
  resultAccuracyLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  resultAccuracyValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
    marginBottom: theme.spacing.md,
  },
  resultAccuracyBar: {
    height: 8,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  resultAccuracyFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: 4,
  },
  backButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  backButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
