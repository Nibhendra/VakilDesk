import React, { useState, useEffect } from 'react';
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
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../../store/AuthContext';
import { Colors, ThemeColors } from '../../../constants/Colors';
import { useThemeContext } from '../../../store/ThemeContext';
import { createCase } from '../../../services/firebase/cases';
import { getClients } from '../../../services/firebase/clients';
import { Client, CaseType, CaseStatus } from '../../../types';

const schema = z.object({
  title: z.string().min(3, 'Case title is required'),
  caseNumber: z.string().min(1, 'Case number is required'),
  clientId: z.string().min(1, 'Please select a client'),
  type: z.enum(['civil', 'criminal', 'family', 'corporate', 'labour', 'revenue', 'other']),
  status: z.enum(['active', 'closed', 'pending', 'dismissed', 'settled']),
  court: z.string().min(2, 'Court name is required'),
  judge: z.string().optional(),
  opposingParty: z.string().optional(),
  opposingCounsel: z.string().optional(),
  description: z.string().optional(),
  totalFees: z.string().min(1, 'Total fees required'),
  paidAmount: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CASE_TYPES: CaseType[] = ['civil', 'criminal', 'family', 'corporate', 'labour', 'revenue', 'other'];
const CASE_STATUSES: CaseStatus[] = ['active', 'pending', 'closed', 'settled', 'dismissed'];

export default function AddCaseScreen() {
  const { isDark } = useThemeContext();
  const C = Colors[isDark ? 'dark' : 'light'];
  const s = styles(C);
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [fetchingClients, setFetchingClients] = useState(true);

  useEffect(() => {
    if (!user) return;
    getClients(user.uid)
      .then(setClients)
      .finally(() => setFetchingClients(false));
  }, [user]);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'civil', status: 'active', paidAmount: '0' },
  });

  const selectedClientId = watch('clientId');

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setLoading(true);
    try {
      const selectedClient = clients.find(c => c.id === data.clientId);
      if (!selectedClient) throw new Error('Client not found');

      const totalFees = parseFloat(data.totalFees) || 0;
      const paidAmount = parseFloat(data.paidAmount || '0') || 0;

      await createCase(user.uid, {
        title: data.title,
        caseNumber: data.caseNumber,
        clientId: data.clientId,
        clientName: selectedClient.name,
        type: data.type as CaseType,
        status: data.status as CaseStatus,
        court: data.court,
        judge: data.judge || '',
        opposingParty: data.opposingParty || '',
        opposingCounsel: data.opposingCounsel || '',
        description: data.description || '',
        totalFees,
        paidAmount,
      });

      Alert.alert('Success', 'Case created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to create case.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingClients) {
    return <View style={s.loader}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        {/* Client Selection */}
        <View style={s.inputGroup}>
          <Text style={s.label}>Client *</Text>
          {clients.length === 0 ? (
            <View style={s.noClientBox}>
              <Text style={s.noClientText}>No clients found. </Text>
              <TouchableOpacity onPress={() => router.push('/(app)/client/add' as any)}>
                <Text style={s.noClientLink}>Add a client first →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Controller
              control={control}
              name="clientId"
              render={({ field: { onChange, value } }) => (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.clientScroll}>
                  {clients.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[s.clientChip, value === c.id && s.clientChipActive]}
                      onPress={() => onChange(c.id)}
                    >
                      <Text style={[s.clientChipText, value === c.id && s.clientChipTextActive]}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            />
          )}
          {errors.clientId && <Text style={s.errorText}>{errors.clientId.message}</Text>}
        </View>

        {/* Case Type */}
        <View style={s.inputGroup}>
          <Text style={s.label}>Case Type *</Text>
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <View style={s.chipRow}>
                {CASE_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[s.typeChip, value === t && s.typeChipActive]}
                    onPress={() => onChange(t)}
                  >
                    <Text style={[s.typeChipText, value === t && s.typeChipTextActive]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* Status */}
        <View style={s.inputGroup}>
          <Text style={s.label}>Status *</Text>
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <View style={s.chipRow}>
                {CASE_STATUSES.map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[s.typeChip, value === st && s.typeChipActive]}
                    onPress={() => onChange(st)}
                  >
                    <Text style={[s.typeChipText, value === st && s.typeChipTextActive]}>
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* Text Fields */}
        {[
          { name: 'title' as const, label: 'Case Title *', placeholder: 'e.g. Sharma vs State of Maharashtra' },
          { name: 'caseNumber' as const, label: 'Case Number *', placeholder: 'e.g. CRM/123/2024' },
          { name: 'court' as const, label: 'Court *', placeholder: 'e.g. District Court, Pune' },
          { name: 'judge' as const, label: 'Judge Name', placeholder: 'Optional' },
          { name: 'opposingParty' as const, label: 'Opposing Party', placeholder: 'Optional' },
          { name: 'opposingCounsel' as const, label: 'Opposing Counsel', placeholder: 'Optional' },
          { name: 'description' as const, label: 'Case Description', placeholder: 'Brief description of the case...', multiline: true },
          { name: 'totalFees' as const, label: 'Total Fees (₹) *', placeholder: '0', keyboard: 'numeric' as const },
          { name: 'paidAmount' as const, label: 'Amount Paid (₹)', placeholder: '0', keyboard: 'numeric' as const },
        ].map(({ name, label, placeholder, multiline, keyboard }) => (
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
          style={[s.submitBtn, loading && s.btnDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.submitBtnText}>Create Case</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (C: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
    container: { padding: 20, paddingBottom: 48 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', color: C.textSecondary, marginBottom: 8 },
    input: {
      borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
      paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: C.text,
      backgroundColor: C.surfaceAlt,
    },
    multilineInput: { height: 88, textAlignVertical: 'top', paddingTop: 14 },
    inputError: { borderColor: C.error },
    errorText: { color: C.error, fontSize: 12, marginTop: 4 },
    clientScroll: { marginTop: 4 },
    clientChip: {
      borderWidth: 1.5, borderColor: C.border, borderRadius: 20, paddingHorizontal: 14,
      paddingVertical: 8, marginRight: 8, backgroundColor: C.surfaceAlt,
    },
    clientChipActive: { backgroundColor: C.primary, borderColor: C.primary },
    clientChipText: { fontSize: 14, fontWeight: '600', color: C.textSecondary },
    clientChipTextActive: { color: '#FFF' },
    noClientBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.warningLight, borderRadius: 10, padding: 12 },
    noClientText: { fontSize: 14, color: C.warning },
    noClientLink: { fontSize: 14, color: C.warning, fontWeight: '700', textDecorationLine: 'underline' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    typeChip: {
      borderWidth: 1.5, borderColor: C.border, borderRadius: 20, paddingHorizontal: 14,
      paddingVertical: 8, backgroundColor: C.surfaceAlt,
    },
    typeChipActive: { backgroundColor: C.primary, borderColor: C.primary },
    typeChipText: { fontSize: 13, fontWeight: '600', color: C.textSecondary },
    typeChipTextActive: { color: '#FFF' },
    submitBtn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
    btnDisabled: { opacity: 0.6 },
    submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  });
