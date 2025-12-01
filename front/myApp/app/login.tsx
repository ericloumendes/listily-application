import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  Snackbar,
  Divider,
  useTheme,
} from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const theme = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ visible: boolean; msg: string; ok?: boolean }>({
    visible: false,
    msg: "",
    ok: false,
  });

  const emailInvalid = !!email && !/^\S+@\S+.\S+$/.test(email);
  const passwordInvalid = !!password && password.length < 0;

  const handleLogin = async () => {
    if (emailInvalid || passwordInvalid) {
      Toast.show({ type: "error", text1: "Verifique suas credenciais!" });
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
      Toast.show({ type: "success", text1: "Bem-vindo de volta! 🎉" });
    } catch (e) {
      Toast.show({ type: "error", text1: "Credênciais inválidas!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Logo + brand */}
      <View style={styles.header}>
        {/* Put your logo at: /app/../assets/listily-logo.png */}
        <Image
          source={require("../assets/listily_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text variant="headlineLarge" style={[styles.brand, { color: theme.colors.onBackground }]}>
          listily
        </Text>
      </View>

      {/* Inputs */}
      <View style={styles.form}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={emailInvalid}
          mode="outlined"
          style={styles.input}
        />
        <HelperText type={emailInvalid ? "error" : "info"} visible={!!email}>
          {emailInvalid ? "Email inválido." : "Digite seu email."}
        </HelperText>

        <TextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPass}
          error={passwordInvalid}
          mode="outlined"
          style={styles.input}
          right={
            <TextInput.Icon
              icon={showPass ? "eye-off" : "eye"}
              onPress={() => setShowPass((s) => !s)}
            />
          }
        />
        <HelperText type={passwordInvalid ? "error" : "info"} visible={!!password}>
          {passwordInvalid ? "Mínimo de 6 caracteres." : " "}
        </HelperText>

        {/* Forgot password link */}
        {/*<Text
          style={styles.forgot}
          onPress={() => router.push("/forgot-password")}
        >
          Esqueceu a senha?
        </Text>*/}

        {/* Login button */}
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.loginBtn}
          contentStyle={{ height: 48 }}
        >
          Login
        </Button>
      </View>

      {/* Divider text (no social wired yet) */}
      {/*<View style={styles.dividerRow}>
        <Divider style={styles.divider} />
        <Text style={styles.dividerText}>Realize Login por outras plataformas</Text>
        <Divider style={styles.divider} />
      </View>*/}

      {/* Register link */}
      <View style={styles.dividerRow}>
        <Divider style={styles.divider} />
        <Text
          style={[styles.dividerText, { color: theme.colors.onBackground }]}
          onPress={() => router.push("/register")}
        >
          Ainda não possui uma conta? Cadastre-se
        </Text>
        <Divider style={styles.divider} />
      </View>

      {/* Snackbar feedback */}
      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
        duration={2200}
        style={{ backgroundColor: snack.ok ? "#2E7D32" : "#B00020" }}
      >
        {snack.msg}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { alignItems: "center", marginTop: 24, marginBottom: 8 },
  logo: { width: 140, height: 140, marginBottom: 4 },
  brand: { color: "#2f6f46", fontWeight: "700", letterSpacing: 0.5 },

  form: { marginTop: 8 },
  input: { borderRadius: 12, marginBottom: 4 },
  forgot: {
    alignSelf: "flex-end",
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 12,
  },
  loginBtn: { borderRadius: 12, marginTop: 4 },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 12,
  },
  divider: { flex: 1, height: 1 },
  dividerText: { color: "#9ca3af", fontSize: 12 },
});
