import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Layers,
  Scale,
  AlertTriangle,
  DollarSign,
  Zap,
} from 'lucide-react-native';
import { theme, moduleColors } from '@/constants/theme';
import { caseStudiesData } from '@/data/caseStudies';
import { modules } from '@/data/modules';
import { CaseStudy } from '@/types';

const levelColors: Record<string, string> = {
  senior: theme.colors.warning,
  staff: theme.colors.accent,
  principal: theme.colors.error,
};

export default function CaseStudiesScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Architecture Case Studies' }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <FileText size={28} color={theme.colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Architecture Case Studies</Text>
          <Text style={styles.headerSubtitle}>
            Real-world system design scenarios for Senior, Staff, and Principal-level interviews
          </Text>
        </View>

        {caseStudiesData.map((cs) => (
          <CaseStudyCard
            key={cs.id}
            caseStudy={cs}
            isExpanded={expandedId === cs.id}
            onToggle={() => toggleExpand(cs.id)}
          />
        ))}
      </ScrollView>
    </>
  );
}

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  isExpanded: boolean;
  onToggle: () => void;
}

function CaseStudyCard({ caseStudy, isExpanded, onToggle }: CaseStudyCardProps) {
  const module = modules.find(m => m.id === caseStudy.moduleId);
  const moduleColor = moduleColors[caseStudy.moduleId] || theme.colors.primary;
  const levelColor = levelColors[caseStudy.targetLevel] || theme.colors.textSecondary;
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.cardAccent, { backgroundColor: moduleColor }]} />
          <View style={styles.cardHeaderInfo}>
            <View style={styles.cardBadges}>
              <View style={[styles.moduleBadge, { backgroundColor: `${moduleColor}20` }]}>
                <Text style={[styles.moduleBadgeText, { color: moduleColor }]}>
                  {module?.title || caseStudy.moduleId}
                </Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: `${levelColor}20` }]}>
                <Text style={[styles.levelBadgeText, { color: levelColor }]}>
                  {caseStudy.targetLevel.charAt(0).toUpperCase() + caseStudy.targetLevel.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>{caseStudy.title}</Text>
          </View>
        </View>
        {isExpanded ? (
          <ChevronUp size={22} color={theme.colors.textMuted} />
        ) : (
          <ChevronDown size={22} color={theme.colors.textMuted} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardBody}>
          <View style={styles.problemSection}>
            <Text style={styles.problemLabel}>Problem Statement</Text>
            <Text style={styles.problemText}>{caseStudy.problemStatement}</Text>
          </View>

          <View style={styles.architectureSection}>
            <Text style={styles.architectureLabel}>Architecture</Text>
            <Text style={styles.architectureText}>{caseStudy.architectureExplanation}</Text>
          </View>

          <CollapsibleList
            title="Components"
            icon={<Layers size={16} color={theme.colors.primary} />}
            items={caseStudy.componentBreakdown}
            color={theme.colors.primary}
            expanded={expandedSections['components']}
            onToggle={() => toggleSection('components')}
          />

          <CollapsibleList
            title="Trade-offs"
            icon={<Scale size={16} color={theme.colors.accent} />}
            items={caseStudy.tradeOffs}
            color={theme.colors.accent}
            expanded={expandedSections['tradeoffs']}
            onToggle={() => toggleSection('tradeoffs')}
          />

          <CollapsibleTextSection
            title="Scalability Strategy"
            icon={<Zap size={16} color={theme.colors.success} />}
            text={caseStudy.scalabilityStrategy}
            color={theme.colors.success}
            expanded={expandedSections['scalability']}
            onToggle={() => toggleSection('scalability')}
          />

          <CollapsibleList
            title="Failure Scenarios"
            icon={<AlertTriangle size={16} color={theme.colors.error} />}
            items={caseStudy.failureScenarios}
            color={theme.colors.error}
            expanded={expandedSections['failures']}
            onToggle={() => toggleSection('failures')}
          />

          <CollapsibleList
            title="Cost Considerations"
            icon={<DollarSign size={16} color={theme.colors.warning} />}
            items={caseStudy.costConsiderations}
            color={theme.colors.warning}
            expanded={expandedSections['cost']}
            onToggle={() => toggleSection('cost')}
          />
        </View>
      )}
    </View>
  );
}

interface CollapsibleListProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  color: string;
  expanded?: boolean;
  onToggle: () => void;
}

function CollapsibleList({ title, icon, items, color, expanded, onToggle }: CollapsibleListProps) {
  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity style={styles.collapsibleHeader} onPress={onToggle}>
        <View style={styles.collapsibleTitleRow}>
          <View style={[styles.collapsibleIcon, { backgroundColor: `${color}15` }]}>
            {icon}
          </View>
          <Text style={styles.collapsibleTitle}>{title}</Text>
        </View>
        {expanded ? (
          <ChevronUp size={18} color={theme.colors.textMuted} />
        ) : (
          <ChevronDown size={18} color={theme.colors.textMuted} />
        )}
      </TouchableOpacity>
      {expanded && (
        <View style={styles.collapsibleBody}>
          {items.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={[styles.listBullet, { backgroundColor: color }]} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

interface CollapsibleTextSectionProps {
  title: string;
  icon: React.ReactNode;
  text: string;
  color: string;
  expanded?: boolean;
  onToggle: () => void;
}

function CollapsibleTextSection({ title, icon, text, color, expanded, onToggle }: CollapsibleTextSectionProps) {
  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity style={styles.collapsibleHeader} onPress={onToggle}>
        <View style={styles.collapsibleTitleRow}>
          <View style={[styles.collapsibleIcon, { backgroundColor: `${color}15` }]}>
            {icon}
          </View>
          <Text style={styles.collapsibleTitle}>{title}</Text>
        </View>
        {expanded ? (
          <ChevronUp size={18} color={theme.colors.textMuted} />
        ) : (
          <ChevronDown size={18} color={theme.colors.textMuted} />
        )}
      </TouchableOpacity>
      {expanded && (
        <View style={styles.collapsibleBody}>
          <Text style={styles.collapsibleText}>{text}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(88, 166, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardAccent: {
    width: 4,
    height: 48,
    borderRadius: 2,
    marginRight: theme.spacing.md,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardBadges: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  moduleBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  moduleBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  levelBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  levelBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    textTransform: 'capitalize' as const,
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    lineHeight: 22,
  },
  cardBody: {
    padding: theme.spacing.md,
    paddingTop: 0,
    gap: theme.spacing.md,
  },
  problemSection: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  problemLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  problemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 24,
  },
  architectureSection: {
    gap: theme.spacing.sm,
  },
  architectureLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  architectureText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 24,
  },
  collapsibleSection: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  collapsibleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  collapsibleIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsibleTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  collapsibleBody: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  collapsibleText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 24,
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
});
