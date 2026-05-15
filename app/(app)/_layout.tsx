import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useThemeContext } from '../../store/ThemeContext';

export default function AppLayout() {
  const { isDark } = useThemeContext();
  const C = Colors[isDark ? 'dark' : 'light'];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="case/[id]"
        options={{
          headerShown: true,
          title: 'Case Details',
          headerStyle: { backgroundColor: C.surface },
          headerTintColor: C.text,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <Stack.Screen
        name="client/[id]"
        options={{
          headerShown: true,
          title: 'Client Profile',
          headerStyle: { backgroundColor: C.surface },
          headerTintColor: C.text,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <Stack.Screen
        name="case/add"
        options={{
          headerShown: true,
          title: 'New Case',
          headerStyle: { backgroundColor: C.surface },
          headerTintColor: C.text,
          headerTitleStyle: { fontWeight: '700' },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="client/add"
        options={{
          headerShown: true,
          title: 'New Client',
          headerStyle: { backgroundColor: C.surface },
          headerTintColor: C.text,
          headerTitleStyle: { fontWeight: '700' },
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
