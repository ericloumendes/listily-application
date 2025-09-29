import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text, Image } from "react-native";
import { Button, Snackbar, Searchbar, Card } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { getAllSupermercados } from "../../services/supermercado_service"; // Import the service to fetch supermercados
import { Supermercado } from "../../interfaces/supermercado_interface"; // Import Supermercado type
import { router, useFocusEffect } from "expo-router";

export default function SupermercadosPage() {
  const { token } = useAuth();
  const [supermercados, setSupermercados] = useState<Supermercado[]>([]);
  const [filteredSupermercados, setFilteredSupermercados] = useState<Supermercado[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<{ visible: boolean; msg: string; ok?: boolean }>({
    visible: false,
    msg: "",
    ok: false,
  });

  useFocusEffect(useCallback(() => {
    const fetchSupermercados = async () => {
      try {
        const fetchedSupermercados = await getAllSupermercados(token); // Fetch all Supermercados from backend
        setSupermercados(fetchedSupermercados);
        setFilteredSupermercados(fetchedSupermercados); // Initialize filtered supermarkets
      } catch (err) {
        setSnack({ visible: true, msg: "Erro ao carregar supermercados.", ok: false });
      } finally {
        setLoading(false);
      }
    };

    fetchSupermercados();
  }, [token]));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      // Filter Supermercados based on the search query (match 'nome' or 'endereco')
      const filtered = supermercados.filter(
        (supermercado) =>
          supermercado.nome.toLowerCase().includes(query.toLowerCase()) ||
          supermercado.endereco.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSupermercados(filtered);
    } else {
      setFilteredSupermercados(supermercados); // Show all Supermercados if search is cleared
    }
  };

  const renderSupermercado = ({ item }: { item: Supermercado }) => (
    <Card mode="outlined" style={styles.card}>
      <Card.Content>
        <Text style={styles.supermercadoName}>{item.nome}</Text>
        <Text style={styles.supermercadoEndereco}>{item.endereco}</Text>
        <Button mode="text" onPress={() => {router.push(`/create-produto/${item.pk}`);}} style={styles.anchorButton}>
          Selecionar
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supermercados</Text>

      {/* Searchbar to filter supermercados */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Pesquisar por nome ou endereço"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <FlatList
          data={filteredSupermercados}
          keyExtractor={(item) => item.pk.toString()}
          renderItem={renderSupermercado}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum Supermercado encontrado.</Text>}
        />
      )}

        <Button
        mode="contained"
        onPress={() => router.push("/create-supermercado")} // Navigate to supermercado create page
        style={styles.createButton}
      >
        Criar Supermercado
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
  productImage: { width: 100, height: 100, marginBottom: 8, borderRadius: 8 },
  supermercadoName: { fontSize: 18, fontWeight: "bold" },
  supermercadoEndereco: { fontSize: 14, color: "#555" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#aaa" },
  searchContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  searchbar: { width: "100%" },
  anchorButton: { marginTop: 8, color: "#2E7D32" }, // Green "Detalhes" button
  card: { marginBottom: 16, borderRadius: 8 },
  createButton: { marginTop: 20},
});
