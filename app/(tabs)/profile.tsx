import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Settings,
  LogOut,
  ChevronRight,
  Award,
  Target,
  BookOpen,
  Plus,
  Bookmark,
  CheckCircle,
} from 'lucide-react-native';
import { theme, moduleColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { modules } from '@/data/modules';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const { getCompletedCount, getTotalCount, getBookmarkedQuestions, userQuestions } = useData();

  const totalCompleted = getCompletedCount();
  const totalQuestions = getTotalCount();
  const bookmarkedCount = getBookmarkedQuestions().length;
  const userQuestionsCount = userQuestions.length;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const topModules = modules
    .map((module) => ({
      ...module,
      completed: getCompletedCount(module.id),
      total: getTotalCount(module.id),
    }))
    .sort((a, b) => {
      const aProgress = a.total > 0 ? a.completed / a.total : 0;
      const bProgress = b.total > 0 ? b.completed / b.total : 0;
      return bProgress - aProgress;
    })
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={32} color={theme.colors.primary} />
            </View>
          </View>
          <View style={styles.profileInfo}>
            {isAuthenticated ? (
              <>
                <Text style={styles.profileName}>
                  {profile?.displayName || user?.email?.split('@')[0] || 'User'}
                </Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>
                    {profile?.experienceLevel === 'fresher'
                      ? '🌱 Fresher'
                      : profile?.experienceLevel === 'mid'
                      ? '⚡ Mid-Level'
                      : '🚀 Senior'}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.profileName}>Guest User</Text>
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={() => router.push('/login')}
                >
                  <Text style={styles.signInButtonText}>Sign in to sync progress</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(63, 185, 80, 0.15)' }]}>
              <CheckCircle size={20} color={theme.colors.success} />
            </View>
            <Text style={styles.statValue}>{totalCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(210, 153, 34, 0.15)' }]}>
              <Bookmark size={20} color={theme.colors.warning} />
            </View>
            <Text style={styles.statValue}>{bookmarkedCount}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(163, 113, 247, 0.15)' }]}>
              <Plus size={20} color={theme.colors.accent} />
            </View>
            <Text style={styles.statValue}>{userQuestionsCount}</Text>
            <Text style={styles.statLabel}>My Questions</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(88, 166, 255, 0.15)' }]}>
              <Target size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.statValue}>
              {totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0}%
            </Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={18} color={theme.colors.warning} />
            <Text style={styles.sectionTitle}>Top Modules</Text>
          </View>

          {topModules.map((module) => {
            const progress = module.total > 0 ? (module.completed / module.total) * 100 : 0;
            const color = moduleColors[module.id] || theme.colors.primary;

            return (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleRow}
                onPress={() => router.push(`/module/${module.id}`)}
              >
                <View
                  style={[
                    styles.moduleIcon,
                    { backgroundColor: `${color}20` },
                  ]}
                >
                  <BookOpen size={16} color={color} />
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleName}>{module.title}</Text>
                  <View style={styles.moduleProgress}>
                    <View style={styles.moduleProgressBar}>
                      <View
                        style={[
                          styles.moduleProgressFill,
                          { width: `${progress}%`, backgroundColor: color },
                        ]}
                      />
                    </View>
                    <Text style={styles.moduleProgressText}>
                      {module.completed}/{module.total}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={18} color={theme.colors.textSecondary} />
            <Text style={styles.sectionTitle}>Actions</Text>
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/add-question')}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(163, 113, 247, 0.15)' }]}>
              <Plus size={18} color={theme.colors.accent} />
            </View>
            <Text style={styles.actionText}>Add Your Own Question</Text>
            <ChevronRight size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {isAuthenticated && (
            <TouchableOpacity style={styles.actionRow} onPress={handleSignOut}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(248, 81, 73, 0.15)' }]}>
                <LogOut size={18} color={theme.colors.error} />
              </View>
              <Text style={[styles.actionText, { color: theme.colors.error }]}>
                Sign Out
              </Text>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
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
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(88, 166, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  levelText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  signInButton: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  signInButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.background,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  moduleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: 6,
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
    minWidth: 40,
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  actionText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
});
