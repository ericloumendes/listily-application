import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import Toast from "react-native-toast-message";
import { OfflineProvider } from "../context/OfflineContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <ThemeProvider>
          <Slot />
          <Toast />
        </ThemeProvider>
      </OfflineProvider>
    </AuthProvider>
  );
}
