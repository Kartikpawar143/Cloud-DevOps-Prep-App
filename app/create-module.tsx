import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
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
  Cpu,
  Globe,
  Lock,
  Wifi,
  HardDrive,
  Check,
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';

const ICON_OPTIONS = [
  { name: 'Cloud', component: Cloud },
  { name: 'Server', component: Server },
  { name: 'Database', component: Database },
  { name: 'Terminal', component: Terminal },
  { name: 'Network', component: Network },
  { name: 'Box', component: Box },
  { name: 'Layers', component: Layers },
  { name: 'Code', component: Code },
  { name: 'Activity', component: Activity },
  { name: 'Shield', component: Shield },
  { name: 'Cpu', component: Cpu },
  { name: 'Globe', component: Globe },
  { name: 'Lock', component: Lock },
  { name: 'Wifi', component: Wifi },
  { name: 'HardDrive', component: HardDrive },
];

const COLOR_OPTIONS = [
  '#58A6FF',
  '#FF9900',
  '#0078D4',
  '#FCC624',
  '#00B4D8',
  '#2496ED',
  '#326CE5',
  '#7B42BC',
  '#E6522C',
  '#D63384',
  '#3FB950',
  '#FF6B35',
  '#14B8A6',
  '#F43F5E',
  '#8B5CF6',
];

export default function CreateModuleScreen() {
  const router = useRouter();
  const { addCustomModule } = useData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Cloud');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a module title.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a module description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const moduleId = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      await addCustomModule({
        id: `custom-${moduleId}-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        icon: selectedIcon,
      });

      console.log('Module created successfully:', title);
      router.back();
    } catch (error) {
      console.log('Error creating module:', error);
      Alert.alert('Error', 'Failed to create module. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const SelectedIconComponent =
    ICON_OPTIONS.find((i) => i.name === selectedIcon)?.component || Cloud;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'New Module',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleCreate}
              disabled={isSubmitting}
              style={[
                styles.headerCreateBtn,
                (!title.trim() || !description.trim()) && styles.headerCreateBtnDisabled,
              ]}
            >
              <Text
                style={[
                  styles.headerCreateText,
                  (!title.trim() || !description.trim()) && styles.headerCreateTextDisabled,
                ]}
              >
                Create
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.previewCard}>
          <View
            style={[
              styles.previewIcon,
              { backgroundColor: `${selectedColor}20` },
            ]}
          >
            <SelectedIconComponent size={28} color={selectedColor} />
          </View>
          <Text style={styles.previewTitle}>
            {title.trim() || 'Module Name'}
          </Text>
          <Text style={styles.previewDesc} numberOfLines={2}>
            {description.trim() || 'Module description goes here'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. CI/CD Pipelines"
            placeholderTextColor={theme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={50}
            autoFocus
          />
          <Text style={styles.charCount}>{title.length}/50</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Briefly describe this module's focus area..."
            placeholderTextColor={theme.colors.textMuted}
            value={description}
            onChangeText={setDescription}
            maxLength={150}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/150</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconGrid}>
            {ICON_OPTIONS.map((icon) => {
              const IconComp = icon.component;
              const isSelected = selectedIcon === icon.name;
              return (
                <TouchableOpacity
                  key={icon.name}
                  style={[
                    styles.iconOption,
                    isSelected && {
                      borderColor: selectedColor,
                      backgroundColor: `${selectedColor}15`,
                    },
                  ]}
                  onPress={() => setSelectedIcon(icon.name)}
                  activeOpacity={0.7}
                >
                  <IconComp
                    size={20}
                    color={isSelected ? selectedColor : theme.colors.textSecondary}
                  />
                  {isSelected && (
                    <View
                      style={[
                        styles.iconCheck,
                        { backgroundColor: selectedColor },
                      ]}
                    >
                      <Check size={8} color={theme.colors.background} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorGrid}>
            {COLOR_OPTIONS.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    isSelected && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                  activeOpacity={0.7}
                >
                  {isSelected && (
                    <Check size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: selectedColor },
            isSubmitting && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>
            {isSubmitting ? 'Creating...' : 'Create Module'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerCreateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  headerCreateBtnDisabled: {
    backgroundColor: theme.colors.surfaceLight,
  },
  headerCreateText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  headerCreateTextDisabled: {
    color: theme.colors.textMuted,
  },
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.xl,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  previewTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  previewDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  textArea: {
    minHeight: 80,
    paddingTop: theme.spacing.md,
  },
  charCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'right' as const,
    marginTop: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
  },
  iconCheck: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  createButton: {
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
});
