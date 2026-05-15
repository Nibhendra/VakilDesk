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
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../store/AuthContext';
import { Colors, ThemeColors } from '../../constants/Colors';
import { useThemeContext } from '../../store/ThemeContext';

const registerSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { isDark } = useThemeContext();
  const C = Colors[isDark ? 'dark' : 'light'];
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.displayName);
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message ?? 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const s = styles(C);

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Image source={require('../../assets/officiallogo.png')} style={s.logoImage} />
          <Text style={s.brandName}>VakilDesk</Text>
          <Text style={s.tagline}>Join the legal revolution</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Create Account</Text>
          <Text style={s.cardSubtitle}>Start managing your practice today</Text>

          {[
            { name: 'displayName' as const, label: 'Full Name', placeholder: 'Adv. Rajesh Kumar', keyboard: 'default' as const },
            { name: 'email' as const, label: 'Email Address', placeholder: 'advocate@example.com', keyboard: 'email-address' as const },
            { name: 'password' as const, label: 'Password', placeholder: '••••••••', keyboard: 'default' as const, secure: true },
            { name: 'confirmPassword' as const, label: 'Confirm Password', placeholder: '••••••••', keyboard: 'default' as const, secure: true },
          ].map(({ name, label, placeholder, keyboard, secure }) => (
            <View key={name} style={s.inputGroup}>
              <Text style={s.label}>{label}</Text>
              <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[s.input, errors[name] ? s.inputError : null]}
                    placeholder={placeholder}
                    placeholderTextColor={C.textMuted}
                    keyboardType={keyboard}
                    autoCapitalize={name === 'email' ? 'none' : 'words'}
                    secureTextEntry={secure}
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors[name] && <Text style={s.errorText}>{errors[name]?.message}</Text>}
            </View>
          ))}

          <TouchableOpacity
            style={[s.primaryBtn, loading && s.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={s.primaryBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={s.footerLink}>Sign In</Text>
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
    brandName: { fontSize: 28, fontWeight: '800', color: C.text },
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
    primaryBtn: {
      backgroundColor: C.primary,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 8,
    },
    btnDisabled: { opacity: 0.6 },
    primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    footerText: { color: C.textSecondary, fontSize: 14 },
    footerLink: { color: C.primary, fontWeight: '700', fontSize: 14 },
  });
