import { Slot } from "expo-router";
import { MD3LightTheme as DefaultTheme, PaperProvider } from "react-native-paper";
import { AuthProvider } from "../context/AuthContext";
import Toast from "react-native-toast-message";

const theme = {
  ...DefaultTheme,
  roundness: 12,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2F80ED",     // button color
    outline: "#D1D5DB",     // input outline neutral
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
    <PaperProvider theme={theme}>
      <Slot />
      <Toast /> {/* ✅ Toast container */}
    </PaperProvider>
    </AuthProvider>
  );
}
