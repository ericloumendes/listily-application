import { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Button, Text } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { createSupermercado } from "../../services/supermercado_service"; // Create supermercado service
import { router } from "expo-router";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";

export default function SupermercadoCreateScreen({ navigation }: { navigation: any }) {
  const { token } = useAuth();
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === "granted");
    };
    getLocationPermission();
  }, []);

  const handleGetLocation = async () => {
    if (!hasLocationPermission) {
      Toast.show({ type: "error", text1: "Permissão de localização negada." });
      return;
    }

    setLoadingLocation(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());
      Toast.show({ type: "success", text1: "Localização obtida com sucesso!" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Erro ao obter localização." });
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!nome || !endereco || !latitude || !longitude) {
      setMessage("Todos os campos são obrigatórios.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Call the createSupermercado service to make the POST request
      await createSupermercado(nome, endereco, latitude, longitude, token);
      setMessage("Supermercado criado com sucesso!");
      // Redirect back to the supermercado list page after success
      router.push("/list-supermercado");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao criar supermercado.";
      setMessage(msg);
      Toast.show({ type: "error", text1: msg });
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

      {/* Latitude Input */}
      <TextInput
        style={styles.input}
        placeholder="Latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />

      {/* Longitude Input */}
      <TextInput
        style={styles.input}
        placeholder="Longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
      />

      {/* Get Location Button */}
      <Button
        title={loadingLocation ? "Obtendo localização..." : "Usar Minha Localização"}
        onPress={handleGetLocation}
        disabled={loadingLocation || !hasLocationPermission}
        color="#2196F3"
      />

      <View style={styles.spacer} />

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
  spacer: { height: 10 },
});
