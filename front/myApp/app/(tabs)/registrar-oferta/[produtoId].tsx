import { useState } from "react";
import { View, StyleSheet, TextInput, Button, Text, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import { useAuth } from "../../../context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import { createOferta } from "../../../services/ofertas_service";

export default function RegistrarOfertaScreen() {
  const theme = useTheme();
  const { token } = useAuth();
  const { produtoId } = useLocalSearchParams();

  const [tipo, setTipo] = useState<string>("");
  const [preco, setPreco] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showTipoDropdown, setShowTipoDropdown] = useState(false);
  const tipoOptions = ["Cartão clube", "Promoção", "Desconto"] as const;

  const normalizeDateInput = (input: string) => {
    // Accepts either "YYYY-MM-DD HH:mm" or "DD/MM/YYYY HH:mm"
    const trimmed = input.trim();
    if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}$/.test(trimmed)) {
      const [datePart, timePart] = trimmed.split(/\s+/);
      const [dd, mm, yyyy] = datePart.split("/");
      return `${yyyy}-${mm}-${dd} ${timePart}`; // normalize to ISO-like with space
    }
    return trimmed;
  };

  const handleSubmit = async () => {
    if (!tipo || !preco || !dataFim) {
      setMessage("Todos os campos são obrigatórios.");
      return;
    }

    const precoNumber = parseFloat(preco.replace(",", "."));
    if (Number.isNaN(precoNumber) || precoNumber <= 0) {
      setMessage("Preço inválido.");
      return;
    }

    const produto_pk = Number.parseInt(String(produtoId));
    if (!produto_pk) {
      setMessage("Produto inválido.");
      return;
    }

    const normalized = normalizeDateInput(dataFim);
    // Validate datetime
    const parsed = new Date(normalized.replace(" ", "T"));
    if (isNaN(parsed.getTime())) {
      setMessage("Data fim inválida. Use DD/MM/AAAA HH:mm");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const isoInput = normalized.replace(" ", "T");
      await createOferta(tipo, precoNumber, isoInput, produto_pk, token);
      setMessage("Oferta registrada com sucesso!");
    } catch (err) {
      setMessage("Erro ao registrar oferta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>Registrar Oferta</Text>
      <View style={styles.dropdownContainer}>
        <TouchableOpacity style={styles.dropdownHeader} onPress={() => setShowTipoDropdown((s) => !s)}>
          <Text style={[styles.dropdownHeaderText, { color: theme.colors.onBackground }]}>Tipo de oferta</Text>
          <Text style={[styles.dropdownHeaderSummary, { color: theme.colors.onBackground }]}>{tipo || "Nenhum selecionado"}</Text>
        </TouchableOpacity>
        {showTipoDropdown && (
          <View style={styles.dropdownList}>
            {tipoOptions.map((opt) => {
              const selected = tipo === opt;
              return (
                <TouchableOpacity key={opt} style={styles.optionRow} onPress={() => { setTipo(opt); setShowTipoDropdown(false); }}>
                  <View style={[styles.checkbox, selected && styles.checkboxSelected]} />
                  <Text style={[styles.optionRowText, { color: theme.colors.onBackground }]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        placeholder="Preço"
        value={preco}
        onChangeText={setPreco}
      />

      <Text style={styles.label}>Data fim (DD/MM/AAAA HH:mm)</Text>
      <TextInput
        style={styles.input}
        placeholder="Data do fim da oferta"
        value={dataFim}
        onChangeText={setDataFim}
      />

      <Button
        title={loading ? "Registrando..." : "Registrar"}
        onPress={handleSubmit}
        disabled={loading}
      />

      {message && <Text style={[styles.message, { color: theme.colors.onBackground }]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { height: 40, borderColor: "#ccc", borderWidth: 1, marginBottom: 20, paddingLeft: 10 },
  message: { textAlign: "center", marginTop: 20 },
  label: { fontSize: 14, color: "#555", marginBottom: 6 },
  dropdownContainer: { marginBottom: 20, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, overflow: "hidden" },
  dropdownHeader: { paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "#f7f7f7", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dropdownHeaderText: { fontSize: 16, fontWeight: "600", color: "#333" },
  dropdownHeaderSummary: { fontSize: 14, color: "#555" },
  dropdownList: { paddingHorizontal: 8, paddingVertical: 8, backgroundColor: "#fff" },
  optionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: "#888", marginRight: 10, backgroundColor: "#fff" },
  checkboxSelected: { backgroundColor: "#2196F3", borderColor: "#2196F3" },
  optionRowText: { fontSize: 15, color: "#333", fontWeight: "600" },
});
