import { useState } from "react";
import { View, StyleSheet, TextInput, Button, Text } from "react-native";
import { useTheme } from "react-native-paper";
import { useAuth } from "../../../context/AuthContext";
import { registerPreco } from "../../../services/produto_service"; // Import registerPreco service
import { useLocalSearchParams } from "expo-router";

export default function RegistrarValorScreen() {
  const theme = useTheme();
  const { token } = useAuth();
  const { produtoId } = useLocalSearchParams();
  const [preco, setPreco] = useState<string>(""); // To store the price entered by the user
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null); // Message to display after submitting the form

  const handleSubmit = async () => {
    if (!preco) {
      setMessage("O campo preço é obrigatório.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Call the registerPreco service to make the POST request
      await registerPreco(parseFloat(preco), Number.parseInt(produtoId), token);
      setMessage("Preço registrado com sucesso!");
    } catch (err) {
      setMessage("Erro ao registrar preço.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>Registrar Preço</Text>

      {/* Preço input field */}
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        placeholder="Digite o preço"
        value={preco}
        onChangeText={setPreco}
      />

      {/* Submit button */}
      <Button
        title={loading ? "Registrando..." : "Registrar"}
        onPress={handleSubmit}
        disabled={loading}
      />

      {/* Feedback message */}
      {message && <Text style={[styles.message, { color: theme.colors.onBackground }]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { height: 40, borderColor: "#ccc", borderWidth: 1, marginBottom: 20, paddingLeft: 10 },
  message: { textAlign: "center", marginTop: 20 },
});
