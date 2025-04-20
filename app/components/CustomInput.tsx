import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";


type IconName = "musical-notes" | "information-circle" | "people" | "person" | "trophy" | "calendar" | "add" | "remove";

export function CustomInput({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  height = 50,
  keyboardType = "default",
  icon,
  error,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  multiline?: boolean;
  height?: number;
  keyboardType?: any;
  icon: IconName;
  error?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabelContainer}>
        <Text style={styles.label}>{label}</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: isFocused ? "#9333ea" : "#333333",
            borderWidth: isFocused ? 2 : 1,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={isFocused ? "#9333ea" : "#aaa"} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { height }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#888"
          multiline={multiline}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 50,
    },
    header: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center",
      marginBottom: 20,
      textShadowColor: "rgba(147, 51, 234, 0.5)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: "#fff",
    },
    card: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
      overflow: "hidden",
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabelContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: "#ccc",
      marginBottom: 8,
    },
    errorText: {
      fontSize: 12,
      color: "#ff6b6b",
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#1a1a1a",
      borderRadius: 12,
      overflow: "hidden",
    },
    input: {
      flex: 1,
      color: "#fff",
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 12,
    },
    inputIcon: {
      marginHorizontal: 12,
    },
    pickerWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#1a1a1a",
      borderRadius: 12,
      overflow: "hidden",
    },
    picker: {
      flex: 1,
      color: "#fff",
      height: 50,
    },
    stepperContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#1a1a1a",
      borderRadius: 12,
      padding: 10,
    },
    stepButton: {
      backgroundColor: "#9333ea",
      borderRadius: 8,
      padding: 8,
    },
    stepValue: {
      fontSize: 18,
      fontWeight: "600",
      color: "#fff",
      marginHorizontal: 20,
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#1a1a1a",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: "#333",
    },
    dateButtonText: {
      fontSize: 16,
      color: "#fff",
    },
    previewCard: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
    },
    previewTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#fff",
      marginBottom: 12,
    },
    previewContent: {
      padding: 12,
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      borderRadius: 8,
    },
    previewText: {
      fontSize: 14,
      color: "#ccc",
      marginBottom: 8,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
    hostButton: {
      flex: 1,
      borderRadius: 16,
      overflow: "hidden",
      marginLeft: 10,
    },
    hostButtonGradient: {
      paddingVertical: 16,
      alignItems: "center",
    },
    hostButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#fff",
    },
    cancelButton: {
      flex: 1,
      backgroundColor: "#333",
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
      marginRight: 10,
    },
    cancelButtonText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#ccc",
    },
  });