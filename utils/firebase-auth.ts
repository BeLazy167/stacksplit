import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { app } from './firebase';
import { useAuth } from '@clerk/clerk-expo';

const auth = getAuth(app);

export const useFirebaseAuth = () => {
  const { getToken } = useAuth();

  const signInWithClerk = async () => {
    try {
      // Get a Firebase token from Clerk
      const token = await getToken({ template: 'integration_firebase' });
      
      if (!token) {
        throw new Error('No Firebase token available');
      }

      // Sign in to Firebase with the token
      const userCredential = await signInWithCustomToken(auth, token);
      return userCredential.user;
    } catch (error) {
      console.error('Firebase authentication error:', error);
      throw error;
    }
  };

  return {
    auth,
    signInWithClerk,
  };
}; 