import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Switch,
  useColorScheme,
} from 'react-native';
import { useAuth } from '../../../store/AuthContext';
import { Colors, ThemeColors } from '../../../constants/Colors';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../services/firebase/config';
import { useThemeContext } from '../../../store/ThemeContext';

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useThemeContext();
  const C = Colors[isDark ? 'dark' : 'light'];
  const s = styles(C);
  const { user, userProfile, logOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of VakilDesk?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logOut },
    ]);
  };

  const handleChangePassword = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'No email associated with this account.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert('Email Sent', `A password reset link has been sent to ${user.email}. Check your inbox.`);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to send reset email.');
    }
  };

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Hearing reminders and case updates will be added in a future update of VakilDesk.');
  };

  const handleAbout = () => {
    Alert.alert('About VakilDesk', 'VakilDesk v1.0.0\n\nA production-ready AI-powered legal practice management app built for Indian legal professionals.\n\nBuilt with ❤️ using React Native & Firebase.');
  };

  const displayName = userProfile?.displayName || user?.displayName || 'Advocate';
  const email = user?.email || '—';

  const sections = [
    {
      title: 'Account',
      items: [
        { emoji: '👤', label: 'Profile', sublabel: displayName, onPress: () => Alert.alert('Profile', `Name: ${displayName}\nEmail: ${email}`) },
        { emoji: '✉️', label: 'Email', sublabel: email, onPress: () => Alert.alert('Email', email) },
        { emoji: '🔒', label: 'Change Password', sublabel: 'Send reset email', onPress: handleChangePassword },
      ],
    },
    {
      title: 'App',
      items: [
        { emoji: '⭐', label: 'Rate VakilDesk', sublabel: 'Share your feedback', onPress: () => Alert.alert('Thank You!', 'Rating will be available when the app is published to the Play Store.') },
        { emoji: '🛡️', label: 'Privacy Policy', sublabel: 'Read our privacy policy', onPress: () => Linking.openURL('https://policies.google.com/privacy') },
        { emoji: 'ℹ️', label: 'About', sublabel: 'VakilDesk v1.0.0', onPress: handleAbout },
      ],
    },
  ];

  return (
    <ScrollView style={s.root} contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Settings</Text>
      </View>

      {/* Profile Card */}
      <View style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{displayName[0]?.toUpperCase() ?? 'A'}</Text>
        </View>
        <View style={s.profileInfo}>
          <Text style={s.profileName}>{displayName}</Text>
          <Text style={s.profileEmail}>{email}</Text>
          <View style={s.badge}>
            <Text style={s.badgeText}>⚖️ Legal Professional</Text>
          </View>
        </View>
      </View>

      {/* Appearance Toggle */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Preferences</Text>
        <View style={s.sectionCard}>
          <View style={s.menuItem}>
            <Text style={s.menuEmoji}>🌓</Text>
            <View style={s.menuContent}>
              <Text style={s.menuLabel}>Dark Mode</Text>
              <Text style={s.menuSublabel}>{isDark ? 'Dark theme active' : 'Light theme active'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: C.border, true: C.primary }}
              thumbColor={isDark ? '#FFF' : C.textMuted}
            />
          </View>
          <View style={[s.menuItem, s.menuItemBorder]}>
            <Text style={s.menuEmoji}>🔔</Text>
            <View style={s.menuContent}>
              <Text style={s.menuLabel}>Notifications</Text>
              <Text style={s.menuSublabel}>Configure reminders</Text>
            </View>
            <Text style={s.menuChevron}>›</Text>
          </View>
        </View>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={s.section}>
          <Text style={s.sectionTitle}>{section.title}</Text>
          <View style={s.sectionCard}>
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[s.menuItem, idx < section.items.length - 1 && s.menuItemBorder]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Text style={s.menuEmoji}>{item.emoji}</Text>
                <View style={s.menuContent}>
                  <Text style={s.menuLabel}>{item.label}</Text>
                  <Text style={s.menuSublabel}>{item.sublabel}</Text>
                </View>
                <Text style={s.menuChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>🚪 Sign Out</Text>
      </TouchableOpacity>

      <Text style={s.versionText}>VakilDesk • Built for Legal Professionals</Text>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}


const styles = (C: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    container: { paddingBottom: 32 },
    header: {
      paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface,
      borderBottomWidth: 1, borderBottomColor: C.border,
    },
    title: { fontSize: 24, fontWeight: '800', color: C.text },
    profileCard: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
      margin: 16, borderRadius: 16, padding: 16, gap: 14,
      borderWidth: 1, borderColor: C.border,
      shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    },
    avatar: {
      width: 60, height: 60, borderRadius: 30, backgroundColor: C.primary,
      justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { color: '#FFF', fontWeight: '800', fontSize: 26 },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 18, fontWeight: '700', color: C.text },
    profileEmail: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
    badge: {
      marginTop: 6, backgroundColor: C.accent + '25', borderRadius: 8,
      paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
    },
    badgeText: { fontSize: 11, fontWeight: '700', color: C.accent },
    section: { marginBottom: 8, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 12, fontWeight: '700', color: C.textMuted, marginBottom: 8, marginTop: 8, letterSpacing: 0.8, textTransform: 'uppercase' },
    sectionCard: {
      backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border,
      overflow: 'hidden',
    },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    menuItemBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
    menuEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
    menuContent: { flex: 1 },
    menuLabel: { fontSize: 15, fontWeight: '600', color: C.text },
    menuSublabel: { fontSize: 12, color: C.textSecondary, marginTop: 1 },
    menuChevron: { fontSize: 22, color: C.textMuted, fontWeight: '300' },
    logoutBtn: {
      margin: 16, backgroundColor: C.errorLight, borderRadius: 14, paddingVertical: 15,
      alignItems: 'center', borderWidth: 1, borderColor: C.error + '40',
    },
    logoutText: { fontSize: 16, fontWeight: '700', color: C.error },
    versionText: { textAlign: 'center', color: C.textMuted, fontSize: 12, marginTop: 8 },
  });
