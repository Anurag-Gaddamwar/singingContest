import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { useRouter } from "expo-router";

export default function ChangePasswordScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getFriendlyErrorMessage = (error: any) => {
    const code = error.code;
  
    switch (code) {
      case "auth/wrong-password":
        return "Current password is incorrect.";
      case "auth/invalid-credential":
        return "Current password is incorrect.";
      case "auth/weak-password":
        return "New password is too weak.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      case "auth/requires-recent-login":
        return "Please log in again to change your password.";
        // Fallback: clean up any ugly "Firebase:" prefix and return
      default:
  // Capitalize and clean generic error messages
  return (
    error?.message?.replace(/^Firebase:\s*/i, "").replace(/\(auth.*\)\.?/, "").trim().replace(/^\w/, (c:any) => c.toUpperCase()) ||
    "Something went wrong."
  );

    }
  };
  

  const handleChangePassword = async () => {
    setErrorMessage(""); // clear previous error
  
    if (!user?.email) {
      setErrorMessage("User not authenticated.");
      return;
    }
  
    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters.");
      return;
    }
  
    setLoading(true);
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
  
    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
  
      // Clear fields
      setCurrentPassword("");
      setNewPassword("");
  
      // Show confirmation and then navigate back
      return Alert.alert("Success", "Password changed successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      const message = getFriendlyErrorMessage(error);
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Change Password</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          placeholderTextColor="#888"
        />
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <TouchableOpacity
        style={[
          styles.button,
          (loading || !currentPassword || !newPassword) && {
            backgroundColor: "#444",
          },
        ]}
        onPress={handleChangePassword}
        disabled={loading || !currentPassword || !newPassword}
      >
        <Text style={styles.buttonText}>
          {loading ? "Updating..." : "Change Password"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  heading: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#aaa",
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#1f1f1f",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#2e2e2e",
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
