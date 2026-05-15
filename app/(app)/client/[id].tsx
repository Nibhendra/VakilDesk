import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,

  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, ThemeColors } from '../../../constants/Colors';
import { useThemeContext } from '../../../store/ThemeContext';
import { getClient } from '../../../services/firebase/clients';
import { getCasesByClient } from '../../../services/firebase/cases';
import { useAuth } from '../../../store/AuthContext';
import { Client, Case } from '../../../types';

export default function ClientDetailScreen() {
  const { isDark } = useThemeContext();
  const C = Colors[isDark ? 'dark' : 'light'];
  const s = styles(C);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id || !user) return;
      try {
        const [clientData, casesData] = await Promise.all([
          getClient(id),
          getCasesByClient(user.uid, id),
        ]);
        setClient(clientData);
        setCases(casesData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user]);

  if (loading) {
    return <View style={s.loader}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  if (!client) {
    return (
      <View style={s.loader}>
        <Text style={s.errorText}>Client not found</Text>
      </View>
    );
  }

  const InfoRow = ({ emoji, label, value }: { emoji: string; label: string; value?: string }) => {
    if (!value) return null;
    return (
      <View style={s.infoRow}>
        <Text style={s.infoEmoji}>{emoji}</Text>
        <View>
          <Text style={s.infoLabel}>{label}</Text>
          <Text style={s.infoValue}>{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={s.profileHeader}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{client.name[0]?.toUpperCase()}</Text>
        </View>
        <Text style={s.clientName}>{client.name}</Text>
        <Text style={s.clientPhone}>{client.phone}</Text>
      </View>

      {/* Stats Row */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statValue}>{client.activeCasesCount}</Text>
          <Text style={s.statLabel}>Active Cases</Text>
        </View>
        <View style={s.statCard}>
          <Text style={[s.statValue, { color: C.success }]}>₹{client.totalPaid.toLocaleString('en-IN')}</Text>
          <Text style={s.statLabel}>Total Paid</Text>
        </View>
        <View style={s.statCard}>
          <Text style={[s.statValue, { color: C.warning }]}>₹{client.totalPending.toLocaleString('en-IN')}</Text>
          <Text style={s.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Contact Info */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Contact Information</Text>
        <View style={s.infoCard}>
          <InfoRow emoji="📞" label="Phone" value={client.phone} />
          <InfoRow emoji="📱" label="Alternate" value={client.alternatePhone} />
          <InfoRow emoji="✉️" label="Email" value={client.email} />
          <InfoRow emoji="📍" label="Address" value={client.address} />
          <InfoRow emoji="🏙️" label="City" value={client.city} />
          <InfoRow emoji="🗺️" label="State" value={client.state} />
        </View>
      </View>

      {client.notes && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Notes</Text>
          <View style={s.notesCard}>
            <Text style={s.notesText}>{client.notes}</Text>
          </View>
        </View>
      )}

      {/* Cases */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Cases</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/case/add' as any)}>
            <Text style={s.addCase}>+ Add Case</Text>
          </TouchableOpacity>
        </View>
        {cases.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>No cases linked to this client</Text>
          </View>
        ) : (
          cases.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={s.caseCard}
              onPress={() => router.push(`/(app)/case/${c.id}` as any)}
            >
              <Text style={s.caseTitle}>{c.title}</Text>
              <Text style={s.caseMeta}>#{c.caseNumber} • {c.court}</Text>
              <Text style={s.caseStatus}>{c.status.toUpperCase()}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = (C: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    container: { paddingBottom: 32 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
    errorText: { color: C.error, fontSize: 16 },
    profileHeader: { alignItems: 'center', padding: 24, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    avatarText: { color: '#FFF', fontWeight: '800', fontSize: 30 },
    clientName: { fontSize: 22, fontWeight: '800', color: C.text },
    clientPhone: { fontSize: 15, color: C.textSecondary, marginTop: 4 },
    statsRow: { flexDirection: 'row', padding: 16, gap: 12 },
    statCard: { flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border },
    statValue: { fontSize: 20, fontWeight: '800', color: C.text },
    statLabel: { fontSize: 11, color: C.textSecondary, marginTop: 4 },
    section: { paddingHorizontal: 16, marginBottom: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 10 },
    infoCard: { backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border, gap: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    infoEmoji: { fontSize: 18, width: 24, textAlign: 'center' },
    infoLabel: { fontSize: 11, color: C.textMuted, fontWeight: '600' },
    infoValue: { fontSize: 14, color: C.text, fontWeight: '500', marginTop: 1 },
    notesCard: { backgroundColor: C.surfaceAlt, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
    notesText: { fontSize: 14, color: C.textSecondary, lineHeight: 20 },
    addCase: { color: C.primary, fontWeight: '700', fontSize: 14 },
    caseCard: { backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
    caseTitle: { fontSize: 14, fontWeight: '700', color: C.text },
    caseMeta: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
    caseStatus: { fontSize: 11, fontWeight: '700', color: C.primary, marginTop: 4 },
    emptyCard: { backgroundColor: C.card, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border, borderStyle: 'dashed' },
    emptyText: { color: C.textMuted, fontSize: 14 },
  });
