import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator, Text, Modal, Pressable } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import { getAllSupermercados } from "../../services/supermercado_service";
import { Supermercado } from "../../interfaces/supermercado_interface";
import { useFocusEffect } from "expo-router";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";

export default function SupermercadosMapScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [supermercados, setSupermercados] = useState<Supermercado[]>([]);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [userRegion, setUserRegion] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selected, setSelected] = useState<Supermercado | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
    if (DATA.user) {
      L.circleMarker([DATA.user.lat, DATA.user.lng], { radius: 6, color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 0.9 }).addTo(map);
    }
    (DATA.markers || []).forEach(m => {
      const marker = L.marker([m.lat, m.lng]).addTo(map);
      marker.bindPopup('<b>' + (m.nome || '') + '</b><br/>' + (m.endereco || ''));
    });
  </script>
  <div style="position:absolute; left:8px; bottom:4px; font-size:10px; color:#666">© OpenStreetMap contributors | Tiles © MapTiler</div>
  </body>
  </html>`;
  }, [supermercados, userRegion, initialRegion]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        style={styles.map}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
      />
      <Text style={{ position: 'absolute', bottom: 4, left: 8, fontSize: 10, color: '#666' }}>
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
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selected?.nome}</Text>
            <Text style={styles.modalText}>{selected?.endereco}</Text>
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
  container: { flex: 1, backgroundColor: "#fff" },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  loadingText: { marginTop: 8, color: "#6b7280" },
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
});
