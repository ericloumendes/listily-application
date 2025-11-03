import { Slot } from "expo-router";
import { MD3LightTheme as DefaultTheme, PaperProvider } from "react-native-paper";
import { AuthProvider } from "../context/AuthContext";
import Toast from "react-native-toast-message";
import { OfflineProvider } from "../context/OfflineContext";

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
      <OfflineProvider>
        <PaperProvider theme={theme}>
          <Slot />
          <Toast />
        </PaperProvider>
      </OfflineProvider>
    </AuthProvider>
  );
}
