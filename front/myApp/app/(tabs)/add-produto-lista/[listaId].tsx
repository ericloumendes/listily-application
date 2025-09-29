import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text, Image } from "react-native";
import { Button, Searchbar, Snackbar } from "react-native-paper";
import { useAuth } from "../../../context/AuthContext";
import { getAllProdutos } from "../../../services/produto_service"; // Import the new service
import { addProdutoToLista } from "../../../services/lista_service";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Produto } from "../../../interfaces/produto_interface"; // Import Produto type
import Toast from "react-native-toast-message";

export default function AddProdutoScreen() {
  const { token } = useAuth();
  const { listaId } = useLocalSearchParams();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [snack, setSnack] = useState<{ visible: boolean; msg: string; ok?: boolean }>({
    visible: false,
    msg: "",
    ok: false,
  });

  useFocusEffect(useCallback(() => {
    const fetchProdutos = async () => {
      try {
        const fetchedProdutos = await getAllProdutos(token); // Fetch all Produtos from backend
        setProdutos(fetchedProdutos);
        setFilteredProdutos(fetchedProdutos);
      } catch (err) {
        Toast.show({ type: "error", text1: "Erro ao carregar produtos." });
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, [token]));

  const handleAddProduto = async (produtoPk: number) => {
    try {
      setLoading(true);
      await addProdutoToLista(produtoPk, Number.parseInt(listaId), token); // Add Produto to Lista
      Toast.show({ type: "success", text1: "Produto adicionado com sucesso! 🛒." });
    } catch (err) {
      Toast.show({ type: "error", text1: "Erro ao adicionar Produto." });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      // Filter Produtos based on the search query (match 'nome' and 'descricao')
      const filtered = produtos.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(query.toLowerCase()) ||
          produto.descricao.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProdutos(filtered);
    } else {
      setFilteredProdutos(produtos); // Show all Produtos if search is cleared
    }
  };

  const renderProduto = ({ item }: { item: Produto }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imagem }} style={styles.productImage} />
      <Text style={styles.productName}>{item.nome}</Text>
      <Text style={styles.productDescription}>{item.descricao}</Text>
      <Text style={styles.productDescription}>{item.supermercado.nome} - {item.supermercado.endereco}</Text>
      <Button
        mode="contained"
        onPress={() => handleAddProduto(item.pk)}
        loading={loading}
        disabled={loading}
        style={styles.addBtn}
      >
        Adicionar Produto
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Produtos à Lista</Text>

      {/* Searchbar to filter products */}
      <Searchbar
        placeholder="Pesquisar Produtos..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <FlatList
          data={filteredProdutos}
          keyExtractor={(item) => item.pk.toString()}
          renderItem={renderProduto}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum Produto encontrado.</Text>}
        />
      )}

      {/* Snackbar feedback */}
      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
        duration={2200}
        style={{ backgroundColor: snack.ok ? "#2E7D32" : "#B00020" }}
      >
        {snack.msg}
      </Snackbar>

      <Button
        mode="contained"
        onPress={() => router.replace(`/detail-lista/${listaId}`)} // Navigate back to the Lista Detail page
        style={styles.returnBtn}
      >
        Voltar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  card: { marginBottom: 16, borderRadius: 8, padding: 10, backgroundColor: "#f9f9f9" },
  productImage: { width: 100, height: 100, marginBottom: 8, borderRadius: 8 },
  productName: { fontSize: 18, fontWeight: "bold" },
  productDescription: { fontSize: 14, color: "#555" },
  addBtn: { marginTop: 8, backgroundColor: "#2E7D32" },
  returnBtn: { marginTop: 20 },
  emptyText: { textAlign: "center", marginTop: 20, color: "#aaa" },
  searchbar: { marginBottom: 20 },
});
