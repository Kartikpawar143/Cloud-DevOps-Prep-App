import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronDown, Plus, X } from 'lucide-react-native';
import { theme, difficultyColors, moduleColors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { modules } from '@/data/modules';
import { ModuleId, DifficultyLevel } from '@/types';

const difficulties: DifficultyLevel[] = [
  'beginner',
  'intermediate',
  'advanced',
  'scenario',
  'troubleshooting',
  'architecture',
];

export default function AddQuestionScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addUserQuestion } = useData();

  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [example, setExample] = useState('');
  const [productionUseCase, setProductionUseCase] = useState('');
  const [commonMistakes, setCommonMistakes] = useState<string[]>(['']);
  const [interviewerExpects, setInterviewerExpects] = useState<string[]>(['']);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>(['']);
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [showModulePicker, setShowModulePicker] = useState(false);
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateListItem = (
    list: string[],
    setList: (list: string[]) => void,
    index: number,
    value: string
  ) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);
  };

  const addListItem = (list: string[], setList: (list: string[]) => void) => {
    setList([...list, '']);
  };

  const removeListItem = (
    list: string[],
    setList: (list: string[]) => void,
    index: number
  ) => {
    if (list.length === 1) return;
    const newList = list.filter((_, i) => i !== index);
    setList(newList);
  };

  const handleSubmit = async () => {
    if (!selectedModule) {
      Alert.alert('Error', 'Please select a module');
      return;
    }
    if (!selectedDifficulty) {
      Alert.alert('Error', 'Please select a difficulty');
      return;
    }
    if (!question.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }
    if (!explanation.trim()) {
      Alert.alert('Error', 'Please enter an explanation');
      return;
    }

    setIsSubmitting(true);
    try {
      await addUserQuestion({
        moduleId: selectedModule,
        difficulty: selectedDifficulty,
        question: question.trim(),
        explanation: explanation.trim(),
        example: example.trim() || 'No example provided',
        productionUseCase: productionUseCase.trim() || 'No production use case provided',
        commonMistakes: commonMistakes.filter((m) => m.trim()),
        interviewerExpects: interviewerExpects.filter((e) => e.trim()),
        followUpQuestions: followUpQuestions.filter((f) => f.trim()),
        keywords: keywords.filter((k) => k.trim()),
      });

      Alert.alert('Success', 'Your question has been added!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Add Question' }} />
        <View style={styles.authPrompt}>
          <Text style={styles.authPromptTitle}>Sign in required</Text>
          <Text style={styles.authPromptText}>
            Please sign in to add your own questions
          </Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Add Question' }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Question Details</Text>

            <Text style={styles.label}>Module *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowModulePicker(!showModulePicker)}
            >
              <Text
                style={[
                  styles.pickerText,
                  !selectedModule && styles.pickerPlaceholder,
                ]}
              >
                {selectedModule
                  ? modules.find((m) => m.id === selectedModule)?.title
                  : 'Select a module'}
              </Text>
              <ChevronDown size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {showModulePicker && (
              <View style={styles.pickerDropdown}>
                {modules.map((module) => (
                  <TouchableOpacity
                    key={module.id}
                    style={[
                      styles.pickerOption,
                      selectedModule === module.id && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedModule(module.id);
                      setShowModulePicker(false);
                    }}
                  >
                    <View
                      style={[
                        styles.pickerOptionDot,
                        { backgroundColor: moduleColors[module.id] || theme.colors.primary },
                      ]}
                    />
                    <Text style={styles.pickerOptionText}>{module.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Difficulty *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowDifficultyPicker(!showDifficultyPicker)}
            >
              <Text
                style={[
                  styles.pickerText,
                  !selectedDifficulty && styles.pickerPlaceholder,
                ]}
              >
                {selectedDifficulty || 'Select difficulty'}
              </Text>
              <ChevronDown size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {showDifficultyPicker && (
              <View style={styles.pickerDropdown}>
                {difficulties.map((diff) => (
                  <TouchableOpacity
                    key={diff}
                    style={[
                      styles.pickerOption,
                      selectedDifficulty === diff && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedDifficulty(diff);
                      setShowDifficultyPicker(false);
                    }}
                  >
                    <View
                      style={[
                        styles.pickerOptionDot,
                        { backgroundColor: difficultyColors[diff] },
                      ]}
                    />
                    <Text style={[styles.pickerOptionText, { textTransform: 'capitalize' }]}>
                      {diff}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Question *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={question}
              onChangeText={setQuestion}
              placeholder="Enter your interview question"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Explanation *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={explanation}
              onChangeText={setExplanation}
              placeholder="Write an interview-ready explanation"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={5}
            />

            <Text style={styles.label}>Example</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={example}
              onChangeText={setExample}
              placeholder="Provide a simple example"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Production Use Case</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={productionUseCase}
              onChangeText={setProductionUseCase}
              placeholder="Describe a real-world production use case"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>

            <ListInput
              label="Common Mistakes"
              items={commonMistakes}
              setItems={setCommonMistakes}
              placeholder="Add a common mistake"
              updateItem={updateListItem}
              addItem={addListItem}
              removeItem={removeListItem}
            />

            <ListInput
              label="What Interviewers Expect"
              items={interviewerExpects}
              setItems={setInterviewerExpects}
              placeholder="Add an expectation"
              updateItem={updateListItem}
              addItem={addListItem}
              removeItem={removeListItem}
            />

            <ListInput
              label="Follow-Up Questions"
              items={followUpQuestions}
              setItems={setFollowUpQuestions}
              placeholder="Add a follow-up question"
              updateItem={updateListItem}
              addItem={addListItem}
              removeItem={removeListItem}
            />

            <ListInput
              label="Keywords"
              items={keywords}
              setItems={setKeywords}
              placeholder="Add a keyword"
              updateItem={updateListItem}
              addItem={addListItem}
              removeItem={removeListItem}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Adding...' : 'Add Question'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

interface ListInputProps {
  label: string;
  items: string[];
  setItems: (items: string[]) => void;
  placeholder: string;
  updateItem: (
    list: string[],
    setList: (list: string[]) => void,
    index: number,
    value: string
  ) => void;
  addItem: (list: string[], setList: (list: string[]) => void) => void;
  removeItem: (
    list: string[],
    setList: (list: string[]) => void,
    index: number
  ) => void;
}

function ListInput({
  label,
  items,
  setItems,
  placeholder,
  updateItem,
  addItem,
  removeItem,
}: ListInputProps) {
  return (
    <View style={styles.listInputContainer}>
      <Text style={styles.label}>{label}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.listInputRow}>
          <TextInput
            style={[styles.input, styles.listInput]}
            value={item}
            onChangeText={(text) => updateItem(items, setItems, index, text)}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textMuted}
          />
          {items.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(items, setItems, index)}
            >
              <X size={18} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addItem(items, setItems)}
      >
        <Plus size={16} color={theme.colors.primary} />
        <Text style={styles.addButtonText}>Add {label.toLowerCase()}</Text>
      </TouchableOpacity>
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
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  authPromptTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  authPromptText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  authButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  authButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  pickerPlaceholder: {
    color: theme.colors.textMuted,
  },
  pickerDropdown: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  pickerOptionSelected: {
    backgroundColor: theme.colors.surfaceLight,
  },
  pickerOptionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pickerOptionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  listInputContainer: {
    marginBottom: theme.spacing.sm,
  },
  listInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  listInput: {
    flex: 1,
    minHeight: 48,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(248, 81, 73, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
  },
  addButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
});
