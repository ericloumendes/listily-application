import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { Card, Button, Snackbar, Searchbar, useTheme } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { getListasCached } from "../../services/lista_service";
import { router, useFocusEffect } from "expo-router";
import { Lista } from "../../interfaces/lista_interface";
import Toast from "react-native-toast-message";
import { useOffline } from "../../context/OfflineContext";
import OfflineBanner from "../../components/OfflineBanner";
import * as Network from "expo-network";
import { checkAndNotifyForNewOfertas } from "../../services/ofertas_notifier";

export default function AboutScreen() {
  const theme = useTheme();
  const { token } = useAuth();
  const { offline, setOffline } = useOffline();
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
      if (!token) return;
      setLoading(true);
      let online = true;
      try {
        const state = await Network.getNetworkStateAsync();
        online = !!state.isConnected && state.isInternetReachable !== false;
      } catch {}
      setOffline(!online);

      try {
        const { data } = await getListasCached(token);
        setListas(Array.isArray(data) ? data : []);
        setFilteredListas(Array.isArray(data) ? data : []);
        try {
          const produtos = (Array.isArray(data) ? data : [])
            .flatMap(l => (l.produtos || []))
            .filter(p => p && typeof p.pk === 'number');
          const seen = new Set<number>();
          const unique = produtos.filter(p => {
            if (seen.has(p.pk)) return false;
            seen.add(p.pk);
            return true;
          }).map(p => ({ pk: p.pk, nome: p.nome }));
          if (unique.length) {
            await checkAndNotifyForNewOfertas(unique, token);
          }
        } catch {}
        // If we could fetch (from network or cache), and device reports online, force online
        if (online) setOffline(false);
        if (online && Array.isArray(data) && data.length === 0) {
          Toast.show({ type: "info", text1: "Nenhuma lista encontrada." });
        }
      } catch (err) {
        // Determine connectivity again; if offline, do not show error toast
        try {
          const state = await Network.getNetworkStateAsync();
          online = !!state.isConnected && state.isInternetReachable !== false;
        } catch {}
        setOffline(!online);
        if (online) {
          const msg = err instanceof Error ? err.message : String(err);
          // Only show when online and not an empty/404 case
          const is404 = /^HTTP\s+404/.test(msg) || /nenhuma\s+lista\s+encontrada/i.test(msg);
          if (!is404) Toast.show({ type: "error", text1: msg || "Erro ao carregar listas." });
        }
      } finally {
        setLoading(false);
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>Suas Listas</Text>
      {offline && <OfflineBanner />}

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
        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.colors.onBackground }]}>Nenhuma Lista encontrada.</Text>}
      />

      {/* Loading state */}
      {loading && <Text style={{ color: theme.colors.onBackground }}>Carregando...</Text>}

      {/* Button to navigate to Create Lista screen */}
      <Button
        mode="contained"
        onPress={() => router.push("/create-lista")}
        disabled={offline}
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
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  card: { marginBottom: 16, borderRadius: 8 },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardSubtitle: { fontSize: 14, color: "#555" },
  emptyText: { textAlign: "center", marginTop: 20 },
  searchbar: { marginBottom: 20 },
  createBtn: { marginTop: 20, alignSelf: "center", width: "60%" },
});
