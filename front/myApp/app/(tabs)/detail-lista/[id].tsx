import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text, Image } from "react-native";
import { Card, Button, Snackbar, Searchbar } from "react-native-paper";
import { useAuth } from "../../../context/AuthContext";
import { getListaById, deleteLista, deleteProdutoFromLista } from "../../../services/lista_service";
import { Lista } from "../../../interfaces/lista_interface";
import { Produto } from "../../../interfaces/produto_interface";
import { useFocusEffect, useLocalSearchParams} from "expo-router";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { Preco } from "../../../interfaces/preco_interface";
import { formatCurrency } from "../../../services/monetary_service";

export default function ListaDetailScreen() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [lista, setLista] = useState<Lista | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);
  const [snack, setSnack] = useState<{ visible: boolean; msg: string; ok?: boolean }>({
    visible: false,
    msg: "",
    ok: false,
  });

  useFocusEffect(useCallback(() => {
    const fetchListaDetail = async () => {
      if (token) {
        try {
          const listaData = await getListaById(Number.parseInt(id), token);
          setLista(listaData);
          setFilteredProdutos(listaData.produtos); // Initialize filtered products
        } catch (err) {
          Toast.show({ type: "error", text1: "Erro ao carregar detalhes da lista." });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchListaDetail();
  }, [id, token]));

    const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      // Filter Produtos based on the search query (match 'nome' and 'descricao')
      const filtered = lista?.produtos.filter((produto) =>
        produto.nome.toLowerCase().includes(query.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProdutos(filtered || []);
    } else {
      setFilteredProdutos(lista?.produtos || []); // Show all Produtos if search is cleared
    }
  };

    const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteLista(Number.parseInt(id), token); // Delete the Lista
      Toast.show({ type: "success", text1: "Lista deletada com sucesso! 🗑️" });

      setTimeout(() => {
        router.replace("/about"); // Navigate back to List view after deletion
      }, 800);
    } catch (err) {
      Toast.show({ type: "error", text1: "Erro ao deletar Lista." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduto = async (produtoPk: number) => {
    try {
      setLoading(true);
      await deleteProdutoFromLista(produtoPk, id, token); // Remove Produto from Lista
      Toast.show({ type: "success", text1: "Produto removido com sucesso! 🗑️" });

      // Update the Lista to reflect the changes
      setFilteredProdutos((prevLista) => ({
        ...prevLista!,
        produtos: prevLista!.filter((produto) => produto.pk !== produtoPk),
      }));
    } catch (err) {
      Toast.show({ type: "error", text1: "Erro ao remover Produto." });
    } finally {
      setLoading(false);
    }
  };

  const renderProduto = ({ item }: { item: Produto }) => {
    // Get the most recent Preco based on data_registro
    const latestPreco = item.precos.reduce((latest, current) => {
      if (!latest || new Date(current.data_registro) > new Date(latest.data_registro)) {
        return current;
      }
      return latest;
    }, null as Preco | null);

    return (
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          {/* Displaying image only if the Produto has one */}
          {item.imagem ? (
            <Image source={{ uri: item.imagem }} style={styles.productImage} />
          ) : (
            <></> // Placeholder if no image
          )}
          <Text style={styles.productName}>{item.nome}</Text>
          <Text style={styles.productDescription}>{item.descricao}</Text>
          <Text style={styles.productSupermercado}>Supermercado: {item.supermercado.nome}</Text>
          <Text style={styles.productSupermercado}>Endereço: {item.supermercado.endereco}</Text>
          {/* Display the latest Preco */}
          {latestPreco ? (
            <Text style={styles.productPreco}>
              Preço Atual: {formatCurrency(latestPreco.preco)}
            </Text>
          ) : (
            <Text style={styles.productPreco}>Preço não disponível</Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return <Text>Carregando...</Text>;
  }

  if (!lista) {
    return <Text>Lista não encontrada.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{lista.nome}</Text>
      {/* Searchbar to filter products */}
      <Searchbar
        placeholder="Pesquisar Produtos..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredProdutos}
        keyExtractor={(item) => item.pk.toString()}
        renderItem={renderProduto}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto encontrado.</Text>}
      />
    {/* Button to navigate to Add Produto page */}
      <Button
        mode="contained"
        onPress={() => {
          router.push(`/add-produto-lista/${id}`);}}
        style={styles.addProdutoBtn}
      >
        Adicionar Produto
      </Button>
      <Button
        mode="contained"
        onPress={handleDelete}
        loading={loading}
        disabled={loading}
        style={styles.deleteBtn}
      >
        Deletar Lista
      </Button>
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
  productImage: { width: 100, height: 100, marginBottom: 8, borderRadius: 8 },
  productName: { fontSize: 18, fontWeight: "bold" },
  productDescription: { fontSize: 14, color: "#555" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#aaa" },
  deleteBtn: { marginTop: 20, backgroundColor: "#B00020" }, // Red button for delete
  productPreco: { fontSize: 16, color: "#2E7D32", fontWeight: "bold" }, // Price styling
  searchbar: { marginBottom: 20 },
  addProdutoBtn: { marginTop: 20 }, // Green button for adding products
  productSupermercado: { fontSize: 14, color: "#888" },
  anchorButton: { marginTop: 8, color: "#2E7D32" }, // Green "Atualizar valor" button
});
