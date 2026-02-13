import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Terminal,
  Cloud,
  Zap,
  TrendingUp,
  Shuffle,
  ChevronRight,
  BookOpen,
  CheckCircle,
  Flame,
  AlertTriangle,
  Target,
  Play,
  FileText,
  PlusCircle,
} from 'lucide-react-native';
import { theme, difficultyColors, moduleColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { modules } from '@/data/modules';
import { Question } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const {
    getDailyQuestions,
    getRandomQuestion,
    getCompletedCount,
    getTotalCount,
    isCompleted,
    streakData,
    getOverallReadiness,
    getWeakModules,
  } = useData();
  const [dailyQuestions, setDailyQuestions] = useState<Question[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadDailyQuestions = useCallback(() => {
    const questions = getDailyQuestions(5);
    setDailyQuestions(questions);
  }, [getDailyQuestions]);

  useEffect(() => {
    loadDailyQuestions();
  }, [loadDailyQuestions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDailyQuestions();
    setRefreshing(false);
  }, [loadDailyQuestions]);

  const handleRandomQuestion = () => {
    const question = getRandomQuestion();
    if (question) {
      router.push(`/question/${question.id}`);
    }
  };

  const totalCompleted = getCompletedCount();
  const totalQuestions = getTotalCount();
  const progressPercentage = totalQuestions > 0 ? (totalCompleted / totalQuestions) * 100 : 0;
  const readiness = getOverallReadiness();
  const weakModules = getWeakModules().slice(0, 3);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getReadinessColor = (score: number) => {
    if (score >= 70) return theme.colors.success;
    if (score >= 40) return theme.colors.warning;
    return theme.colors.error;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'strong') return { color: theme.colors.success, label: 'Strong' };
    if (status === 'needs_work') return { color: theme.colors.warning, label: 'Needs Work' };
    return { color: theme.colors.error, label: 'Weak' };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Terminal size={24} color={theme.colors.primary} />
              <Cloud size={18} color={theme.colors.accent} style={styles.cloudIcon} />
            </View>
            <Text style={styles.appName}>DevOps Prep</Text>
          </View>
          <Text style={styles.greeting}>
            {greeting()}{profile?.displayName ? `, ${profile.displayName}` : ''}
          </Text>
          <Text style={styles.subtitle}>Ready to ace your interview?</Text>
        </View>

        <View style={styles.topRow}>
          <View style={styles.streakCard}>
            <Flame size={22} color="#FF6B35" />
            <Text style={styles.streakNumber}>{streakData.currentStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
            <Text style={styles.streakBest}>Best: {streakData.longestStreak}</Text>
          </View>

          <View style={styles.readinessCard}>
            <Target size={22} color={getReadinessColor(readiness.score)} />
            <Text style={[styles.readinessScore, { color: getReadinessColor(readiness.score) }]}>
              {readiness.score}%
            </Text>
            <Text style={styles.readinessLabel}>Readiness</Text>
            <View style={styles.readinessBreakdown}>
              <View style={styles.readinessDot}>
                <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
                <Text style={styles.dotLabel}>{readiness.strong}</Text>
              </View>
              <View style={styles.readinessDot}>
                <View style={[styles.dot, { backgroundColor: theme.colors.warning }]} />
                <Text style={styles.dotLabel}>{readiness.needsWork}</Text>
              </View>
              <View style={styles.readinessDot}>
                <View style={[styles.dot, { backgroundColor: theme.colors.error }]} />
                <Text style={styles.dotLabel}>{readiness.weak}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressIcon}>
              <TrendingUp size={20} color={theme.colors.success} />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Overall Progress</Text>
              <Text style={styles.progressSubtitle}>
                {totalCompleted} of {totalQuestions} questions completed
              </Text>
            </View>
            <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${Math.min(progressPercentage, 100)}%` }]} />
          </View>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={handleRandomQuestion}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(163, 113, 247, 0.15)' }]}>
              <Shuffle size={20} color={theme.colors.accent} />
            </View>
            <Text style={styles.actionTitle}>Random Q</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/mock-interview')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 107, 53, 0.15)' }]}>
              <Play size={20} color="#FF6B35" />
            </View>
            <Text style={styles.actionTitle}>Mock Interview</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/case-studies')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(88, 166, 255, 0.15)' }]}>
              <FileText size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Case Studies</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/modules')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(63, 185, 80, 0.15)' }]}>
              <BookOpen size={20} color={theme.colors.success} />
            </View>
            <Text style={styles.actionTitle}>Modules</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/create-module')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(0, 180, 216, 0.15)' }]}>
              <PlusCircle size={20} color="#00B4D8" />
            </View>
            <Text style={styles.actionTitle}>New Module</Text>
          </TouchableOpacity>
        </View>

        {weakModules.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <AlertTriangle size={18} color={theme.colors.warning} />
                <Text style={styles.sectionTitle}>Weak Areas</Text>
              </View>
            </View>

            {weakModules.map((weak) => {
              const module = modules.find(m => m.id === weak.moduleId);
              if (!module) return null;
              const statusInfo = getStatusIcon(weak.status);
              const color = moduleColors[module.id] || theme.colors.primary;

              return (
                <TouchableOpacity
                  key={module.id}
                  style={styles.weakCard}
                  onPress={() => router.push(`/module/${module.id}`)}
                >
                  <View style={[styles.weakDot, { backgroundColor: color }]} />
                  <View style={styles.weakInfo}>
                    <Text style={styles.weakTitle}>{module.title}</Text>
                    <View style={styles.weakMeta}>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                          {statusInfo.label}
                        </Text>
                      </View>
                      <Text style={styles.weakPercent}>
                        {Math.round(weak.completionRate * 100)}% done
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Zap size={18} color={theme.colors.warning} />
              <Text style={styles.sectionTitle}>Daily Practice</Text>
            </View>
            <TouchableOpacity onPress={onRefresh}>
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {dailyQuestions.map((question, index) => {
            const completed = isCompleted(question.id);
            return (
              <TouchableOpacity
                key={question.id}
                style={styles.questionCard}
                onPress={() => router.push(`/question/${question.id}`)}
              >
                <View style={styles.questionLeft}>
                  <View
                    style={[
                      styles.questionNumber,
                      completed && styles.questionNumberCompleted,
                    ]}
                  >
                    {completed ? (
                      <CheckCircle size={14} color={theme.colors.success} />
                    ) : (
                      <Text style={styles.questionNumberText}>{index + 1}</Text>
                    )}
                  </View>
                  <View style={styles.questionContent}>
                    <Text style={styles.questionText} numberOfLines={2}>
                      {question.question}
                    </Text>
                    <View style={styles.questionMeta}>
                      <View
                        style={[
                          styles.difficultyBadge,
                          { backgroundColor: `${difficultyColors[question.difficulty]}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.difficultyText,
                            { color: difficultyColors[question.difficulty] },
                          ]}
                        >
                          {question.difficulty}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.moduleBadge,
                          { backgroundColor: `${moduleColors[question.moduleId] || theme.colors.primary}15` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.moduleText,
                            { color: moduleColors[question.moduleId] || theme.colors.primary },
                          ]}
                        >
                          {modules.find(m => m.id === question.moduleId)?.title || question.moduleId}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <TouchableOpacity onPress={() => router.push('/modules')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modulesScroll}
          >
            {modules.slice(0, 5).map((module) => {
              const completed = getCompletedCount(module.id);
              const total = getTotalCount(module.id);
              const progress = total > 0 ? (completed / total) * 100 : 0;
              
              return (
                <TouchableOpacity
                  key={module.id}
                  style={styles.moduleCard}
                  onPress={() => router.push(`/module/${module.id}`)}
                >
                  <View
                    style={[
                      styles.moduleIconContainer,
                      { backgroundColor: `${moduleColors[module.id] || theme.colors.primary}20` },
                    ]}
                  >
                    <Text style={styles.moduleIcon}>
                      {module.title.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.moduleTitle} numberOfLines={1}>
                    {module.title}
                  </Text>
                  <View style={styles.moduleProgress}>
                    <View style={styles.moduleProgressBar}>
                      <View
                        style={[
                          styles.moduleProgressFill,
                          {
                            width: `${progress}%`,
                            backgroundColor: moduleColors[module.id] || theme.colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.moduleProgressText}>
                      {completed}/{total}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cloudIcon: {
    marginLeft: -6,
    marginTop: -8,
  },
  appName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  greeting: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  topRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  streakCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: theme.fontWeight.bold,
    color: '#FF6B35',
    marginTop: 4,
  },
  streakLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  streakBest: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  readinessCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  readinessScore: {
    fontSize: 28,
    fontWeight: theme.fontWeight.bold,
    marginTop: 4,
  },
  readinessLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  readinessBreakdown: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: 6,
  },
  readinessDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  progressCard: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  progressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(63, 185, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  progressSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  progressPercentage: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionCard: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  refreshText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  seeAllText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  weakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  weakDot: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: theme.spacing.md,
  },
  weakInfo: {
    flex: 1,
  },
  weakTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: 4,
  },
  weakMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  weakPercent: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  questionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionNumberCompleted: {
    backgroundColor: 'rgba(63, 185, 80, 0.15)',
  },
  questionNumberText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  questionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    textTransform: 'capitalize' as const,
  },
  moduleBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  moduleText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  modulesScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  moduleCard: {
    width: 130,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  moduleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  moduleIcon: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  moduleTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  moduleProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  moduleProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  moduleProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  moduleProgressText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
});
