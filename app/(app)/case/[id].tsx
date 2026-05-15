import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,

} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, ThemeColors } from '../../../constants/Colors';
import { useThemeContext } from '../../../store/ThemeContext';
import { getCase } from '../../../services/firebase/cases';
import { getHearingsByCase } from '../../../services/firebase/hearings';
import { getPaymentsByCase } from '../../../services/firebase/payments';
import { Case, Hearing, Payment } from '../../../types';

export default function CaseDetailScreen() {
  const { isDark } = useThemeContext();
  const C = Colors[isDark ? 'dark' : 'light'];
  const s = styles(C);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        const [c, h, p] = await Promise.all([
          getCase(id),
          getHearingsByCase(id),
          getPaymentsByCase(id),
        ]);
        setCaseData(c);
        setHearings(h);
        setPayments(p);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return <View style={s.loader}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  if (!caseData) {
    return <View style={s.loader}><Text style={{ color: C.error }}>Case not found</Text></View>;
  }

  const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    active: { bg: '#DCFCE7', text: '#16A34A' },
    pending: { bg: '#FEF3C7', text: '#D97706' },
    closed: { bg: '#E2E8F0', text: '#475569' },
    dismissed: { bg: '#FEE2E2', text: '#DC2626' },
    settled: { bg: '#DBEAFE', text: '#2563EB' },
  };

  const sc = STATUS_COLORS[caseData.status] || STATUS_COLORS.active;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={s.headerCard}>
        <View style={s.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.caseTitle}>{caseData.title}</Text>
            <Text style={s.caseNumber}>#{caseData.caseNumber}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[s.statusText, { color: sc.text }]}>{caseData.status.toUpperCase()}</Text>
          </View>
        </View>
        <View style={s.metaRow}>
          <Text style={s.metaItem}>👤 {caseData.clientName}</Text>
          <Text style={s.metaItem}>⚖️ {caseData.type}</Text>
        </View>
        <Text style={s.court}>🏛️ {caseData.court}</Text>
        {caseData.judge && <Text style={s.metaText}>👨‍⚖️ {caseData.judge}</Text>}
      </View>

      {/* Financial Summary */}
      <View style={s.financeRow}>
        <View style={[s.financeCard, { borderColor: C.border }]}>
          <Text style={s.financeValue}>₹{caseData.totalFees.toLocaleString('en-IN')}</Text>
          <Text style={s.financeLabel}>Total Fees</Text>
        </View>
        <View style={[s.financeCard, { borderColor: C.success }]}>
          <Text style={[s.financeValue, { color: C.success }]}>₹{caseData.paidAmount.toLocaleString('en-IN')}</Text>
          <Text style={s.financeLabel}>Paid</Text>
        </View>
        <View style={[s.financeCard, { borderColor: C.warning }]}>
          <Text style={[s.financeValue, { color: C.warning }]}>₹{caseData.pendingAmount.toLocaleString('en-IN')}</Text>
          <Text style={s.financeLabel}>Pending</Text>
        </View>
      </View>

      {/* Description */}
      {caseData.description && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Description</Text>
          <View style={s.descCard}>
            <Text style={s.descText}>{caseData.description}</Text>
          </View>
        </View>
      )}

      {/* Hearings */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Hearings ({hearings.length})</Text>
        {hearings.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>No hearings recorded</Text>
          </View>
        ) : (
          hearings.map((h) => (
            <View key={h.id} style={s.hearingCard}>
              <View style={s.hearingDate}>
                <Text style={s.dateDay}>{h.date.toDate().getDate()}</Text>
                <Text style={s.dateMonth}>{h.date.toDate().toLocaleString('en-IN', { month: 'short' })}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.hearingStatus}>{h.status.toUpperCase()}</Text>
                {h.notes && <Text style={s.hearingNotes}>{h.notes}</Text>}
                {h.time && <Text style={s.hearingTime}>🕐 {h.time}</Text>}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Payments */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Payment History ({payments.length})</Text>
        {payments.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>No payments recorded</Text>
          </View>
        ) : (
          payments.map((p) => (
            <View key={p.id} style={s.paymentCard}>
              <View>
                <Text style={s.paymentAmount}>₹{p.amount.toLocaleString('en-IN')}</Text>
                <Text style={s.paymentMode}>{p.mode.toUpperCase()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.paymentDate}>
                  {p.date.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
                {p.receiptNumber && <Text style={s.receiptNo}>Receipt #{p.receiptNumber}</Text>}
              </View>
            </View>
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
    container: { padding: 16, paddingBottom: 32 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
    headerCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
    headerTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    caseTitle: { fontSize: 18, fontWeight: '800', color: C.text },
    caseNumber: { fontSize: 13, color: C.textMuted, marginTop: 2 },
    statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 8 },
    statusText: { fontSize: 11, fontWeight: '800' },
    metaRow: { flexDirection: 'row', gap: 16, marginBottom: 6 },
    metaItem: { fontSize: 13, color: C.textSecondary },
    court: { fontSize: 13, color: C.textSecondary },
    metaText: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
    financeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    financeCard: { flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1.5 },
    financeValue: { fontSize: 16, fontWeight: '800', color: C.text },
    financeLabel: { fontSize: 10, color: C.textMuted, marginTop: 4, fontWeight: '600' },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 10 },
    descCard: { backgroundColor: C.surfaceAlt, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
    descText: { fontSize: 14, color: C.textSecondary, lineHeight: 20 },
    hearingCard: { flexDirection: 'row', gap: 12, backgroundColor: C.card, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
    hearingDate: { backgroundColor: C.primary, borderRadius: 8, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    dateDay: { color: '#FFF', fontWeight: '800', fontSize: 16 },
    dateMonth: { color: '#FFF', fontSize: 10 },
    hearingStatus: { fontSize: 12, fontWeight: '700', color: C.primary },
    hearingNotes: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
    hearingTime: { fontSize: 12, color: C.textMuted, marginTop: 2 },
    paymentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border },
    paymentAmount: { fontSize: 16, fontWeight: '800', color: C.success },
    paymentMode: { fontSize: 11, color: C.textMuted, fontWeight: '600', marginTop: 2 },
    paymentDate: { fontSize: 13, color: C.textSecondary },
    receiptNo: { fontSize: 11, color: C.textMuted, marginTop: 2 },
    emptyCard: { backgroundColor: C.surfaceAlt, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border, borderStyle: 'dashed' },
    emptyText: { color: C.textMuted, fontSize: 14 },
  });
