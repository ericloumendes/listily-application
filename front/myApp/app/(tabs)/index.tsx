import { useCallback, useEffect, useState } from "react";
import { ScrollView,View, StyleSheet, FlatList, Text, Image } from "react-native";
import { Button, Snackbar, Searchbar, Card, Divider } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { getAllProdutos, getProdutoByCodebar } from "../../services/produto_service";
import { Produto } from "../../interfaces/produto_interface"; // Import Produto type
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useFocusEffect } from "expo-router";
import Toast from "react-native-toast-message";
import { Camera, CameraView } from "expo-camera"; // Use expo-camera instead of react-native-camera
import { Preco } from "../../interfaces/preco_interface";
import { formatCurrency } from "../../services/monetary_service";

export default function HomeScreen() {
  const { token } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCameraOpen, setIsCameraOpen] = useState(false); // State to manage camera visibility
  const [hasPermission, setHasPermission] = useState(null); // State for camera permission
  const [barcode, setBarcode] = useState<string>(""); // Store the scanned barcode
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
        setFilteredProdutos(fetchedProdutos); // Initialize filtered products
      } catch (err) {
        Toast.show({ type: "error", text1: "Erro ao carregar produtos." });
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, [token]));

    useEffect(() => {
    const getCameraPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync(); // Request camera permission
      setHasPermission(status === "granted");
    };

    getCameraPermission(); // Request camera permission on component mount
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      // Filter Produtos based on the search query (match 'nome', 'descricao', and 'supermercado')
      const filtered = produtos.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(query.toLowerCase()) ||
          produto.descricao.toLowerCase().includes(query.toLowerCase()) ||
          produto.supermercado.nome.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProdutos(filtered);
    } else {
      setFilteredProdutos(produtos); // Show all Produtos if search is cleared
    }
  };

  const handleSearchByCode = (codebar: string) => {
    setLoading(true);
    getProdutoByCodebar(codebar, token)
      .then((data) => {
        setFilteredProdutos(data); // Display products found by barcode
        Toast.show({ type: "success", text1: `${data.length} produto(s) encontrado(s).` });
      })
      .catch((err) => {
        Toast.show({ type: "error", text1: "Erro ao procurar por código de barras." });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCameraScan = (barcode: string) => {
    setBarcode(barcode); // Store the barcode value
    handleSearchByCode(barcode); // Search by barcode once it's scanned
    setIsCameraOpen(false); // Close the camera after scan
  };

  const handleCameraCancel = () => {
    setIsCameraOpen(false); // Close the camera without scanning
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
          <Button mode="text" onPress={() => router.push(`/registrar-valor/${item.pk}`)} style={styles.anchorButton}>
            Registrar preço
          </Button>
        </Card.Content>
      </Card>
    );
  };

    if (hasPermission === null) {
    return <Text>Solicitando permissão para usar a câmera...</Text>; // Waiting for permission
  }

  if (hasPermission === false) {
    return <Text>Sem permissão para usar a câmera.</Text>; // No camera permission
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Produtos</Text>

      {/* Searchbar to filter products */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Pesquisar..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        <Button
          mode="contained"
          onPress={() => setIsCameraOpen(true)} // Open camera to scan barcode
          style={styles.searchButton}
        >
          <FontAwesome name="barcode" size={24} color="white" />
        </Button>
      </View>

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

      {/* Register link */}
      <View style={styles.dividerRow}>
        <Divider style={styles.divider} />
        <Text
          style={styles.dividerText}
          onPress={() => router.push("/list-supermercado")}
        >
          Não encontrou seu produto? Clique aqui para registrar.
        </Text>
        <Divider style={styles.divider} />
      </View>

      {/* Snackbar feedback */}
      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
        duration={2200}
        style={{ backgroundColor: snack.ok ? "#2E7D32" : "#B00020" }}
      >
        {snack.msg}
      </Snackbar>

      {/* Camera modal to scan barcode */}
      {isCameraOpen && (
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={({ data }) => handleCameraScan(data)} // On barcode scan, trigger the function
        >
          <View style={styles.cameraOverlay}>
            <Button onPress={handleCameraCancel} style={styles.cancelButton}>
              Cancelar
            </Button>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  card: { marginBottom: 16, borderRadius: 8 },
  productName: { fontSize: 18, fontWeight: "bold" },
  productDescription: { fontSize: 14, color: "#555" },
  productSupermercado: { fontSize: 14, color: "#888" },
  productPreco: { fontSize: 16, color: "#2E7D32", fontWeight: "bold" }, // Price styling
  searchContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  searchbar: { width: "70%" },
  searchButton: { width: "28%", alignSelf: "center" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#aaa" },
  anchorButton: { marginTop: 8, color: "#2E7D32" }, // Green "Atualizar valor" button
  productImage: { width: 100, height: 100, marginBottom: 8, borderRadius: 8 },
  camera: { flex: 1, justifyContent: "flex-end" },
    dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 12,
  },
  divider: { flex: 1, height: 1 },
  dividerText: { color: "#9ca3af", fontSize: 12 },
  cameraOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: "#B00020",
    padding: 10,
    borderRadius: 10,
  },
});
