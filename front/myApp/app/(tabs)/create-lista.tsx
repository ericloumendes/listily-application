import { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput, Button, Snackbar, useTheme } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { createLista } from "../../services/lista_service";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export default function CreateListaScreen() {
  const theme = useTheme();
  const { token } = useAuth();
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ visible: boolean; msg: string; ok?: boolean }>({
    visible: false,
    msg: "",
    ok: false,
  });

  const nomeInvalid = !!nome && nome.trim().length < 2;

  const handleCreate = async () => {
    if (nomeInvalid || !nome) {
      Toast.show({ type: "error", text1: "Confira o nome da lista." });
      return;
    }

    try {
      setLoading(true);
      await createLista(nome, token);
      Toast.show({ type: "success", text1: "Lista criada com sucesso! 🎉" });

      // Reset form after creation
      setNome("");

      // Navigate back to the About page (List view)
      router.replace("/about"); // Ensure About page is refreshed
    } catch (e: any) {
      setSnack({ visible: true, msg: e?.message || "Erro ao criar Lista.", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>Criar Nova Lista</Text>

      <TextInput
        label="Nome da Lista"
        value={nome}
        onChangeText={setNome}
        mode="outlined"
        error={nomeInvalid}
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleCreate}
        loading={loading}
        disabled={loading}
        style={styles.primaryBtn}
        contentStyle={{ height: 48 }}
      >
        Criar Lista
      </Button>

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
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderRadius: 12, marginBottom: 16 },
  primaryBtn: { borderRadius: 12, marginTop: 8 },
});
