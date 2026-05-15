import { Tabs } from 'expo-router';
import { useColorScheme, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useThemeContext } from '../../../store/ThemeContext';

function TabIcon({ emoji, label, focused, color }: { emoji: string; label: string; focused: boolean; color: string }) {
  return (
    <View style={[tabStyles.container, focused && tabStyles.focused]}>
      <Text style={[tabStyles.emoji, focused && { fontSize: 22 }]}>{emoji}</Text>
      {focused && <Text style={[tabStyles.label, { color }]}>{label}</Text>}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingTop: 4, width: 64 },
  focused: {},
  emoji: { fontSize: 20 },
  label: { fontSize: 10, fontWeight: '700', marginTop: 2 },
});

export default function TabsLayout() {
  const { isDark } = useThemeContext();
  const C = Colors[isDark ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.tabBackground,
          borderTopColor: C.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 68,
        },
        tabBarActiveTintColor: C.tabIconSelected,
        tabBarInactiveTintColor: C.tabIconDefault,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          title: 'Cases',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="📁" label="Cases" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="👥" label="Clients" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hearings"
        options={{
          title: 'Hearings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="🗓️" label="Hearings" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="⚙️" label="Settings" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
