import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator, Text, Modal, Pressable, FlatList } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import { getAllSupermercados } from "../../services/supermercado_service";
import { Supermercado } from "../../interfaces/supermercado_interface";
import { useFocusEffect } from "expo-router";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import { getAllProdutos } from "../../services/produto_service";
import { Produto } from "../../interfaces/produto_interface";
import { useTheme } from "react-native-paper";

export default function SupermercadosMapScreen() {
  const theme = useTheme();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [supermercados, setSupermercados] = useState<Supermercado[]>([]);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [userRegion, setUserRegion] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selected, setSelected] = useState<Supermercado | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalProdutos, setModalProdutos] = useState<Produto[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const currency = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), []);
  const [supermercadosComOferta, setSupermercadosComOferta] = useState<Set<number>>(new Set());

  const loadData = useCallback(async () => {
    try {
      // Permissions for location
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === "granted");
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
      // Load supermercados
      const data = await getAllSupermercados(token!);
      setSupermercados(data);
      // Load produtos and compute which supermercados have active ofertas
      try {
        const produtos = await getAllProdutos(token!);
        const now = new Date();
        const ids = new Set<number>();
        for (const p of produtos) {
          const hasActive = (p.ofertas || []).some(o => new Date(o.data_fim) > now);
          if (hasActive) ids.add(p.supermercado_pk);
        }
        setSupermercadosComOferta(ids);
      } catch (_) {
        setSupermercadosComOferta(new Set());
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar dados";
      Toast.show({ type: "error", text1: msg });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ensure refresh on focus
  useRefreshOnFocus(loadData, [loadData]);

  const initialRegion = useMemo(() => {
    if (userRegion) return userRegion;
    return { latitude: -14.235, longitude: -51.9253 };
  }, [userRegion]);

  const centerOnUser = useCallback(async () => {
    try {
      if (!hasLocationPermission) {
        Toast.show({ type: "error", text1: "Permissão de localização necessária" });
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserRegion({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível recentrar";
      Toast.show({ type: "error", text1: msg });
    }
  }, [hasLocationPermission]);

  const html = useMemo(() => {
    const markers = (supermercados || []).map((s) => ({
      pk: s.pk,
      nome: s.nome,
      endereco: s.endereco,
      lat: Number((s as any).latitude ?? (s as any).Latitude),
      lng: Number((s as any).longitude ?? (s as any).Longitude),
      hasOferta: supermercadosComOferta.has(s.pk),
    })).filter(m => isFinite(m.lat) && isFinite(m.lng));
    const user = userRegion ? { lat: userRegion.latitude, lng: userRegion.longitude } : null;
    const data = { markers, user, initial: initialRegion };
    const mapTilerKey = "JzjofO06lwQzZ84yD2Y2";
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .label { background: rgba(255,255,255,0.95); padding: 2px 6px; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 12px; color: #111827; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const DATA = ${JSON.stringify(data)};
    const map = L.map('map', { zoomControl: true }).setView([DATA.initial.latitude, DATA.initial.longitude], DATA.user ? 14 : 4);
    L.tileLayer("https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=" + ${JSON.stringify(mapTilerKey)}, { maxZoom: 19, tileSize: 256, crossOrigin: true }).addTo(map);
    const greenIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    if (DATA.user) {
      L.circleMarker([DATA.user.lat, DATA.user.lng], { radius: 6, color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 0.9 }).addTo(map);
    }
    (DATA.markers || []).forEach(m => {
      const opts = m.hasOferta ? { icon: greenIcon } : {};
      const marker = L.marker([m.lat, m.lng], opts).addTo(map);
      marker.bindPopup('<b>' + (m.nome || '') + '</b><br/>' + (m.endereco || ''));
      marker.on('click', () => {
        if (window && window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerClick', pk: m.pk })); } catch (e) {}
        }
      });
    });
  </script>
  <div style="position:absolute; left:8px; bottom:4px; font-size:10px; color:#666">© OpenStreetMap contributors | Tiles © MapTiler</div>
  </body>
  </html>`;
  }, [supermercados, userRegion, initialRegion, supermercadosComOferta]);

  const formatTimeRemaining = (end: Date) => {
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return "";
    const minutes = Math.floor(diffMs / 60000);
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <WebView
        originWhitelist={["*"]}
        style={styles.map}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        onMessage={async (event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data || '{}');
            if (data?.type === 'markerClick' && typeof data.pk === 'number') {
              const s = supermercados.find(sm => sm.pk === data.pk) || null;
              setSelected(s);
              setModalVisible(true);
              setLoadingProdutos(true);
              try {
                const produtos = await getAllProdutos(token!);
                const filtered = produtos.filter(p => p.supermercado_pk === data.pk);
                // sort: produtos with active ofertas first
                const now = new Date();
                filtered.sort((a, b) => {
                  const aActive = (a.ofertas || []).some(o => new Date(o.data_fim) > now) ? 1 : 0;
                  const bActive = (b.ofertas || []).some(o => new Date(o.data_fim) > now) ? 1 : 0;
                  return bActive - aActive;
                });
                setModalProdutos(filtered);
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Erro ao carregar produtos';
                Toast.show({ type: 'error', text1: msg });
                setModalProdutos([]);
              } finally {
                setLoadingProdutos(false);
              }
            }
          } catch (e) {
            // ignore
          }
        }}
      />
      <Text style={{ position: 'absolute', bottom: 4, left: 8, fontSize: 10, color: theme.colors.onBackground }}>
        © OpenStreetMap contributors | Tiles © MapTiler
      </Text>
      <Pressable style={styles.centerButton} onPress={centerOnUser}>
        <Text style={styles.centerButtonText}>Centralizar</Text>
      </Pressable>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>{selected?.nome}</Text>
            <Text style={[styles.modalText, { color: theme.colors.onSurface }]}>{selected?.endereco}</Text>
            <Text style={styles.modalText}>
              {selected?.horario_funcionamento_inicio && selected?.horario_funcionamento_fim
                ? `Funcionamento: ${selected.horario_funcionamento_inicio} - ${selected.horario_funcionamento_fim}`
                : ''}
            </Text>
            <Text style={styles.modalText}>
              {Array.isArray(selected?.dias_funcionamento) && selected!.dias_funcionamento.length > 0
                ? `Dias: ${selected!.dias_funcionamento.map((d) => d.toUpperCase()).join(', ')}`
                : ''}
            </Text>
            <Text></Text>
            {loadingProdutos ? (
              <View style={{ paddingVertical: 12 }}>
                <ActivityIndicator />
              </View>
            ) : (
              <FlatList
                data={modalProdutos}
                keyExtractor={(item) => String(item.pk)}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item }) => {
                  const latestPrecoRaw = Array.isArray(item.precos) && item.precos.length > 0
                    ? (item.precos[item.precos.length - 1] as any)?.preco
                    : null;
                  const precoNumber = latestPrecoRaw != null ? Number(latestPrecoRaw) : NaN;
                  const hasPreco = Number.isFinite(precoNumber);
                  const now = new Date();
                  const activeOfertas = (item.ofertas || [])
                    .filter((o) => new Date(o.data_fim) > now)
                    .sort((a, b) => new Date(a.data_fim).getTime() - new Date(b.data_fim).getTime());
                  return (
                    <View style={{ paddingVertical: 6 }}>
                      <Text style={{ fontWeight: '600', color: theme.colors.onSurface }}>{item.nome}</Text>
                      <Text style={{ color: theme.colors.onSurface }}>
                        {hasPreco ? currency.format(precoNumber) : 'Sem preço cadastrado'}
                      </Text>
                      {activeOfertas.length > 0 ? (
                        <View style={{ marginTop: 6 }}>
                          <Text style={[styles.ofertaTitle, { color: theme.colors.onSurface }]}>Ofertas ativas</Text>
                          {activeOfertas.map((of, idx) => (
                            <View key={`${of.tipo}-${of.preco}-${of.data_fim}`} style={{ marginTop: 4 }}>
                              {idx > 0 ? <View style={styles.ofertaDivider} /> : null}
                              <Text style={[styles.ofertaText, { color: theme.colors.onSurface }]}>
                                {of.tipo} por {currency.format(Number(of.preco))} • termina em {formatTimeRemaining(new Date(of.data_fim))}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  );
                }}
                ListEmptyComponent={() => (
                  <Text style={{ color: theme.colors.onSurface }}>Nenhum produto encontrado neste supermercado.</Text>
                )}
              />
            )}
            <Pressable style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  loadingText: { marginTop: 8 },
  callout: { maxWidth: 220 },
  calloutTitle: { fontWeight: "bold", marginBottom: 4 },
  calloutSubtitle: { color: "#6b7280" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  modalText: { color: '#374151', marginBottom: 12 },
  modalButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#2F80ED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalButtonText: { color: '#fff', fontWeight: '600' },
  centerButton: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  centerButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  ofertaTitle: { fontSize: 14, fontWeight: '600', color: '#374151' },
  ofertaDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#e5e7eb', marginVertical: 4 },
  ofertaText: { fontSize: 13, color: '#1E88E5' },
});
