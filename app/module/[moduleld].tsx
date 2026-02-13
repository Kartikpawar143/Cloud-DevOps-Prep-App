import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import {
  ChevronRight,
  CheckCircle,
  Filter,
  BookOpen,
  Search,
  X,
} from 'lucide-react-native';
import { theme, difficultyColors, moduleColors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { modules } from '@/data/modules';
import { DifficultyLevel } from '@/types';

const difficulties: { key: DifficultyLevel | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
  { key: 'scenario', label: 'Scenario' },
  { key: 'troubleshooting', label: 'Troubleshooting' },
  { key: 'architecture', label: 'Architecture' },
];

export default function ModuleScreen() {
  const router = useRouter();
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const { getAllQuestions, searchQuestions, isCompleted, getCompletedCount, getTotalCount } = useData();
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const module = modules.find((m) => m.id === moduleId);
  const color = moduleColors[moduleId || ''] || theme.colors.primary;

  const questions = useMemo(() => {
    if (!moduleId) return [];
    
    let results = searchQuery.trim()
      ? searchQuestions(moduleId, searchQuery)
      : getAllQuestions(moduleId as any);
    
    if (selectedDifficulty !== 'all') {
      results = results.filter((q) => q.difficulty === selectedDifficulty);
    }
    return results;
  }, [moduleId, selectedDifficulty, searchQuery, getAllQuestions, searchQuestions]);

  const completedCount = getCompletedCount(moduleId as any);
  const totalCount = getTotalCount(moduleId as any);
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  if (!module) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Module' }} />
        <Text style={styles.errorText}>Module not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: module.title,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      />
      <View style={styles.container}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.moduleIcon,
                { backgroundColor: `${color}20` },
              ]}
            >
              <BookOpen size={24} color={color} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={styles.moduleDescription}>{module.description}</Text>
            </View>
          </View>
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={[styles.progressValue, { color }]}>
                {completedCount}/{totalCount}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: color },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={18} color={theme.colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search questions, keywords..."
              placeholderTextColor={theme.colors.textMuted}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Filter size={16} color={theme.colors.textSecondary} />
            <Text style={styles.filterLabel}>Filter by difficulty</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {difficulties.map((diff) => {
              const isSelected = selectedDifficulty === diff.key;
              const badgeColor =
                diff.key === 'all'
                  ? theme.colors.primary
                  : difficultyColors[diff.key];

              return (
                <TouchableOpacity
                  key={diff.key}
                  style={[
                    styles.filterChip,
                    isSelected && { backgroundColor: `${badgeColor}25`, borderColor: badgeColor },
                  ]}
                  onPress={() => setSelectedDifficulty(diff.key)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && { color: badgeColor },
                    ]}
                  >
                    {diff.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultCount}>
            {questions.length} question{questions.length !== 1 ? 's' : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </Text>

          {questions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No questions match your search' : 'No questions found'}
              </Text>
            </View>
          ) : (
            questions.map((question, index) => {
              const completed = isCompleted(question.id);
              return (
                <TouchableOpacity
                  key={question.id}
                  style={styles.questionCard}
                  onPress={() => router.push(`/question/${question.id}`)}
                  activeOpacity={0.7}
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
                    </View>
                  </View>
                  <ChevronRight size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
    paddingTop: theme.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  searchSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    height: '100%',
  },
  filterSection: {
    paddingTop: theme.spacing.md,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  filterLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  filterChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  resultCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
    marginTop: theme.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  emptyState: {
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
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
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    textTransform: 'capitalize' as const,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
