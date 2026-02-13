import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Cloud,
  Server,
  Database,
  Terminal,
  Network,
  Box,
  Layers,
  Code,
  Activity,
  Shield,
  ChevronRight,
  Search,
  X,
  Plus,
} from 'lucide-react-native';
import { theme, moduleColors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';


const iconMap: Record<string, any> = {
  Cloud,
  Server,
  Database,
  Terminal,
  Network,
  Box,
  Layers,
  Code,
  Activity,
  Shield,
};

export default function ModulesScreen() {
  const router = useRouter();
  const { getCompletedCount, getTotalCount, allModules } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return allModules;
    const q = searchQuery.toLowerCase();
    return allModules.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
    );
  }, [allModules, searchQuery]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Modules</Text>
            <Text style={styles.subtitle}>
              Master each topic for your interview
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/create-module')}
            activeOpacity={0.7}
          >
            <Plus size={20} color={theme.colors.background} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={16} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search modules..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filteredModules.length === 0 && (
          <View style={styles.emptyState}>
            <Search size={40} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No modules found</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        )}
        {filteredModules.map((module) => {
          const IconComponent = iconMap[module.icon] || Cloud;
          const color = moduleColors[module.id] || theme.colors.primary;
          const completed = getCompletedCount(module.id);
          const total = getTotalCount(module.id);
          const progress = total > 0 ? (completed / total) * 100 : 0;

          return (
            <TouchableOpacity
              key={module.id}
              style={styles.moduleCard}
              onPress={() => router.push(`/module/${module.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.moduleHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${color}20` },
                  ]}
                >
                  <IconComponent size={24} color={color} />
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleDescription} numberOfLines={2}>
                    {module.description}
                  </Text>
                </View>
                <ChevronRight size={22} color={theme.colors.textMuted} />
              </View>

              <View style={styles.moduleFooter}>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progress}%`, backgroundColor: color },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {completed}/{total} completed
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{total}</Text>
                    <Text style={styles.statLabel}>Questions</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color }]}>
                      {Math.round(progress)}%
                    </Text>
                    <Text style={styles.statLabel}>Progress</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
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
    paddingBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    height: '100%',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
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
    gap: theme.spacing.md,
  },
  moduleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  moduleInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  moduleTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  moduleFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
    paddingTop: theme.spacing.md,
  },
  progressContainer: {
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.surfaceBorder,
  },
});
