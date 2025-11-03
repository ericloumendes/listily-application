import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function OfflineBanner() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Modo offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
    borderWidth: 1,
    marginBottom: 8,
  },
  text: {
    color: "#92400E",
    fontWeight: "600",
  },
});
