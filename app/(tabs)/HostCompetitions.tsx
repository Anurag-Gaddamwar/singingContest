import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  StyleSheet
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { FIREBASE_DB } from "@/FirebaseConfig";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CustomInput } from "../components/CustomInput";
import { CustomPicker } from "../components/CustomPicker";
import { CustomStepper } from "../components/CustomStepper";
import { CustomDatePicker } from "../components/CustomDatePicker";

export default function HostCompetition() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ageGroup, setAgeGroup] = useState("13-18");
  const [gender, setGender] = useState("All");
  const [prizePool, setPrizePool] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [showRegDatePicker, setShowRegDatePicker] = useState(false);
  const [showCompDatePicker, setShowCompDatePicker] = useState(false);

  interface Errors {
    title?: string;
    description?: string;
    prizePool?: string;
  }

  const [errors, setErrors] = useState<Errors>({});

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const [registrationDeadline, setRegistrationDeadline] = useState(nextWeek);
  const [competitionDate, setCompetitionDate] = useState(
    new Date(nextWeek.getTime() + 7 * 86400000)
  );

  const requiredSectionAnim = useRef(new Animated.Value(1)).current;
  const optionalSectionAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const [isRequiredOpen, setIsRequiredOpen] = useState(false);
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);

  const toggleSection = (section: string) => {
    const anim = section === "required" ? requiredSectionAnim : optionalSectionAnim;
    const open = section === "required" ? isRequiredOpen : isOptionalOpen;

    Animated.timing(anim, {
      toValue: open ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    section === "required"
      ? setIsRequiredOpen(!isRequiredOpen)
      : setIsOptionalOpen(!isOptionalOpen);
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const validateForm = () => {
    const newErrors: Errors = {};
    if (!title) newErrors.title = "Title is required";
    if (!description) newErrors.description = "Description is required";
    if (!prizePool) newErrors.prizePool = "Prize pool is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleHost = async () => {
    animateButton();
    if (!validateForm()) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    try {
      const competitionsRef = collection(FIREBASE_DB, "competitions");
      await addDoc(competitionsRef, {
        title,
        description,
        ageGroup,
        gender,
        prizePool,
        maxParticipants,
        registrationDeadline: registrationDeadline.toISOString().split("T")[0],
        competitionDate: competitionDate.toISOString().split("T")[0],
        hostId: user?.uid,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Competition hosted!");
      router.back();
    } catch (error) {
      console.error("Error hosting competition:", error);
      Alert.alert("Error", "Failed to host competition.");
    }
  };

  const handleCancel = () => {
    animateButton();
    router.back();
  };

  return (
    <LinearGradient
      colors={["#0f0f0f", "#1e1e1e"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Host a Competition</Text>

        <View style={styles.sectionContainer}>
          <TouchableOpacity onPress={() => toggleSection("required")} style={styles.sectionToggle}>
            <Text style={styles.sectionTitle}>Required Information</Text>
            <Ionicons name={isRequiredOpen ? "chevron-down" : "chevron-forward"} size={24} color="#fff" />
          </TouchableOpacity>

          <Animated.View style={{ opacity: requiredSectionAnim }}>
            {isRequiredOpen && (
              <View style={styles.card}>
                <CustomInput label="Competition Title" value={title} onChange={setTitle} icon="musical-notes" error={errors.title} placeholder="e.g. Rap Battle 2025" />
                <CustomInput label="Description" value={description} onChange={setDescription} icon="information-circle" error={errors.description} multiline height={100} placeholder="Describe your competition..." />
                <CustomPicker label="Age Group" selectedValue={ageGroup} onValueChange={setAgeGroup} options={["13-18", "18-25", "25+"]} icon="people" />
                <CustomPicker label="Gender" selectedValue={gender} onValueChange={setGender} options={["All", "Male", "Female"]} icon="person" />
                <CustomInput label="Prize Pool" value={prizePool} onChange={setPrizePool} icon="trophy" error={errors.prizePool} placeholder="e.g. ₹5000" keyboardType="numeric" />
              </View>
            )}
          </Animated.View>
        </View>

        <View style={styles.sectionContainer}>
          <TouchableOpacity onPress={() => toggleSection("optional")} style={styles.sectionToggle}>
            <Text style={styles.sectionTitle}>Optional Information</Text>
            <Ionicons name={isOptionalOpen ? "chevron-down" : "chevron-forward"} size={24} color="#fff" />
          </TouchableOpacity>

          <Animated.View style={{ opacity: optionalSectionAnim }}>
            {isOptionalOpen && (
              <View style={styles.card}>
                <CustomStepper label="Max Participants" value={maxParticipants} onChange={setMaxParticipants} />
                <CustomDatePicker label="Registration Deadline" date={registrationDeadline} onChange={setRegistrationDeadline} showPicker={showRegDatePicker} setShowPicker={setShowRegDatePicker} today={today} />
                <CustomDatePicker label="Competition Date" date={competitionDate} onChange={setCompetitionDate} showPicker={showCompDatePicker} setShowPicker={setShowCompDatePicker} today={today} />
              </View>
            )}
          </Animated.View>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewHeader}>Preview</Text>
          <Text style={styles.previewText}>Title: {title || "Your Competition"}</Text>
          <Text style={styles.previewText}>Description: {description || "No description yet"}</Text>
          <Text style={styles.previewText}>Prize: {prizePool || "TBD"}</Text>
          <Text style={styles.previewText}>Age Group: {ageGroup}</Text>
          <Text style={styles.previewText}>Gender: {gender}</Text>
          <Text style={styles.previewText}>Max Participants: {maxParticipants}</Text>
          <Text style={styles.previewText}>Registration Deadline: {registrationDeadline.toDateString()}</Text>
          <Text style={styles.previewText}>Competition Date: {competitionDate.toDateString()}</Text>
        </View>

        <View style={styles.buttonRow}>
  <TouchableOpacity style={[styles.buttonBase, styles.cancelButton]} onPress={handleCancel}>
    <Text style={styles.cancelButtonText}>Cancel</Text>
  </TouchableOpacity>

  <Animated.View style={[{ transform: [{ scale: buttonScale }], flex: 1 }]}>
    <TouchableOpacity style={styles.buttonBase} onPress={handleHost}>
      <LinearGradient colors={["#9333ea", "#6b21a8"]} style={styles.launchButtonGradient}>
        <Text style={styles.launchButtonText}>Launch</Text>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
</View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 16,
    borderColor: "#9333ea",
    borderWidth: 1,
  },
  previewCard: {
    backgroundColor: "#1e1e1e",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  previewHeader: {
    color: "#a78bfa",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  previewText: {
    color: "#d1d5db",
    fontSize: 14,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  buttonBase: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  
  cancelButton: {
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  
  launchButtonGradient: {
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  
  launchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  

 
});