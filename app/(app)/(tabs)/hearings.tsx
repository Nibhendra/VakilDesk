import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,

} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../store/AuthContext';
import { Colors, ThemeColors } from '../../../constants/Colors';
import { useThemeContext } from '../../../store/ThemeContext';
import { getUpcomingHearings } from '../../../services/firebase/hearings';
import { Hearing, HearingStatus } from '../../../types';

const STATUS_COLORS: Record<HearingStatus, { bg: string; text: string }> = {
  scheduled: { bg: '#DBEAFE', text: '#2563EB' },
  completed: { bg: '#DCFCE7', text: '#16A34A' },
  adjourned: { bg: '#FEF3C7', text: '#D97706' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626' },
};

export default function HearingsScreen() {
  const { isDark } = useThemeContext();
  const C = Colors[isDark ? 'dark' : 'light'];
  const s = styles(C);
  const { user } = useAuth();
  const router = useRouter();

  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHearings = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUpcomingHearings(user.uid);
      setHearings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchHearings(); }, [fetchHearings]);

  const renderHearing = ({ item }: { item: Hearing }) => {
    const sc = STATUS_COLORS[item.status];
    const date = item.date.toDate();
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = new Date(today.getTime() + 86400000).toDateString() === date.toDateString();

    let dayLabel = date.toLocaleDateString('en-IN', { weekday: 'short' });
    if (isToday) dayLabel = 'Today';
    if (isTomorrow) dayLabel = 'Tomorrow';

    return (
      <TouchableOpacity
        style={[s.card, isToday && s.todayCard]}
        onPress={() => router.push(`/(app)/case/${item.caseId}` as any)}
      >
        {isToday && <View style={s.todayBanner}><Text style={s.todayText}>TODAY</Text></View>}
        <View style={s.cardRow}>
          <View style={[s.dateBadge, isToday && s.dateBadgeToday]}>
            <Text style={[s.dateDay, isToday && s.dateDayToday]}>{date.getDate()}</Text>
            <Text style={[s.dateMonth, isToday && s.dateMonthToday]}>
              {date.toLocaleString('en-IN', { month: 'short' })}
            </Text>
            <Text style={[s.dateDayLabel, isToday && s.dateMonthToday]}>{dayLabel}</Text>
          </View>
          <View style={s.hearingInfo}>
            <Text style={s.caseTitle} numberOfLines={1}>{item.caseTitle}</Text>
            <Text style={s.clientName}>{item.clientName}</Text>
            <Text style={s.court}>🏛️ {item.court}</Text>
            {item.time && <Text style={s.time}>🕐 {item.time}</Text>}
            {item.notes && <Text style={s.notes} numberOfLines={2}>{item.notes}</Text>}
          </View>
          <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[s.statusText, { color: sc.text }]}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <View style={s.loader}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Hearings</Text>
        <Text style={s.subtitle}>{hearings.length} upcoming</Text>
      </View>

      <FlatList
        data={hearings}
        keyExtractor={(item) => item.id}
        renderItem={renderHearing}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHearings(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Text style={s.emptyEmoji}>🗓️</Text>
            <Text style={s.emptyTitle}>No upcoming hearings</Text>
            <Text style={s.emptySubtitle}>Your scheduled hearings will appear here</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = (C: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
    header: {
      paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface,
      borderBottomWidth: 1, borderBottomColor: C.border,
    },
    title: { fontSize: 24, fontWeight: '800', color: C.text },
    subtitle: { fontSize: 14, color: C.textSecondary, marginTop: 2 },
    list: { padding: 16, paddingBottom: 32 },
    card: {
      backgroundColor: C.card, borderRadius: 14, marginBottom: 12,
      borderWidth: 1, borderColor: C.border, overflow: 'hidden',
    },
    todayCard: { borderColor: C.primary, borderWidth: 2 },
    todayBanner: { backgroundColor: C.primary, paddingVertical: 4, paddingHorizontal: 12 },
    todayText: { color: '#FFF', fontWeight: '800', fontSize: 11, letterSpacing: 1 },
    cardRow: { flexDirection: 'row', padding: 14, gap: 12, alignItems: 'flex-start' },
    dateBadge: {
      width: 56, alignItems: 'center', backgroundColor: C.surfaceAlt,
      borderRadius: 10, padding: 8,
    },
    dateBadgeToday: { backgroundColor: C.primary },
    dateDay: { fontSize: 22, fontWeight: '800', color: C.text },
    dateDayToday: { color: '#FFF' },
    dateMonth: { fontSize: 11, fontWeight: '600', color: C.textSecondary },
    dateMonthToday: { color: '#FFF' },
    dateDayLabel: { fontSize: 10, color: C.textMuted, marginTop: 2 },
    hearingInfo: { flex: 1 },
    caseTitle: { fontSize: 15, fontWeight: '700', color: C.text },
    clientName: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
    court: { fontSize: 12, color: C.textSecondary, marginTop: 4 },
    time: { fontSize: 12, color: C.primary, fontWeight: '600', marginTop: 2 },
    notes: { fontSize: 12, color: C.textMuted, marginTop: 4, fontStyle: 'italic' },
    statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
    statusText: { fontSize: 11, fontWeight: '700' },
    emptyContainer: { alignItems: 'center', paddingTop: 80 },
    emptyEmoji: { fontSize: 56, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text },
    emptySubtitle: { fontSize: 14, color: C.textSecondary, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
  });
