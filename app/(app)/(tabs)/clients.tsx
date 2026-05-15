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
import { getClients, deleteClient } from '../../../services/firebase/clients';
import { Client } from '../../../types';

export default function ClientsScreen() {
  const { isDark } = useThemeContext();
  const C = Colors[isDark ? 'dark' : 'light'];
  const s = styles(C);
  const { user } = useAuth();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClients = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getClients(user.uid);
      setClients(data);
      setFiltered(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(clients);
      return;
    }
    const term = search.toLowerCase();
    setFiltered(clients.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      (c.email && c.email.toLowerCase().includes(term))
    ));
  }, [search, clients]);

  const handleDelete = (client: Client) => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to delete ${client.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClient(client.id);
              setClients(prev => prev.filter(c => c.id !== client.id));
            } catch {
              Alert.alert('Error', 'Failed to delete client. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderClient = ({ item }: { item: Client }) => (
    <TouchableOpacity style={s.card} onPress={() => router.push(`/(app)/client/${item.id}` as any)}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{item.name[0]?.toUpperCase()}</Text>
      </View>
      <View style={s.cardInfo}>
        <Text style={s.clientName}>{item.name}</Text>
        <Text style={s.clientPhone}>{item.phone}</Text>
        {item.email && <Text style={s.clientEmail}>{item.email}</Text>}
        <View style={s.statsRow}>
          <View style={s.statChip}>
            <Text style={s.statChipText}>📁 {item.activeCasesCount} cases</Text>
          </View>
          {item.totalPending > 0 && (
            <View style={[s.statChip, { backgroundColor: C.warningLight }]}>
              <Text style={[s.statChipText, { color: C.warning }]}>
                ₹{item.totalPending.toLocaleString('en-IN')} pending
              </Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item)} style={s.deleteBtn}>
        <Text style={s.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={s.loaderContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Clients</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => router.push('/(app)/client/add' as any)}>
          <Text style={s.addBtnText}>+ Add Client</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchContainer}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search clients..."
          placeholderTextColor={C.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderClient}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchClients(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Text style={s.emptyEmoji}>👥</Text>
            <Text style={s.emptyTitle}>{search ? 'No clients found' : 'No clients yet'}</Text>
            <Text style={s.emptySubtitle}>{search ? 'Try a different search term' : 'Add your first client to get started'}</Text>
            {!search && (
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/(app)/client/add' as any)}>
                <Text style={s.emptyBtnText}>+ Add Client</Text>
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
    searchIcon: { fontSize: 16, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: C.text },
    list: { paddingHorizontal: 16, paddingBottom: 32 },
    card: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
      borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border,
      gap: 12,
    },
    avatar: {
      width: 48, height: 48, borderRadius: 24, backgroundColor: C.primary,
      justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { color: '#FFF', fontWeight: '800', fontSize: 20 },
    cardInfo: { flex: 1 },
    clientName: { fontSize: 16, fontWeight: '700', color: C.text },
    clientPhone: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
    clientEmail: { fontSize: 12, color: C.textMuted, marginTop: 1 },
    statsRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
    statChip: { backgroundColor: C.surfaceAlt, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    statChipText: { fontSize: 11, fontWeight: '600', color: C.textSecondary },
    deleteBtn: { padding: 8 },
    deleteIcon: { fontSize: 18 },
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text },
    emptySubtitle: { fontSize: 14, color: C.textSecondary, marginTop: 8, textAlign: 'center' },
    emptyBtn: { marginTop: 20, backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
    emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  });
