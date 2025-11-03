import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text, Image } from "react-native";
import { Card, Button, Snackbar, Searchbar } from "react-native-paper";
import { useAuth } from "../../../context/AuthContext";
import { getListaByIdCached, deleteLista, deleteProdutoFromLista } from "../../../services/lista_service";
import { Lista } from "../../../interfaces/lista_interface";
import { Produto } from "../../../interfaces/produto_interface";
import { useFocusEffect, useLocalSearchParams} from "expo-router";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { Preco } from "../../../interfaces/preco_interface";
import { formatCurrency } from "../../../services/monetary_service";
import { useOffline } from "../../../context/OfflineContext";
import OfflineBanner from "../../../components/OfflineBanner";
import { generateListaPdf } from "../../../services/pdf_service";
import * as Sharing from "expo-sharing";
import * as Network from "expo-network";

export default function ListaDetailScreen() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const { offline, setOffline } = useOffline();
  const [lista, setLista] = useState<Lista | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);
  const [snack, setSnack] = useState<{ visible: boolean; msg: string; ok?: boolean }>({
    visible: false,
    msg: "",
    ok: false,
  });

  const listaIdStr = Array.isArray(id) ? id[0] : (id ?? "");

  const handleShowRoute = () => {
    if (!lista) return;
    const supermercadoPks = Array.from(new Set((lista.produtos || []).map((p) => p.supermercado.pk)));
    const produtosBySuper = (lista.produtos || []).reduce((acc, p) => {
      const key = p.supermercado.pk;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p.nome);
      return acc;
    }, {} as Record<number, string[]>);
    router.push({ pathname: "/route-map", params: { listaId: listaIdStr, supermercadoPks: JSON.stringify(supermercadoPks), produtosBySuper: JSON.stringify(produtosBySuper) } });
  };

  const handleDownloadPdf = async () => {
    try {
      if (!lista) return;
      const { uri } = await generateListaPdf(lista);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Toast.show({ type: "success", text1: "PDF gerado", text2: uri });
      }
    } catch (e) {
      Toast.show({ type: "error", text1: "Erro ao gerar PDF" });
    }
  };

  useFocusEffect(useCallback(() => {
    const fetchListaDetail = async () => {
      if (!token) return;
      setLoading(true);
      let online = true;
      try {
        const state = await Network.getNetworkStateAsync();
        online = !!state.isConnected && state.isInternetReachable !== false;
      } catch {}
      setOffline(!online);

      try {
        const { data } = await getListaByIdCached(Number.parseInt(listaIdStr), token);
        setLista(data);
        setFilteredProdutos(data.produtos);
        if (online) setOffline(false);
      } catch (err) {
        // Re-check connectivity; when offline, do not toast
        try {
          const state = await Network.getNetworkStateAsync();
          online = !!state.isConnected && state.isInternetReachable !== false;
        } catch {}
        setOffline(!online);
        if (online) {
          const msg = err instanceof Error ? err.message : String(err);
          const is404 = /^HTTP\s+404/.test(msg) || /not\s*found/i.test(msg) || /lista n[aã]o encontrada/i.test(msg);
          if (is404) {
            setOffline(false);
            Toast.show({ type: "info", text1: "Lista não encontrada." });
          } else {
            Toast.show({ type: "error", text1: "Erro ao carregar detalhes da lista." });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchListaDetail();
  }, [listaIdStr, token]));

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
      await deleteLista(Number.parseInt(listaIdStr), token); // Delete the Lista
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
      await deleteProdutoFromLista(produtoPk, Number.parseInt(listaIdStr), token); // Remove Produto from Lista
      Toast.show({ type: "success", text1: "Produto removido com sucesso! 🗑️" });

      // Update the Lista to reflect the changes
      setFilteredProdutos((prev) => (prev || []).filter((produto) => produto.pk !== produtoPk));
      setLista((prev) => prev ? { ...prev, produtos: prev.produtos.filter((p) => p.pk !== produtoPk) } : prev);
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
      {offline && <OfflineBanner />}
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
      <Button
        mode="contained"
        onPress={handleDownloadPdf}
        style={styles.downloadBtn}
      >
        Baixar lista
      </Button>
      <Button
        mode="contained"
        onPress={handleShowRoute}
        disabled={offline}
        style={styles.routeBtn}
      >
        Exibir rota de compra
      </Button>
    {/* Button to navigate to Add Produto page */}
      <Button
        mode="contained"
        onPress={() => {
          router.push(`/add-produto-lista/${id}`);}}
        disabled={offline}
        style={styles.addProdutoBtn}
      >
        Adicionar Produto
      </Button>
      <Button
        mode="contained"
        onPress={handleDelete}
        loading={loading}
        disabled={loading || offline}
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
  downloadBtn: { marginTop: 12, backgroundColor: "#059669" },
  routeBtn: { marginTop: 12, backgroundColor: "#2563EB" },
});
