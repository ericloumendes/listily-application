import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const LIGHT_PRIMARY = "#2F80ED";
const OUTLINE = "#D1D5DB";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync("theme");
        setIsDark(saved === "dark");
      } catch {}
    })();
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    try {
      await SecureStore.setItemAsync("theme", next ? "dark" : "light");
    } catch {}
  };

  const paperTheme = isDark
    ? {
        ...MD3DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          primary: LIGHT_PRIMARY,
          outline: OUTLINE,
          background: "#0B1220",
          surface: "#0F172A",
          onSurface: "#E5E7EB",
          onBackground: "#E5E7EB",
        },
      }
    : {
        ...MD3LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          primary: LIGHT_PRIMARY,
          outline: OUTLINE,
          background: "#FFFFFF",
          surface: "#FFFFFF",
          onSurface: "#111827",
          onBackground: "#111827",
        },
      };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeController() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeController must be used within ThemeProvider");
  return ctx;
}
