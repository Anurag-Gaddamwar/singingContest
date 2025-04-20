import { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { Text } from "@/components/Themed";
import * as ImagePicker from "expo-image-picker";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";

const DEFAULT_PROFILE_IMAGE = require("@/assets/images/default_profile.png");

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const db = getFirestore();
  const storage = getStorage();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || "");
          setAge(data.age || "");
          setProfileImage(data.profileImage || null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [user]);

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!pickerResult.canceled) {
      const uri = pickerResult.assets[0].uri;
      await uploadImageToFirebase(uri);
    }
  };

  const uploadImageToFirebase = async (uri: string) => {
    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }
  
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const imageRef = ref(storage, `profileImages/${user.uid}.jpg`);
      await uploadBytes(imageRef, blob);
      const downloadUrl = await getDownloadURL(imageRef);
      setProfileImage(downloadUrl);
    } catch (err: any) {
      console.error("Upload error", err);
      Alert.alert("Upload Failed", err.message || "Something went wrong.");
    }
  };
  

  const handleSave = async () => {
    if (!username || !age) {
      Alert.alert("Missing Fields", "Username and Age are required.");
      return;
    }

    if (!user) {
      Alert.alert("Error", "User not found.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        username,
        age,
        profileImage: profileImage || "",
      });

      // Extend the user object
      setUser({
        ...user,
        username,
        age,
        profileImage: profileImage ?? undefined,
      });

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not update profile.");
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleImagePick}>
        <Image
          source={profileImage ? { uri: profileImage } : DEFAULT_PROFILE_IMAGE}
          style={styles.avatar}
        />
        <Text style={styles.changePicText}>Tap to change picture</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        placeholder="Enter age"
        placeholderTextColor="#999"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#1e1e1e",
    flex: 1,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#555",
  },
  changePicText: {
    textAlign: "center",
    color: "#aaa",
    marginBottom: 20,
  },
  label: {
    color: "#ccc",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2c2c2c",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
