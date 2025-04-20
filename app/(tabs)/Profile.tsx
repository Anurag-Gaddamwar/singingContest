import { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Animated,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { BlurView } from 'expo-blur';
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "@/components/Themed";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, deleteUser, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, query, where, collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { IconTexture } from "@/components/IconTexture";

const DEFAULT_PROFILE_IMAGE = require("@/assets/images/default_profile.png");

export default function Profile() {
  const auth = getAuth();
  const db = getFirestore();
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [age, setAge] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hostedCount, setHostedCount] = useState(0);
  const [joinedCount, setJoinedCount] = useState(0);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [signOutSlideAnim] = useState(new Animated.Value(300));
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [slideAnim] = useState(new Animated.Value(300));

  useEffect(() => {
    let isMounted = true;
    let hostedUnsubscribe: (() => void) | null = null;
    let joinedUnsubscribe: (() => void) | null = null;

    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (isMounted) {
            setName(data.name || "");
            setUsername(data.username || "");
            setAge(data.age || "");
            setProfileImageUrl(data.profileImageUrl || null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const setupCompetitionStats = () => {
      if (!user) return;

      const hostedQuery = query(
        collection(db, "competitions"),
        where("hostId", "==", user.uid)
      );

      hostedUnsubscribe = onSnapshot(
        hostedQuery,
        (hostedSnapshot) => {
          setHostedCount(hostedSnapshot.size);
        },
        (error) => {
          console.error("Hosted competitions listener error:", error);
        }
      );

      const joinedQuery = query(
        collection(db, "competitions"),
        where("participants", "array-contains", user.uid)
      );

      joinedUnsubscribe = onSnapshot(
        joinedQuery,
        (joinedSnapshot) => {
          setJoinedCount(joinedSnapshot.size);
        },
        (error) => {
          console.error("Joined competitions listener error:", error);
        }
      );
    };

    fetchUserData();
    setupCompetitionStats();

    // Monitor auth state changes
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // User signed out or deleted, clean up listeners
        hostedUnsubscribe?.();
        joinedUnsubscribe?.();
        setHostedCount(0);
        setJoinedCount(0);
      }
    });

    return () => {
      isMounted = false;
      hostedUnsubscribe?.();
      joinedUnsubscribe?.();
      authUnsubscribe();
    };
  }, [user]);

  const openSignOutDialog = () => {
    Animated.timing(signOutSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowSignOutDialog(true);
  };

  const closeSignOutDialog = () => {
    Animated.timing(signOutSlideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowSignOutDialog(false);
  };

  const handleSignOut = async (hostedUnsubscribe?: () => void, joinedUnsubscribe?: () => void) => {
    try {
      // Clean up listeners before signing out
      hostedUnsubscribe?.();
      joinedUnsubscribe?.();
      setHostedCount(0);
      setJoinedCount(0);

      await FIREBASE_AUTH.signOut();
      setUser(null);
      router.replace({ pathname: "/", params: { fromProfile: "true" } });
    } catch (err) {
      console.error("Error signing out:", err);
      Alert.alert("Error", "Failed to sign out.");
    }
  };

  const handleDeleteAccount = async (hostedUnsubscribe?: () => void, joinedUnsubscribe?: () => void) => {
    if (!user || !user.email) {
      setPasswordError("User is not authenticated or email is missing.");
      return;
    }
    const userCredential = EmailAuthProvider.credential(user.email, password);

    try {
      await reauthenticateWithCredential(user, userCredential);

      // Clean up listeners before deleting account
      hostedUnsubscribe?.();
      joinedUnsubscribe?.();
      setHostedCount(0);
      setJoinedCount(0);

      await deleteUser(user);
      setUser(null);
      router.replace({ pathname: "/", params: { fromProfile: "true" } });
    } catch (error) {
      console.error("Error during reauthentication or deletion:", error);
      setPasswordError("Incorrect password. Account cannot be deleted.");
    }
  };

  const openDeleteDialog = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowDeleteDialog(false);
    setPassword("");
    setPasswordError("");
  };

  if (loading) {
    return (
      <LinearGradient colors={["#121212", "#1e1e1e"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.Container}>
      <IconTexture icon="mic" size={50} opacity={0.03} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={profileImageUrl ? { uri: profileImageUrl } : DEFAULT_PROFILE_IMAGE}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <Text style={styles.displayName}>{(name || username || "User")?.toString().toUpperCase()}</Text>
          {username && <Text style={styles.username}>@{username.toString()}</Text>}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContainer}
          style={styles.statsSection}
        >
          {age && (
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{age}</Text>
              <Text style={styles.statLabel}>Age</Text>
            </View>
          )}
          {hostedCount >= 0 && (
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{hostedCount}</Text>
              <Text style={styles.statLabel}>Hosted</Text>
            </View>
          )}
          {joinedCount >= 0 && (
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{joinedCount}</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push("/modify/edit-profile")}
          >
            <Feather name="user" size={20} color="#aaa" style={styles.actionIcon} />
            <Text style={styles.actionText}>Edit Profile</Text>
            <Feather name="chevron-right" size={20} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push("/modify/change-password")}
          >
            <Feather name="lock" size={20} color="#aaa" style={styles.actionIcon} />
            <Text style={styles.actionText}>Change Password</Text>
            <Feather name="chevron-right" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity onPress={openSignOutDialog} style={styles.actionItem}>
            <Feather name="log-out" size={20} color="#aaa" style={styles.actionIcon} />
            <Text style={styles.actionText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openDeleteDialog} style={styles.deleteActionItem}>
            <Feather name="trash-2" size={20} color="#e53935" style={styles.actionIcon} />
            <Text style={[styles.actionText, { color: "#e53935" }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={showDeleteDialog}
        animationType="fade"
        onRequestClose={closeDeleteDialog}
      >
        <View style={StyleSheet.absoluteFill}>
          <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableWithoutFeedback onPress={closeDeleteDialog}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.bottomModalWrapper, { transform: [{ translateY: slideAnim }] }]}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Enter your password to confirm</Text>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.cancelButton} onPress={closeDeleteDialog}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteAccount()}>
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={showSignOutDialog}
        animationType="fade"
        onRequestClose={closeSignOutDialog}
      >
        <View style={StyleSheet.absoluteFill}>
          <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableWithoutFeedback onPress={closeSignOutDialog}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.bottomModalWrapper, { transform: [{ translateY: signOutSlideAnim }] }]}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Are you sure you want to sign out?</Text>
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.cancelButton} onPress={closeSignOutDialog}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleSignOut()}>
                      <Text style={styles.deleteText}>Sign Out</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#ccc",
    marginTop: 12,
    fontSize: 16,
  },
  Container: {
    flex: 1,
    backgroundColor: "black",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    borderBottomWidth: 6,
    borderBottomColor: "#2a2a2a",
    marginBottom: 10,
    borderRadius: 30,
    backgroundColor: "black",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#2a2a2a",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#333",
  },
  avatar: {
    flex: 1,
    width: undefined,
    height: undefined,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#eee",
    marginBottom: 5,
    textAlign: "center",
  },
  username: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
  },
  statsSection: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: "black",
    alignSelf: "center",
  },
  statsScrollContainer: {
    flexDirection: "row",
    gap: 20,
    paddingRight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  stat: {
    alignItems: "center",
    minWidth: 80,
    backgroundColor: "transparent",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#eee",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#aaa",
    backgroundColor: "transparent",
  },
  sectionContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ddd",
    marginBottom: 15,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
    justifyContent: "space-between",
  },
  deleteActionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
    justifyContent: "space-between",
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    color: "#ccc",
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalContent: {
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
  },
  modalTitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  passwordInput: {
    width: '100%',
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#fff',
    backgroundColor: 'black',
    marginBottom: 10,
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 10,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    backgroundColor: '#1e1e1e',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#ff4d4d',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomModalWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});