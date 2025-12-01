import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import { createOferta } from "../../services/ofertas_service";

export default function RegistrarOfertaScreen() {
  const theme = useTheme();
  const { produtoPk } = useLocalSearchParams<{ produtoPk: string }>();
  const { token } = useAuth();

  const [tipo, setTipo] = useState("");
  const [preco, setPreco] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!tipo || !preco || !dataFim) {
      Toast.show({ type: "error", text1: "Preencha todos os campos." });
      return;
    }
    const precoNumber = Number(preco.replace(",", "."));
    if (Number.isNaN(precoNumber) || precoNumber <= 0) {
      Toast.show({ type: "error", text1: "Preço inválido." });
      return;
    }
    const produto_pk = Number(produtoPk);
    if (!produto_pk) {
      Toast.show({ type: "error", text1: "Produto inválido." });
      return;
    }

    try {
      setSubmitting(true);
      await createOferta(tipo, precoNumber, dataFim, produto_pk, token);
      Toast.show({ type: "success", text1: "Oferta registrada com sucesso." });
      router.back();
    } catch (e) {
      Toast.show({ type: "error", text1: "Erro ao registrar oferta." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onBackground }]}>Registrar oferta</Text>
      <TextInput
        label="Tipo"
        value={tipo}
        onChangeText={setTipo}
        style={styles.input}
      />
      <TextInput
        label="Preço"
        value={preco}
        onChangeText={setPreco}
        keyboardType="decimal-pad"
        style={styles.input}
      />
      <TextInput
        label="Data fim (YYYY-MM-DD)"
        value={dataFim}
        onChangeText={setDataFim}
        placeholder="2025-12-31"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting}>
        Registrar oferta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { textAlign: "center", marginBottom: 12 },
  input: { marginBottom: 12 },
});
