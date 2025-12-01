import { useEffect, useState } from "react";
import { View, StyleSheet, TextInput, Text } from "react-native";
import { Button, Snackbar, useTheme } from "react-native-paper";
import { Camera, CameraView } from "expo-camera";
import { useAuth } from "../../../context/AuthContext";
import { createProduto } from "../../../services/produto_service"; // Create produto service
import { router, useLocalSearchParams } from "expo-router";

export default function ProdutoCreateScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { token } = useAuth();
  const { id } = useLocalSearchParams();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [imagem, setImagem] = useState<Base64URLString | null>(null);
  const [supermercadoPk, setSupermercadoPk] = useState(0); // Assuming Supermercado selection from a list
  const [categoriaPk, setCategoriaPk] = useState(0); // Assuming Categoria selection from a list
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false); // State to manage camera visibility
  const [hasPermission, setHasPermission] = useState(null); // State for camera permission
  const [barcode, setBarcode] = useState<string>(""); // Store the scanned barcode

  const handleSubmit = async () => {
    if (!nome || !descricao ) {
      setMessage("Todos os campos são obrigatórios.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Call the createProduto service to make the POST request
      await createProduto(nome, descricao, barcode || null, imagem, Number.parseInt(id), 1, token);
      setMessage("Produto criado com sucesso!");
      // Redirect back to the produto list page after success
      router.push("/");
    } catch (err) {
      setMessage("Erro ao criar produto.");
    } finally {
      setLoading(false);
    }
  };
      useEffect(() => {
      const getCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync(); // Request camera permission
        setHasPermission(status === "granted");
      };
  
      getCameraPermission(); // Request camera permission on component mount
    }, []);

    const handleCameraScan = (barcode: string) => {
        setBarcode(barcode); // Store the barcode value
        setIsCameraOpen(false); // Close the camera after scan
    };

    const handleCameraCancel = () => {
        setIsCameraOpen(false); // Close the camera without scanning
    };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>Criar Produto</Text>

      {/* Nome Input */}
      <TextInput
        style={styles.input}
        placeholder="Nome do Produto"
        value={nome}
        onChangeText={setNome}
      />

      {/* Descricao Input */}
      <TextInput
        style={styles.input}
        placeholder="Descrição do Produto"
        value={descricao}
        onChangeText={setDescricao}
      />

      {/* Codigo de Barras Input */}
      <TextInput
        style={styles.input}
        placeholder="Código de Barras (opcional)"
        value={barcode}
        onChangeText={() => setIsCameraOpen(true)}
        keyboardType="numeric"
      />

      {/* Submit Button */}
      <Button
              onPress={handleSubmit}
              disabled={loading}>{loading ? "Criando..." : "Criar Produto"}</Button>

      {/* Feedback message */}
      {message && <Text style={[styles.message, { color: theme.colors.onBackground }]}>{message}</Text>}

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
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { height: 40, borderColor: "#ccc", borderWidth: 1, marginBottom: 20, paddingLeft: 10 },
  message: { textAlign: "center", marginTop: 20 },
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
