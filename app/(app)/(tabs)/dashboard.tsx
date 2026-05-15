import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,

} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../store/AuthContext';
import { Colors, ThemeColors } from '../../../constants/Colors';
import { useThemeContext } from '../../../store/ThemeContext';
import { getActiveCases } from '../../../services/firebase/cases';
import { getClients } from '../../../services/firebase/clients';
import { getUpcomingHearings } from '../../../services/firebase/hearings';
import { Case, Client, Hearing } from '../../../types';
import { Timestamp } from 'firebase/firestore';

function formatDate(ts: Timestamp | undefined): string {
  if (!ts) return '—';
  return ts.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatCard({
  emoji,
  label,
  value,
  bg,
  textColor,
}: {
  emoji: string;
  label: string;
  value: number | string;
  bg: string;
  textColor: string;
}) {
  return (
    <View style={[statStyles.card, { backgroundColor: bg }]}>
      <Text style={statStyles.emoji}>{emoji}</Text>
      <Text style={[statStyles.value, { color: textColor }]}>{value}</Text>
      <Text style={[statStyles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    margin: 4,
    minWidth: 90,
  },
  emoji: { fontSize: 26, marginBottom: 8 },
  value: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 11, fontWeight: '600', marginTop: 2, textAlign: 'center', opacity: 0.85 },
});

export default function DashboardScreen() {
  const { isDark } = useThemeContext();
  const C = Colors[isDark ? 'dark' : 'light'];
  const s = styles(C);
  const { user, userProfile, logOut } = useAuth();
  const router = useRouter();

  const [activeCases, setActiveCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [casesData, clientsData, hearingsData] = await Promise.all([
        getActiveCases(user.uid),
        getClients(user.uid),
        getUpcomingHearings(user.uid),
      ]);
      setActiveCases(casesData);
      setClients(clientsData);
      setHearings(hearingsData);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const totalPending = activeCases.reduce((sum, c) => sum + (c.pendingAmount || 0), 0);
  const displayName = userProfile?.displayName || user?.displayName || 'Advocate';
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <View style={s.loaderContainer}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={s.loaderText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{greeting},</Text>
          <Text style={s.name}>{displayName} 👋</Text>
        </View>
        <TouchableOpacity style={s.avatarBtn} onPress={() => router.push('/(app)/(tabs)/settings')}>
          <Text style={s.avatarText}>{displayName[0]?.toUpperCase() ?? 'A'}</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={s.statsRow}>
        <StatCard emoji="📁" label="Active Cases" value={activeCases.length} bg={C.primary} textColor="#FFF" />
        <StatCard emoji="👥" label="Clients" value={clients.length} bg={C.accent} textColor="#FFF" />
        <StatCard emoji="🗓️" label="Hearings" value={hearings.length} bg={C.success} textColor="#FFF" />
      </View>

      {/* Pending Payments Banner */}
      {totalPending > 0 && (
        <View style={s.pendingBanner}>
          <Text style={s.pendingIcon}>💰</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.pendingLabel}>Pending Payments</Text>
            <Text style={s.pendingAmount}>₹{totalPending.toLocaleString('en-IN')}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/cases')}>
            <Text style={s.pendingAction}>View →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={s.sectionTitle}>Quick Actions</Text>
      <View style={s.quickActions}>
        {[
          { label: 'New Case', emoji: '➕', route: '/(app)/case/add' as const },
          { label: 'New Client', emoji: '👤', route: '/(app)/client/add' as const },
          { label: 'All Cases', emoji: '📂', route: '/(app)/(tabs)/cases' as const },
          { label: 'Hearings', emoji: '📅', route: '/(app)/(tabs)/hearings' as const },
        ].map((a) => (
          <TouchableOpacity
            key={a.label}
            style={s.quickActionBtn}
            onPress={() => router.push(a.route as any)}
          >
            <Text style={s.quickActionEmoji}>{a.emoji}</Text>
            <Text style={s.quickActionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upcoming Hearings */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Upcoming Hearings</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/hearings')}>
          <Text style={s.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {hearings.length === 0 ? (
        <View style={s.emptyCard}>
          <Text style={s.emptyEmoji}>🗓️</Text>
          <Text style={s.emptyText}>No upcoming hearings</Text>
        </View>
      ) : (
        hearings.slice(0, 3).map((h) => (
          <TouchableOpacity
            key={h.id}
            style={s.hearingCard}
            onPress={() => router.push(`/(app)/case/${h.caseId}` as any)}
          >
            <View style={s.hearingDateBadge}>
              <Text style={s.hearingDay}>{h.date.toDate().getDate()}</Text>
              <Text style={s.hearingMonth}>
                {h.date.toDate().toLocaleString('en-IN', { month: 'short' })}
              </Text>
            </View>
            <View style={s.hearingInfo}>
              <Text style={s.hearingTitle} numberOfLines={1}>{h.caseTitle}</Text>
              <Text style={s.hearingMeta}>{h.clientName} • {h.court}</Text>
              <Text style={s.hearingTime}>{h.time || 'Time TBD'}</Text>
            </View>
            <View style={[s.statusBadge, { backgroundColor: C.infoLight }]}>
              <Text style={[s.statusText, { color: C.info }]}>Scheduled</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Recent Cases */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Active Cases</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/cases')}>
          <Text style={s.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {activeCases.length === 0 ? (
        <View style={s.emptyCard}>
          <Text style={s.emptyEmoji}>📁</Text>
          <Text style={s.emptyText}>No active cases. Add your first case!</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/(app)/case/add' as any)}>
            <Text style={s.emptyBtnText}>+ New Case</Text>
          </TouchableOpacity>
        </View>
      ) : (
        activeCases.slice(0, 5).map((c) => (
          <TouchableOpacity
            key={c.id}
            style={s.caseCard}
            onPress={() => router.push(`/(app)/case/${c.id}` as any)}
          >
            <View style={s.caseLeft}>
              <Text style={s.caseTitle} numberOfLines={1}>{c.title}</Text>
              <Text style={s.caseMeta}>{c.clientName} • {c.court}</Text>
              <Text style={s.caseNumber}>#{c.caseNumber}</Text>
            </View>
            <View style={s.caseRight}>
              {c.pendingAmount > 0 && (
                <View style={[s.statusBadge, { backgroundColor: C.warningLight }]}>
                  <Text style={[s.statusText, { color: C.warning }]}>₹{c.pendingAmount.toLocaleString('en-IN')}</Text>
                </View>
              )}
              <Text style={s.caseArrow}>›</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = (C: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    container: { padding: 20, paddingTop: 56 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
    loaderText: { color: C.textSecondary, marginTop: 12, fontSize: 14 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    greeting: { fontSize: 14, color: C.textSecondary },
    name: { fontSize: 22, fontWeight: '800', color: C.text, marginTop: 2 },
    avatarBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: C.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: { color: '#FFF', fontWeight: '800', fontSize: 18 },

    statsRow: { flexDirection: 'row', marginBottom: 20 },

    pendingBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.warningLight,
      borderRadius: 14,
      padding: 14,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: C.warning,
      gap: 10,
    },
    pendingIcon: { fontSize: 24 },
    pendingLabel: { fontSize: 12, color: C.warning, fontWeight: '600' },
    pendingAmount: { fontSize: 18, fontWeight: '800', color: C.warning },
    pendingAction: { color: C.warning, fontWeight: '700', fontSize: 14 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 12, marginTop: 8 },
    seeAll: { color: C.primary, fontWeight: '600', fontSize: 13 },

    quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
    quickActionBtn: {
      backgroundColor: C.card,
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
      width: '47%',
      borderWidth: 1,
      borderColor: C.border,
      flexDirection: 'row',
      gap: 8,
    },
    quickActionEmoji: { fontSize: 20 },
    quickActionLabel: { fontSize: 14, fontWeight: '600', color: C.text },

    hearingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: C.border,
      gap: 12,
    },
    hearingDateBadge: {
      backgroundColor: C.primary,
      borderRadius: 10,
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hearingDay: { color: '#FFF', fontWeight: '800', fontSize: 18, lineHeight: 20 },
    hearingMonth: { color: '#FFF', fontSize: 10, fontWeight: '600' },
    hearingInfo: { flex: 1 },
    hearingTitle: { fontSize: 14, fontWeight: '700', color: C.text },
    hearingMeta: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
    hearingTime: { fontSize: 11, color: C.textMuted, marginTop: 2 },

    caseCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: C.border,
    },
    caseLeft: { flex: 1 },
    caseTitle: { fontSize: 14, fontWeight: '700', color: C.text },
    caseMeta: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
    caseNumber: { fontSize: 11, color: C.textMuted, marginTop: 2 },
    caseRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    caseArrow: { fontSize: 24, color: C.textMuted, fontWeight: '300' },

    statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    statusText: { fontSize: 11, fontWeight: '700' },

    emptyCard: {
      backgroundColor: C.card,
      borderRadius: 14,
      padding: 24,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: C.border,
      borderStyle: 'dashed',
    },
    emptyEmoji: { fontSize: 32, marginBottom: 8 },
    emptyText: { color: C.textSecondary, fontSize: 14, textAlign: 'center' },
    emptyBtn: {
      marginTop: 12,
      backgroundColor: C.primary,
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  });
