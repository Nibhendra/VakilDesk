import { Redirect } from 'expo-router';
import { useAuth } from '../store/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Redirect href="/(app)/(tabs)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}
