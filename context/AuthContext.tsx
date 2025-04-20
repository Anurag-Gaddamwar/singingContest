import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

export interface ExtendedUser extends User {
  username?: string;
  age?: string;
  profileImage?: string;
}

interface AuthContextProps {
  user: ExtendedUser | null;
  loading: boolean;
  setUser: (user: ExtendedUser | null) => void;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // console.log("🔄 AuthProvider mounted");

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // console.log("👤 onAuthStateChanged triggered");
      // console.log("    → currentUser:", currentUser);

      setUser(currentUser as ExtendedUser); // safely cast
      setLoading(false);

      // if (!currentUser) {
      //   console.log("⚠️ No user detected (logged out)");
      // } else {
      //   console.log("✅ User signed in:", currentUser.uid);
      // }
    });

    return () => {
      // console.log("📴 AuthProvider cleanup");
      unsubscribe();
    };
  }, []);

  // console.log("📦 [AuthContext] Providing:", { user, loading });

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
