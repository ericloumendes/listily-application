import { useState, useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, TextInput, Button, HelperText, Snackbar, useTheme } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { getUserInfo, updateUserInfo } from "../../services/usuario_service";
import { Usuario } from "../../interfaces/usuario_interface";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useThemeController } from "../../context/ThemeContext";

export default function ProfileScreen() {
  const { token, logout } = useAuth();
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ visible: boolean; msg: string; ok?: boolean }>({
    visible: false,
    msg: "",
    ok: false,
  });

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [rg, setRg] = useState("");
  const { isDark, toggleTheme } = useThemeController();
  const theme = useTheme();

  const nomeInvalid = !!nome && nome.trim().length < 2;
  const rgInvalid = !!rg && rg.replace(/\D/g, "").length < 5;

  useEffect(() => {
    const loadUserData = async () => {
      if (token) {
        try {
          const userData = await getUserInfo(token);
          setUser(userData);
          setNome(userData.nome);
          setEmail(userData.email);
          setRg(userData.rg);
        } catch (err) {
          Toast.show({ type: "error", text1: "Erro ao carregar os dados" });
        }
      }
    };

    loadUserData();
  }, [token]);

  

  const handleSubmit = async () => {
    if (nomeInvalid || rgInvalid || !nome || !email || !rg) {
      Toast.show({ type: "error", text1: "Confira os campos do formulário." });
      return;
    }

    const updatedUser: Usuario = {
      ...user!,
      nome,
      email,
      rg,
      data_criacao: user!.data_criacao, // Preserve creation date
    };

    try {
      setLoading(true);
      await updateUserInfo(updatedUser, token);
      Toast.show({ type: "success", text1: "Dados atualizados com sucesso! 🎉" });
    } catch (e: any) {
      Toast.show({ type: "error", text1: e?.message || "Erro ao atualizar dados." });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onBackground }}>Carregando...</Text>
        <Text
          style={[styles.bottomLink, { color: theme.colors.onBackground }]}
          onPress={logout}
        >
          Logout
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Logo */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/listily_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Button
          mode="outlined"
          onPress={toggleTheme}
          style={{ marginBottom: 12, borderRadius: 12 }}
          contentStyle={{ height: 40 }}
        >
          {isDark ? "Modo Claro" : "Modo Escuro"}
        </Button>
        <TextInput
          label="Nome"
          value={nome}
          onChangeText={setNome}
          mode="outlined"
          error={nomeInvalid}
          style={styles.input}
        />
        <HelperText type={nomeInvalid ? "error" : "info"} visible={!!nome}>
          {nomeInvalid ? "Nome muito curto." : "Seu nome completo."}
        </HelperText>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={false} // Email is read-only
          style={styles.input}
        />
        <HelperText type="info" visible={!!email}>
          Vamos usá-lo para login.
        </HelperText>

        <TextInput
          label="RG"
          value={rg}
          onChangeText={setRg}
          mode="outlined"
          error={rgInvalid}
          style={styles.input}
        />
        <HelperText type={rgInvalid ? "error" : "info"} visible={!!rg}>
          {rgInvalid ? "RG muito curto." : "Somente números e letras válidas."}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.primaryBtn}
          contentStyle={{ height: 48 }}
        >
          Atualizar
        </Button>

        <Text
          style={[styles.bottomLink, { color: theme.colors.onBackground }]}
          onPress={logout}
        >
          Logout
        </Text>
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
  logo: { width: 180, height: 180, marginBottom: 4 },

  form: { marginTop: 8 },
  input: { borderRadius: 12, marginBottom: 4 },
  primaryBtn: { borderRadius: 12, marginTop: 8 },

  bottomLink: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 12,
    textDecorationLine: "underline",
  },
});
