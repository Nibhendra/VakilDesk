import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,

  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../store/AuthContext';
import { Colors, ThemeColors } from '../../../constants/Colors';
import { useThemeContext } from '../../../store/ThemeContext';
import { getCases, deleteCase } from '../../../services/firebase/cases';
import { Case, CaseStatus } from '../../../types';

const STATUS_COLORS: Record<CaseStatus, { bg: string; text: string }> = {
  active: { bg: '#DCFCE7', text: '#16A34A' },
  pending: { bg: '#FEF3C7', text: '#D97706' },
  closed: { bg: '#E2E8F0', text: '#475569' },
  dismissed: { bg: '#FEE2E2', text: '#DC2626' },
  settled: { bg: '#DBEAFE', text: '#2563EB' },
};

const STATUS_LABELS: Record<CaseStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  closed: 'Closed',
  dismissed: 'Dismissed',
  settled: 'Settled',
};

export default function CasesScreen() {
  const { isDark } = useThemeContext();
  const C = Colors[isDark ? 'dark' : 'light'];
  const s = styles(C);
  const { user } = useAuth();
  const router = useRouter();

  const [cases, setCases] = useState<Case[]>([]);
  const [filtered, setFiltered] = useState<Case[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<CaseStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCases = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getCases(user.uid);
      setCases(data);
      setFiltered(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  useEffect(() => {
    let result = cases;
    if (activeFilter !== 'all') {
      result = result.filter(c => c.status === activeFilter);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.caseNumber.toLowerCase().includes(term) ||
        c.clientName.toLowerCase().includes(term) ||
        c.court.toLowerCase().includes(term)
      );
    }
    setFiltered(result);
  }, [search, cases, activeFilter]);

  const handleDelete = (c: Case) => {
    Alert.alert('Delete Case', `Delete "${c.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteCase(c.id);
            setCases(prev => prev.filter(x => x.id !== c.id));
          } catch {
            Alert.alert('Error', 'Failed to delete case.');
          }
        },
      },
    ]);
  };

  const renderCase = ({ item }: { item: Case }) => {
    const sc = STATUS_COLORS[item.status] || STATUS_COLORS.active;
    return (
      <TouchableOpacity style={s.card} onPress={() => router.push(`/(app)/case/${item.id}` as any)}>
        <View style={s.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.caseTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={s.caseNumber}>#{item.caseNumber}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[s.statusText, { color: sc.text }]}>{STATUS_LABELS[item.status]}</Text>
          </View>
        </View>
        <View style={s.cardMeta}>
          <Text style={s.metaItem}>👤 {item.clientName}</Text>
          <Text style={s.metaItem}>🏛️ {item.court}</Text>
        </View>
        {item.nextHearingDate && (
          <Text style={s.hearingDate}>
            📅 Next: {item.nextHearingDate.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        )}
        <View style={s.cardFooter}>
          <View style={s.feeInfo}>
            <Text style={s.feePaid}>Paid: ₹{item.paidAmount.toLocaleString('en-IN')}</Text>
            {item.pendingAmount > 0 && (
              <Text style={s.feePending}>Pending: ₹{item.pendingAmount.toLocaleString('en-IN')}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => handleDelete(item)} style={s.deleteBtn}>
            <Text>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={s.loaderContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Cases</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => router.push('/(app)/case/add' as any)}>
          <Text style={s.addBtnText}>+ New Case</Text>
        </TouchableOpacity>
      </View>

      <View style={s.searchContainer}>
        <Text>🔍 </Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search cases..."
          placeholderTextColor={C.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Chips */}
      <View style={s.filterRow}>
        {(['all', 'active', 'pending', 'closed', 'settled'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.filterChip, activeFilter === f && s.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[s.filterChipText, activeFilter === f && s.filterChipTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCase}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCases(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Text style={s.emptyEmoji}>📁</Text>
            <Text style={s.emptyTitle}>{search ? 'No cases found' : 'No cases yet'}</Text>
            <Text style={s.emptySubtitle}>{search ? 'Try adjusting your search' : 'Create your first case'}</Text>
            {!search && (
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/(app)/case/add' as any)}>
                <Text style={s.emptyBtnText}>+ New Case</Text>
              </TouchableOpacity>
            )}
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
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface,
      borderBottomWidth: 1, borderBottomColor: C.border,
    },
    title: { fontSize: 24, fontWeight: '800', color: C.text },
    addBtn: { backgroundColor: C.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
    addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
    searchContainer: {
      flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: C.card,
      borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: C.border,
    },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: C.text },
    filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
    filterChip: {
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
      backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
    },
    filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
    filterChipText: { fontSize: 13, fontWeight: '600', color: C.textSecondary },
    filterChipTextActive: { color: '#FFF' },
    list: { paddingHorizontal: 16, paddingBottom: 32 },
    card: {
      backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10,
      borderWidth: 1, borderColor: C.border,
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    caseTitle: { fontSize: 15, fontWeight: '700', color: C.text },
    caseNumber: { fontSize: 12, color: C.textMuted, marginTop: 2 },
    statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8 },
    statusText: { fontSize: 12, fontWeight: '700' },
    cardMeta: { flexDirection: 'row', gap: 16, marginBottom: 6 },
    metaItem: { fontSize: 12, color: C.textSecondary },
    hearingDate: { fontSize: 12, color: C.primary, fontWeight: '600', marginBottom: 8 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8 },
    feeInfo: { flexDirection: 'row', gap: 12 },
    feePaid: { fontSize: 12, color: C.success, fontWeight: '600' },
    feePending: { fontSize: 12, color: C.warning, fontWeight: '600' },
    deleteBtn: { padding: 4 },
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text },
    emptySubtitle: { fontSize: 14, color: C.textSecondary, marginTop: 8 },
    emptyBtn: { marginTop: 20, backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
    emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  });
