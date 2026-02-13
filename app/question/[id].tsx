import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Bookmark,
  CheckCircle,
  AlertCircle,
  Target,
  MessageCircle,
  Tag,
  Lightbulb,
  Building2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { theme, difficultyColors, moduleColors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { modules } from '@/data/modules';

export default function QuestionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getQuestionById,
    isBookmarked,
    isCompleted,
    toggleBookmark,
    toggleComplete,
  } = useData();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    explanation: true,
    example: true,
    production: false,
    mistakes: false,
    expects: false,
    followUp: false,
    keywords: false,
  });

  const question = getQuestionById(id || '');
  const bookmarked = isBookmarked(id || '');
  const completed = isCompleted(id || '');

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const handleBookmark = useCallback(async () => {
    if (!id) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleBookmark(id);
  }, [id, toggleBookmark]);

  const handleComplete = useCallback(async () => {
    if (!id) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleComplete(id);
  }, [id, toggleComplete]);

  if (!question) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Question' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Question not found</Text>
        </View>
      </View>
    );
  }

  const module = modules.find((m) => m.id === question.moduleId);
  const color = moduleColors[question.moduleId] || theme.colors.primary;

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <TouchableOpacity onPress={handleBookmark} style={styles.headerButton}>
              <Bookmark
                size={22}
                color={bookmarked ? theme.colors.warning : theme.colors.textSecondary}
                fill={bookmarked ? theme.colors.warning : 'transparent'}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.questionHeader}>
            <View style={styles.metaRow}>
              <View
                style={[
                  styles.moduleBadge,
                  { backgroundColor: `${color}20` },
                ]}
              >
                <Text style={[styles.moduleBadgeText, { color }]}>
                  {module?.title || question.moduleId}
                </Text>
              </View>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: `${difficultyColors[question.difficulty]}20` },
                ]}
              >
                <Text
                  style={[
                    styles.difficultyBadgeText,
                    { color: difficultyColors[question.difficulty] },
                  ]}
                >
                  {question.difficulty}
                </Text>
              </View>
            </View>
            <Text style={styles.questionText}>{question.question}</Text>
          </View>

          <View style={styles.sectionsContainer}>
            <CollapsibleSection
              title="Clear Explanation"
              icon={<Lightbulb size={18} color={theme.colors.success} />}
              expanded={expandedSections.explanation}
              onToggle={() => toggleSection('explanation')}
              accentColor={theme.colors.success}
            >
              <Text style={styles.sectionContent}>{question.explanation}</Text>
            </CollapsibleSection>

            <CollapsibleSection
              title="Simple Example"
              icon={<AlertCircle size={18} color={theme.colors.primary} />}
              expanded={expandedSections.example}
              onToggle={() => toggleSection('example')}
              accentColor={theme.colors.primary}
            >
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>{question.example}</Text>
              </View>
            </CollapsibleSection>

            <CollapsibleSection
              title="Production Use Case"
              icon={<Building2 size={18} color={theme.colors.accent} />}
              expanded={expandedSections.production}
              onToggle={() => toggleSection('production')}
              accentColor={theme.colors.accent}
            >
              <Text style={styles.sectionContent}>{question.productionUseCase}</Text>
            </CollapsibleSection>

            <CollapsibleSection
              title="Common Mistakes"
              icon={<XCircle size={18} color={theme.colors.error} />}
              expanded={expandedSections.mistakes}
              onToggle={() => toggleSection('mistakes')}
              accentColor={theme.colors.error}
            >
              {question.commonMistakes.map((mistake, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={[styles.listBullet, { backgroundColor: theme.colors.error }]} />
                  <Text style={styles.listText}>{mistake}</Text>
                </View>
              ))}
            </CollapsibleSection>

            <CollapsibleSection
              title="What Interviewers Expect"
              icon={<Target size={18} color={theme.colors.warning} />}
              expanded={expandedSections.expects}
              onToggle={() => toggleSection('expects')}
              accentColor={theme.colors.warning}
            >
              {question.interviewerExpects.map((expect, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={[styles.listBullet, { backgroundColor: theme.colors.warning }]} />
                  <Text style={styles.listText}>{expect}</Text>
                </View>
              ))}
            </CollapsibleSection>

            <CollapsibleSection
              title="Follow-Up Questions"
              icon={<MessageCircle size={18} color={theme.colors.primary} />}
              expanded={expandedSections.followUp}
              onToggle={() => toggleSection('followUp')}
              accentColor={theme.colors.primary}
            >
              {question.followUpQuestions.map((followUp, index) => (
                <View key={index} style={styles.followUpItem}>
                  <Text style={styles.followUpNumber}>{index + 1}</Text>
                  <Text style={styles.followUpText}>{followUp}</Text>
                </View>
              ))}
            </CollapsibleSection>

            <CollapsibleSection
              title="Keywords"
              icon={<Tag size={18} color={theme.colors.accentTeal} />}
              expanded={expandedSections.keywords}
              onToggle={() => toggleSection('keywords')}
              accentColor={theme.colors.accentTeal}
            >
              <View style={styles.keywordsContainer}>
                {question.keywords.map((keyword, index) => (
                  <View key={index} style={styles.keywordChip}>
                    <Text style={styles.keywordText}>{keyword}</Text>
                  </View>
                ))}
              </View>
            </CollapsibleSection>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.completeButton,
              completed && styles.completeButtonActive,
            ]}
            onPress={handleComplete}
          >
            <CheckCircle
              size={20}
              color={completed ? theme.colors.background : theme.colors.success}
            />
            <Text
              style={[
                styles.completeButtonText,
                completed && styles.completeButtonTextActive,
              ]}
            >
              {completed ? 'Completed' : 'Mark as Complete'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  accentColor: string;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  expanded,
  onToggle,
  accentColor,
  children,
}: CollapsibleSectionProps) {
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionIconContainer, { backgroundColor: `${accentColor}15` }]}>
            {icon}
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {expanded ? (
          <ChevronUp size={20} color={theme.colors.textMuted} />
        ) : (
          <ChevronDown size={20} color={theme.colors.textMuted} />
        )}
      </TouchableOpacity>
      {expanded && <View style={styles.sectionBody}>{children}</View>}
    </View>
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
    paddingBottom: 100,
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
  },
  questionHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  moduleBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  moduleBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  questionText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    lineHeight: 28,
  },
  sectionsContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  sectionBody: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  sectionContent: {
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  listBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  listText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  followUpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  followUpNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceLight,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  followUpText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  keywordsContainer: {
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
    fontWeight: theme.fontWeight.medium,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(63, 185, 80, 0.15)',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  completeButtonActive: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  completeButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
  },
  completeButtonTextActive: {
    color: theme.colors.background,
  },
});
