import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useFirebaseAuth } from './firebase-auth';

export const useFirebaseUser = () => {
  const { auth, signInWithClerk } = useFirebaseAuth();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signIn = async () => {
    try {
      setLoading(true);
      const user = await signInWithClerk();
      return user;
    } finally {
      setLoading(false);
    }
  };

  return {
    firebaseUser,
    loading,
    signIn,
  };
}; 