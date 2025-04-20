import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { FIREBASE_DB } from "@/FirebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";

export default function JoinCompetition() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(FIREBASE_DB, "competitions"), (querySnapshot) => {
      const comps = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCompetitions(comps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleJoin = async (compId: string) => {
    if (!user) {
      Alert.alert("Login Required", "You must be logged in to join a competition.");
      return;
    }

    try {
      const compRef = doc(FIREBASE_DB, "competitions", compId);
      const compDoc = await getDoc(compRef);

      if (!compDoc.exists()) return Alert.alert("Not Found", "Competition not found.");
      const compData = compDoc.data();

      if (compData.hostId === user.uid) {
        return Alert.alert("Not Allowed", "You can't join your own competition.");
      }

      const userRef = doc(FIREBASE_DB, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      if (!userData?.age) {
        return Alert.alert("Incomplete Profile", "Please update your age in profile.");
      }

      const userAge = parseInt(userData.age);
      const [minAge, maxAge] = (compData.ageGroup || "0-100").split("-").map(Number);

      if (userAge < minAge || userAge > maxAge) {
        return Alert.alert("Not Eligible", `This is for ages ${minAge}-${maxAge}.`);
      }

      if (compData.participants?.includes(user.uid)) {
        return Alert.alert("Already Joined", "You've already joined.");
      }

      await updateDoc(compRef, {
        participants: arrayUnion(user.uid),
      });

      Alert.alert("✅ Success", "You've joined the competition.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const handleLike = async (compId: string, currentLikes: string[] = []) => {
    const compRef = doc(FIREBASE_DB, "competitions", compId);
    const liked = user?.uid ? currentLikes.includes(user.uid) : false;
    await updateDoc(compRef, {
      likes: liked ? arrayRemove(user?.uid || "") : arrayUnion(user?.uid || ""),
    });
  };

  const renderCard = ({ item }: any) => {
    const isLiked = item.likes?.includes(user?.uid);

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title} 🎤</Text>
          <TouchableOpacity onPress={() => handleLike(item.id, item.likes)}>
            <AntDesign name={isLiked ? "heart" : "hearto"} size={22} color={isLiked ? "#ff4d88" : "#ccc"} />
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>
          {item.description || "No description"} 🎶
        </Text>

        <View style={styles.detailBox}>
          <Text style={styles.detail}>🏆 Prize: {item.prizePool}</Text>
          <Text style={styles.detail}>📅 Date: {item.competitionDate}</Text>
          <Text style={styles.detail}>👥 Max: {item.maxParticipants}</Text>
          <Text style={styles.detail}>🎯 Age: {item.ageGroup} | 🚻 {item.gender}</Text>
        </View>

        <Animated.View style={[{ transform: [{ scale: buttonScale }] }]}>
          <TouchableOpacity style={styles.buttonBase} onPress={() => handleJoin(item.id)}>
            <LinearGradient colors={["#9333ea", "#6b21a8"]} style={styles.joinButtonGradient}>
              <Text style={styles.joinText}>Join</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  return (
    <FlatList
      data={competitions}
      keyExtractor={(item) => item.id}
      renderItem={renderCard}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#0f0f0f",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
  },
  card: {
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  description: {
    fontSize: 14,
    color: "#d1d5db",
    marginBottom: 10,
  },
  detailBox: {
    marginBottom: 12,
  },
  detail: {
    color: "#ccc",
    fontSize: 13,
    marginVertical: 2,
  },
  buttonBase: {
    borderRadius: 12,
    overflow: "hidden",
  },
  joinButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  joinText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
