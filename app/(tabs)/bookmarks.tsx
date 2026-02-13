import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark, ChevronRight, BookmarkX } from 'lucide-react-native';
import { theme, difficultyColors, moduleColors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { modules } from '@/data/modules';

export default function BookmarksScreen() {
  const router = useRouter();
  const { getBookmarkedQuestions } = useData();
  const bookmarkedQuestions = getBookmarkedQuestions();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Questions</Text>
        <Text style={styles.subtitle}>
          {bookmarkedQuestions.length} question{bookmarkedQuestions.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {bookmarkedQuestions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <BookmarkX size={48} color={theme.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No saved questions yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the bookmark icon on any question to save it for later review
            </Text>
          </View>
        ) : (
          bookmarkedQuestions.map((question) => (
            <TouchableOpacity
              key={question.id}
              style={styles.questionCard}
              onPress={() => router.push(`/question/${question.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.questionHeader}>
                <View style={styles.bookmarkIcon}>
                  <Bookmark size={16} color={theme.colors.warning} fill={theme.colors.warning} />
                </View>
                <View style={styles.questionInfo}>
                  <Text style={styles.questionText} numberOfLines={2}>
                    {question.question}
                  </Text>
                  <View style={styles.metaRow}>
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
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  questionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bookmarkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(210, 153, 34, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  questionInfo: {
    flex: 1,
  },
  questionText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
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
    textTransform: 'capitalize',
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
});
