import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../store/AuthContext';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { Colors, ThemeColors } from '../../constants/Colors';
import { useThemeContext } from '../../store/ThemeContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { isDark } = useThemeContext();
  const C = Colors[isDark ? 'dark' : 'light'];
  const { signIn } = useAuth();
  const { promptAsync } = useGoogleAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
    } catch (e: any) {
      Alert.alert('Login Failed', e.message ?? 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await promptAsync();
    } catch (e: any) {
      Alert.alert('Google Sign-In Failed', e.message ?? 'Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const s = styles(C);

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        {/* Logo / Brand */}
        <View style={s.header}>
          <Image source={require('../../assets/officiallogo.png')} style={s.logoImage} />
          <Text style={s.brandName}>VakilDesk</Text>
          <Text style={s.tagline}>Your Legal Practice, Simplified</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Welcome Back</Text>
          <Text style={s.cardSubtitle}>Sign in to your account</Text>

          {/* Email */}
          <View style={s.inputGroup}>
            <Text style={s.label}>Email Address</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[s.input, errors.email ? s.inputError : null]}
                  placeholder="advocate@example.com"
                  placeholderTextColor={C.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.email && <Text style={s.errorText}>{errors.email.message}</Text>}
          </View>

          {/* Password */}
          <View style={s.inputGroup}>
            <Text style={s.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[s.input, errors.password ? s.inputError : null]}
                  placeholder="••••••••"
                  placeholderTextColor={C.textMuted}
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.password && <Text style={s.errorText}>{errors.password.message}</Text>}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={s.forgotRow}>
            <Text style={s.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[s.primaryBtn, loading && s.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={s.primaryBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or continue with</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Google Sign-In */}
          <TouchableOpacity
            style={[s.googleBtn, googleLoading && s.btnDisabled]}
            onPress={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color={C.primary} />
            ) : (
              <>
                <Text style={s.googleIcon}>G</Text>
                <Text style={s.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View style={s.footer}>
          <Text style={s.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={s.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (C: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 32 },
    logoImage: {
      width: 100,
      height: 100,
      resizeMode: 'contain',
      marginBottom: 12,
    },
    brandName: { fontSize: 30, fontWeight: '800', color: C.text, letterSpacing: 0.5 },
    tagline: { fontSize: 14, color: C.textSecondary, marginTop: 4 },
    card: {
      backgroundColor: C.card,
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 4,
      borderWidth: 1,
      borderColor: C.border,
    },
    cardTitle: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 },
    cardSubtitle: { fontSize: 14, color: C.textSecondary, marginBottom: 24 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: C.textSecondary, marginBottom: 6 },
    input: {
      borderWidth: 1.5,
      borderColor: C.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: C.text,
      backgroundColor: C.surfaceAlt,
    },
    inputError: { borderColor: C.error },
    errorText: { color: C.error, fontSize: 12, marginTop: 4 },
    forgotRow: { alignSelf: 'flex-end', marginBottom: 20 },
    forgotText: { color: C.primary, fontSize: 13, fontWeight: '600' },
    primaryBtn: {
      backgroundColor: C.primary,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      marginBottom: 16,
    },
    btnDisabled: { opacity: 0.6 },
    primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
    dividerText: { color: C.textMuted, marginHorizontal: 12, fontSize: 13 },
    googleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: C.border,
      borderRadius: 12,
      paddingVertical: 14,
      gap: 10,
    },
    googleIcon: {
      fontSize: 18,
      fontWeight: '800',
      color: '#EA4335',
    },
    googleBtnText: { fontSize: 15, fontWeight: '600', color: C.text },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    footerText: { color: C.textSecondary, fontSize: 14 },
    footerLink: { color: C.primary, fontWeight: '700', fontSize: 14 },
  });
