import { useEffect } from "react";
import { View } from "react-native";
import AnimatedIntro from "@/components/AnimatedIntro";
import BottomLoginSheet from "@/components/BottomLoginSheet";
import { useAuth } from "@/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";

export default function Index() {
  const { user, loading } = useAuth();
  const { fromProfile } = useLocalSearchParams();

  // console.log("🏠 [INDEX] user:", user);
  // console.log("🏠 [INDEX] loading:", loading);
  // console.log("🏠 [INDEX] fromProfile:", fromProfile);

  useEffect(() => {
    // console.log("🏠 [INDEX useEffect] user:", user);
    // console.log("🏠 [INDEX useEffect] loading:", loading);
    // console.log("🏠 [INDEX useEffect] fromProfile:", fromProfile);

    if (!loading) {
      if (user && fromProfile !== "true") {
        // console.log("🏠 Redirecting to /tabs");
        router.replace("/(tabs)/home");
      } else {
        // console.log("🏠 Staying on /index");
      }
    }
  }, [user, loading, fromProfile]);

  if (loading) return null;

  return (
    <View style={{ flex: 1 }}>
      <AnimatedIntro />
      <BottomLoginSheet />
    </View>
  );
}
