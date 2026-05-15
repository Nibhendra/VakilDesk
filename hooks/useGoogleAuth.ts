import { useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { Alert } from 'react-native';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export const useGoogleAuth = () => {
  const { signInWithGoogle } = useAuth();

  const promptAsync = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        if (response.data?.idToken) {
          await signInWithGoogle(response.data.idToken);
        } else {
          Alert.alert('Error', 'Google Sign-In failed to return an ID token.');
        }
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Sign-In Failed', error.message || 'An unknown error occurred during sign-in.');
    }
  };

  return { promptAsync, request: null };
};
