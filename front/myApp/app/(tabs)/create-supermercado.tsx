import { useState } from "react";
import { View, StyleSheet, TextInput, Button, Text } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { createSupermercado } from "../../services/supermercado_service"; // Create supermercado service
import { router } from "expo-router";

export default function SupermercadoCreateScreen({ navigation }: { navigation: any }) {
  const { token } = useAuth();
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!nome || !endereco) {
      setMessage("Todos os campos são obrigatórios.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Call the createSupermercado service to make the POST request
      await createSupermercado(nome, endereco, token);
      setMessage("Supermercado criado com sucesso!");
      // Redirect back to the supermercado list page after success
      router.push("/list-supermercado");
    } catch (err) {
      setMessage("Erro ao criar supermercado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Supermercado</Text>

      {/* Nome Input */}
      <TextInput
        style={styles.input}
        placeholder="Nome do Supermercado"
        value={nome}
        onChangeText={setNome}
      />

      {/* Endereco Input */}
      <TextInput
        style={styles.input}
        placeholder="Endereço do Supermercado"
        value={endereco}
        onChangeText={setEndereco}
      />

      {/* Submit Button */}
      <Button
        title={loading ? "Criando..." : "Criar Supermercado"}
        onPress={handleSubmit}
        disabled={loading}
      />

      {/* Feedback message */}
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { height: 40, borderColor: "#ccc", borderWidth: 1, marginBottom: 20, paddingLeft: 10 },
  message: { color: "green", textAlign: "center", marginTop: 20 },
});
