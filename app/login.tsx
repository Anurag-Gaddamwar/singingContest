import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Vibration,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { router, useLocalSearchParams } from "expo-router";

const { width } = Dimensions.get("window");

const AuthScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const [type, setType] = useState(params.type === "register" ? "register" : "login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const auth = FIREBASE_AUTH;

  const animateSwitch = (newType?: string, newStep?: number) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -30, duration: 200, useNativeDriver: true }),
      ]),
      Animated.timing(slideAnim, { toValue: 30, duration: 0, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(() => {
      slideAnim.setValue(0);
      fadeAnim.setValue(1);
    });

    setTimeout(() => {
      if (newType) {
        setType(newType);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setUsername("");
        setAge("");
        setGender("");
        setStep(1);
      }
      if (newStep) setStep(newStep);
      setError("");
    }, 150);
  };

  const validateStep1 = (): boolean => {
    setError("");
  
    if (!email.trim()) {
      return showError("Email is required");
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return showError("Please enter a valid email address");
    }
    if (!password) {
      return showError("Password is required");
    }
    if (password.length < 6) {
      return showError("Password must be at least 6 characters");
    }
  
    // Password requirements
    const missingRequirements = [];
  
    if (!/[A-Z]/.test(password)) {
      missingRequirements.push("an uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      missingRequirements.push("a lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      missingRequirements.push("a number");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      missingRequirements.push("a special character");
    }
  
    if (missingRequirements.length > 0) {
      const errorMessage = `Password must include ${missingRequirements.join(", ")}`;
      return showError(errorMessage);
    }
  
    if (password !== confirmPassword) {
      return showError("Passwords do not match");
    }
  
    return true;
  };
  

  const validateStep2 = async (): Promise<boolean> => {
    setError("");
    if (!username.trim()) {
      return showError("Username is required");
    }
    const parsedAge = parseInt(age, 10);
    if (!parsedAge || parsedAge < 13) {
      return showError("Please enter a valid age (13 or older)");
    }
    if (!gender) {
      return showError("Please select a gender");
    }
    return true;
  };

  const validateLoginInputs = (): boolean => {
    setError("");
    if (!email.trim()) {
      return showError("Email is required");
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return showError("Please enter a valid email address");
    }
    if (!password) {
      return showError("Password is required");
    }
    return true;
  };

  const showError = (message: string): boolean => {
    setError(message);
    return false;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      animateSwitch(undefined, 2);
    }
  };

  const handleAuth = async () => {
    if (type === "login") {
      if (!validateLoginInputs()) return;
      setLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        Vibration.vibrate(100);
        router.replace("/(tabs)/home");
      } catch (error: any) {
        let errorMessage = "An error occurred. Please try again.";
        switch (error.code) {
          case "auth/invalid-email":
            errorMessage = "Invalid email format";
            break;
          case "auth/invalid-credential":
              errorMessage = "Invalid login credentials. Please try again.";
            break;
          case "auth/user-not-found":
          case "auth/wrong-password":
            errorMessage = "Invalid email or password";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many attempts. Please try again later";
            break;
          case "auth/network-request-failed":
            errorMessage = "Network error. Please check your connection";
            break;
        }
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else if (type === "register" && step === 2) {
      if (!(await validateStep2())) return;
      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (!user) {
          return showError("User account could not be created.");
        }

        const userData = {
          email,
          username: username.toLowerCase(),
          age: parseInt(age, 10),
          gender,
          createdAt: new Date(),
        };

        await setDoc(doc(FIREBASE_DB, "users", user.uid), userData);
        Vibration.vibrate(100);
        router.replace("/(tabs)/home");
      } catch (error: any) {
        let errorMessage = "An error occurred. Please try again.";
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "This email is already registered";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email format";
            break;
          case "auth/network-request-failed":
            errorMessage = "Network error. Please check your connection";
            break;
          case "permission-denied":
            errorMessage = "Permission denied to write to Firestore";
            break;
          default:
            errorMessage = `Unexpected error: ${error.code}`;
        }
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <LinearGradient colors={["#0F0F0F", "#1A1A1A"]} style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      )}


      <View style={styles.header}>
        
        <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>MyApp</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.formContainer}>
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {type === "register" && step === 2 ? (
  <View style={styles.titleRow}>
    <TouchableOpacity
      onPress={() => animateSwitch(undefined, 1)}
      style={styles.backButton}
    >
      <Ionicons name="arrow-back" size={24} color="white" />
    </TouchableOpacity>
    <Text style={styles.title}>Complete Profile</Text>
  </View>
) : (
  <Text style={styles.title}>
    {type === "login" ? "Welcome Back" : "Create Account"}
  </Text>
)}

          
          <Text style={styles.subtitle}>
            {type === "login"
              ? "Sign in to continue your journey"
              : step === 1
              ? "Get started with your free account"
              : "Finish setting up your profile"}
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {type === "login" || step === 1 ? (
            <>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email address"
                  placeholderTextColor="#666"
                  style={styles.inputField}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#666"
                  style={styles.inputField}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {type === "register" && (
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor="#666"
                    style={styles.inputField}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Username"
                  placeholderTextColor="#666"
                  style={styles.inputField}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Age"
                  placeholderTextColor="#666"
                  style={styles.inputField}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>
              <Text>
              <View style={styles.pickerContainer}>
  <Picker
    selectedValue={gender}
    onValueChange={(itemValue) => setGender(itemValue)}
    style={styles.picker}
    mode="dropdown"
    dropdownIconColor="#FFF" // Changes dropdown arrow color
  >
    <Picker.Item label="Select Gender" value="" color="grey" />
    <Picker.Item label="Male" value="Male" color="black" />
    <Picker.Item label="Female" value="Female" color="black" />
    <Picker.Item label="Other" value="Other" color="black" />
  </Picker>
</View></Text>
            </>
          )}

          <TouchableOpacity
            onPress={type === "register" && step === 1 ? handleNextStep : handleAuth}
            activeOpacity={0.9}
            disabled={loading}
          >
            <LinearGradient
              colors={["#FF6B6B", "#FF8E53"]}
              style={styles.btnPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnPrimaryText}>
                {type === "login" ? "Sign In" : step === 1 ? "Next" : "Sign Up"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.switchText}>
            {type === "login" ? "New to MyApp?" : "Already have an account?"}
            <Text
              style={styles.linkText}
              onPress={() => animateSwitch(type === "login" ? "register" : "login")}
            >
              {type === "login" ? " Sign Up" : " Sign in"}
            </Text>
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    left: -5,
    top: 15,
    transform: [{ translateY: -12 }], // Vertically center icon
    zIndex: 10,
    borderColor: "#2e2e2e",
    borderWidth: 2,
    borderRadius: 50,
    padding: 5,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: 80,
    marginTop: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
    marginTop: 10,
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "black",
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
    textAlign: "center",
  },
  titleRow: {
    display: "flex",
    position: "relative",
    justifyContent: "space-between",

  },
  
  subtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#444",
    height: 50,
    paddingHorizontal: 10,
    overflow: "hidden", // Add overflow hidden for consistency
  },
  picker: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: -5, // Better icon alignment
    paddingVertical: 8, // Better vertical alignment
  },
  inputIcon: {
    marginLeft: 15,
  },
  inputField: {
    flex: 1,
    padding: 16,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  btnPrimary: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "transparent",
    overflow: "hidden",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  btnPrimaryText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  switchText: {
    marginTop: 20,
    color: "#888",
    textAlign: "center",
    fontSize: 15,
  },
  linkText: {
    color: "#FF8E53",
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 15, 15, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "500",
  },
});

export default AuthScreen;