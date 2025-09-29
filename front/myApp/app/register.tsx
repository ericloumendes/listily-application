import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text, TextInput, Button, HelperText, Snackbar } from "react-native-paper";
import { router } from "expo-router";
import { registerUsuario } from "../services/usuario_service";
import { Usuario } from "../interfaces/usuario_interface";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rg, setRg] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ visible: boolean; msg: string; ok?: boolean }>({
    visible: false,
    msg: "",
    ok: false,
  });

  const emailInvalid = !!email && !/^\S+@\S+\.\S+$/.test(email);
  const nomeInvalid = !!nome && nome.trim().length < 2;
  const rgInvalid = !!rg && rg.replace(/\D/g, "").length < 5;
  const senhaInvalid = !!senha && senha.length < 6;

  async function handleRegister() {
    if (nomeInvalid || emailInvalid || senhaInvalid || rgInvalid || !nome || !email || !senha || !rg) {
      Toast.show({ type: "error", text1: "Confira os campos do formulário." });
      return;
    }

    const payload: Usuario = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha,
      rg: rg.trim(),
      data_criacao: new Date(),
    };

    try {
      setLoading(true);
      await registerUsuario(payload);
      Toast.show({ type: "success", text1: "Conta criada com sucesso! 🎉" });

      setTimeout(() => {
        router.replace("/login");
      }, 800);
    } catch (e: any) {
      Toast.show({ type: "error", text1: e?.message || "Erro ao registrar." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.header}>
        <Image
          source={require("../assets/listily_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text variant="headlineLarge" style={styles.brand}>
          listily
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
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
          error={emailInvalid}
          style={styles.input}
        />
        <HelperText type={emailInvalid ? "error" : "info"} visible={!!email}>
          {emailInvalid ? "Email inválido." : "Vamos usá-lo para login."}
        </HelperText>

        <TextInput
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          mode="outlined"
          secureTextEntry={!showPass}
          error={senhaInvalid}
          style={styles.input}
          right={
            <TextInput.Icon
              icon={showPass ? "eye-off" : "eye"}
              onPress={() => setShowPass((s) => !s)}
            />
          }
        />
        <HelperText type={senhaInvalid ? "error" : "info"} visible={!!senha}>
          {senhaInvalid ? "Mínimo de 6 caracteres." : "Crie uma senha segura."}
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
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.primaryBtn}
          contentStyle={{ height: 48 }}
        >
          Registrar
        </Button>

        <Text
          style={styles.bottomLink}
          onPress={() => router.replace("/login")}
        >
          Já tem uma conta? Entrar
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
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  header: { alignItems: "center", marginTop: 24, marginBottom: 8 },
  logo: { width: 140, height: 140, marginBottom: 4 }, // increased size of the logo
  brand: { color: "#2f6f46", fontWeight: "700", letterSpacing: 0.5 },

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
