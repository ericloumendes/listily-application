import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { Card, Button, Snackbar, Searchbar } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { getListas } from "../../services/lista_service";
import { router, useFocusEffect } from "expo-router";
import { Lista } from "../../interfaces/lista_interface";
import Toast from "react-native-toast-message";

export default function AboutScreen() {
  const { token } = useAuth();
  const [listas, setListas] = useState<Lista[]>([]);
  const [filteredListas, setFilteredListas] = useState<Lista[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<{ visible: boolean; msg: string; ok?: boolean }>({
    visible: false,
    msg: "",
    ok: false,
  });

  useFocusEffect(useCallback(() => {
    const fetchListas = async () => {
      if (token) {
        try {
          const listasData = await getListas(token);
          setListas(listasData);
          setFilteredListas(listasData); // Initialize filtered with all Listas
        } catch (err) {
          Toast.show({ type: "error", text1: "Nenhuma lista encontrada." });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchListas();
  }, [token]));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const filtered = listas.filter((lista) =>
        lista.nome.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredListas(filtered);
    } else {
      setFilteredListas(listas);
    }
  };

  const renderLista = ({ item }: { item: Lista }) => (
    <Card mode="outlined" style={styles.card} onPress={() => router.push(`/detail-lista/${item.pk}`)}>
      <Card.Content>
        <Text style={styles.cardTitle}>{item.nome}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suas Listas</Text>

      {/* Searchbar */}
      <Searchbar
        placeholder="Pesquisar Listas..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* List View */}
      <FlatList
        data={filteredListas}
        keyExtractor={(item) => item.pk.toString()}
        renderItem={renderLista}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma Lista encontrada.</Text>}
      />

      {/* Loading state */}
      {loading && <Text>Carregando...</Text>}

      {/* Button to navigate to Create Lista screen */}
      <Button
        mode="contained"
        onPress={() => router.push("/create-lista")}
        style={styles.createBtn}
      >
        Criar Nova Lista
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
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  card: { marginBottom: 16, borderRadius: 8 },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardSubtitle: { fontSize: 14, color: "#555" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#aaa" },
  searchbar: { marginBottom: 20 },
  createBtn: { marginTop: 20, alignSelf: "center", width: "60%" },
});
