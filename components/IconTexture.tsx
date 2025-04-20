import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

type IconTextureProps = {
  icon?: FeatherIconName;
  size?: number;
  opacity?: number;
};

export const IconTexture: React.FC<IconTextureProps> = ({
  icon = "mic",
  size = 40,
  opacity = 0.05,
}) => {
  const iconsPerRow = Math.floor(width / size);
  const rows = 6;

  return (
    <View style={styles.wrapper}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {Array.from({ length: iconsPerRow }).map((_, colIndex) => (
            <Feather
              key={`${rowIndex}-${colIndex}`}
              name={icon}
              size={size}
              color="#fff"
              style={{ opacity, marginRight: 5 }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    flexDirection: "column",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
  },
});
