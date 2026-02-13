import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Terminal, Cloud, ArrowRight, Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';

type Screen = 'login' | 'forgotPassword';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, resetPassword, isLoading } = useAuth();
  const [screen, setScreen] = useState<Screen>('login');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message || 'Sign up failed');
          return;
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message || 'Sign in failed');
          return;
        }
      }
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message || 'Failed to send reset email');
      } else {
        setResetSent(true);
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  if (screen === 'forgotPassword') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                setScreen('login');
                setError('');
                setResetSent(false);
              }}
            >
              <ArrowLeft size={22} color={theme.colors.textSecondary} />
              <Text style={styles.backBtnText}>Back to login</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.resetIconContainer}>
                <Mail size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we will send you a link to reset your password
              </Text>
            </View>

            {resetSent ? (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Mail size={28} color={theme.colors.success} />
                </View>
                <Text style={styles.successTitle}>Check your email</Text>
                <Text style={styles.successText}>
                  We have sent a password reset link to{'\n'}
                  <Text style={styles.successEmail}>{email}</Text>
                </Text>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => {
                    setScreen('login');
                    setResetSent(false);
                    setError('');
                  }}
                >
                  <Text style={styles.submitButtonText}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleForgotPassword}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <ActivityIndicator color={theme.colors.background} />
                  ) : (
                    <Text style={styles.submitButtonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Terminal size={32} color={theme.colors.primary} />
              <Cloud size={24} color={theme.colors.accent} style={styles.cloudIcon} />
            </View>
            <Text style={styles.title}>DevOps Prep</Text>
            <Text style={styles.subtitle}>
              Master Cloud & DevOps interviews{'\n'}with production-grade knowledge
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {!isSignUp && (
              <TouchableOpacity
                style={styles.forgotButton}
                onPress={() => {
                  setScreen('forgotPassword');
                  setError('');
                }}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>
            )}

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.background} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                  <ArrowRight size={20} color={theme.colors.background} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
            >
              <Text style={styles.switchText}>
                {isSignUp
                  ? 'Already have an account? '
                  : "Don't have an account? "}
                <Text style={styles.switchTextHighlight}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Continue without account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>10+ modules covering Cloud & DevOps</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: theme.colors.warning }]} />
              <Text style={styles.featureText}>Mock interviews with timed sessions</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: theme.colors.accent }]} />
              <Text style={styles.featureText}>Architecture case studies for seniors</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  backBtnText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cloudIcon: {
    marginLeft: -8,
    marginTop: -12,
  },
  resetIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(88, 166, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.hero,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.borderRadius.md,
  },
  passwordInput: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  eyeButton: {
    padding: theme.spacing.md,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.md,
    marginTop: -theme.spacing.sm,
  },
  forgotText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  errorContainer: {
    backgroundColor: 'rgba(248, 81, 73, 0.1)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  submitButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  switchButton: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  switchText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  switchTextHighlight: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  skipButton: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  skipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  features: {
    gap: theme.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
  featureText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(63, 185, 80, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  successTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  successText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  successEmail: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});
