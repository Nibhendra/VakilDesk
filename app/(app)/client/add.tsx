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

} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../store/AuthContext';
import { Colors, ThemeColors } from '../../../constants/Colors';
import { useThemeContext } from '../../../store/ThemeContext';
import { createClient } from '../../../services/firebase/clients';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  alternatePhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddClientScreen() {
  const { isDark } = useThemeContext();
  const C = Colors[isDark ? 'dark' : 'light'];
  const s = styles(C);
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setLoading(true);
    try {
      await createClient(user.uid, {
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        alternatePhone: data.alternatePhone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        notes: data.notes || '',
      });
      Alert.alert('Success', 'Client added successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to add client.');
    } finally {
      setLoading(false);
    }
  };

  const fields: { name: keyof FormData; label: string; placeholder: string; multiline?: boolean; keyboard?: any }[] = [
    { name: 'name', label: 'Full Name *', placeholder: 'e.g. Ramesh Sharma' },
    { name: 'phone', label: 'Phone Number *', placeholder: '+91 9876543210', keyboard: 'phone-pad' },
    { name: 'email', label: 'Email Address', placeholder: 'client@example.com', keyboard: 'email-address' },
    { name: 'alternatePhone', label: 'Alternate Phone', placeholder: 'Optional', keyboard: 'phone-pad' },
    { name: 'address', label: 'Address', placeholder: 'Street address', multiline: true },
    { name: 'city', label: 'City', placeholder: 'e.g. Mumbai' },
    { name: 'state', label: 'State', placeholder: 'e.g. Maharashtra' },
    { name: 'notes', label: 'Notes', placeholder: 'Any additional notes...', multiline: true },
  ];

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        {fields.map(({ name, label, placeholder, multiline, keyboard }) => (
          <View key={name} style={s.inputGroup}>
            <Text style={s.label}>{label}</Text>
            <Controller
              control={control}
              name={name}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[s.input, multiline && s.multilineInput, errors[name] && s.inputError]}
                  placeholder={placeholder}
                  placeholderTextColor={C.textMuted}
                  keyboardType={keyboard}
                  autoCapitalize={keyboard === 'email-address' ? 'none' : 'sentences'}
                  multiline={multiline}
                  numberOfLines={multiline ? 3 : 1}
                  value={value ?? ''}
                  onChangeText={onChange}
                />
              )}
            />
            {errors[name] && <Text style={s.errorText}>{errors[name]?.message}</Text>}
          </View>
        ))}

        <TouchableOpacity
          style={[s.submitBtn, loading && s.submitBtnDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={s.submitBtnText}>Add Client</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (C: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    container: { padding: 20, paddingBottom: 48 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: C.textSecondary, marginBottom: 6 },
    input: {
      borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
      paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: C.text,
      backgroundColor: C.surfaceAlt,
    },
    multilineInput: { height: 88, textAlignVertical: 'top', paddingTop: 14 },
    inputError: { borderColor: C.error },
    errorText: { color: C.error, fontSize: 12, marginTop: 4 },
    submitBtn: {
      backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16,
      alignItems: 'center', marginTop: 8,
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  });
