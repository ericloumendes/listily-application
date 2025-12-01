import { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Button, Text, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { createSupermercado } from "../../services/supermercado_service"; // Create supermercado service
import { router } from "expo-router";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";

export default function SupermercadoCreateScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { token } = useAuth();
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFim, setHorarioFim] = useState("");
  const [showDiasDropdown, setShowDiasDropdown] = useState(false);
  const [diasBinario, setDiasBinario] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const diasLabel = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  const toggleDiaIndex = (idx: number) => {
    setDiasBinario((prev) => prev.map((v, i) => (i === idx ? (v === 1 ? 0 : 1) : v)));
  };
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
    if (!nome || !endereco || !latitude || !longitude || !horarioInicio || !horarioFim || !diasBinario.some((v) => v === 1)) {
      setMessage("Todos os campos são obrigatórios.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Call the createSupermercado service to make the POST request
      const diasSelecionados = diasBinario
        .map((v, i) => (v === 1 ? diasLabel[i] : null))
        .filter((d): d is string => d !== null);
      await createSupermercado(
        nome,
        endereco,
        latitude,
        longitude,
        horarioInicio,
        horarioFim,
        diasSelecionados,
        token
      );
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>Criar Supermercado</Text>

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

      <TextInput
        style={styles.input}
        placeholder="Horário de Início (HH:MM)"
        value={horarioInicio}
        onChangeText={setHorarioInicio}
      />

      <TextInput
        style={styles.input}
        placeholder="Horário de Fim (HH:MM)"
        value={horarioFim}
        onChangeText={setHorarioFim}
      />

      <View style={styles.dropdownContainer}>
        <TouchableOpacity style={styles.dropdownHeader} onPress={() => setShowDiasDropdown((s) => !s)}>
          <Text style={[styles.dropdownHeaderText, { color: theme.colors.onBackground }]}>Dias de funcionamento</Text>
          <Text style={[styles.dropdownHeaderSummary, { color: theme.colors.onBackground }] }>
            {diasBinario.every((v) => v === 0)
              ? "Nenhum selecionado"
              : diasBinario
                  .map((v, i) => (v === 1 ? diasLabel[i].toUpperCase() : null))
                  .filter(Boolean)
                  .join(", ")}
          </Text>
        </TouchableOpacity>
        {showDiasDropdown && (
          <View style={styles.dropdownList}>
            {diasLabel.map((dia, idx) => {
              const selected = diasBinario[idx] === 1;
              return (
                <TouchableOpacity key={dia} style={styles.dayRow} onPress={() => toggleDiaIndex(idx)}>
                  <View style={[styles.checkbox, selected && styles.checkboxSelected]} />
                  <Text style={[styles.dayRowText, { color: theme.colors.onBackground }]}>{dia.toUpperCase()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

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
      {message && <Text style={[styles.message, { color: theme.colors.onBackground }]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { height: 40, borderColor: "#ccc", borderWidth: 1, marginBottom: 20, paddingLeft: 10 },
  message: { textAlign: "center", marginTop: 20 },
  spacer: { height: 10 },
  daysContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  dayPill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: "#ccc", backgroundColor: "#f7f7f7", marginRight: 8, marginBottom: 8 },
  dayPillSelected: { backgroundColor: "#2196F3", borderColor: "#2196F3" },
  dayText: { color: "#333", fontWeight: "600" },
  dayTextSelected: { color: "#fff" },
  dropdownContainer: { marginBottom: 20, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, overflow: "hidden" },
  dropdownHeader: { paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "#f7f7f7", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dropdownHeaderText: { fontSize: 16, fontWeight: "600", color: "#333" },
  dropdownHeaderSummary: { fontSize: 14, color: "#555" },
  dropdownList: { paddingHorizontal: 8, paddingVertical: 8, backgroundColor: "#fff" },
  dayRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: "#888", marginRight: 10, backgroundColor: "#fff" },
  checkboxSelected: { backgroundColor: "#2196F3", borderColor: "#2196F3" },
  dayRowText: { fontSize: 15, color: "#333", fontWeight: "600" },
});
