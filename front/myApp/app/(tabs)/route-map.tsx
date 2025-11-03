import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, Text, Modal, Pressable, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import { getAllSupermercados } from "../../services/supermercado_service";
import { Supermercado } from "../../interfaces/supermercado_interface";
import { useFocusEffect, useLocalSearchParams, router } from "expo-router";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import { getListaById } from "../../services/lista_service";
import { Lista } from "../../interfaces/lista_interface";

type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };

export default function RouteMapScreen() {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [supermercados, setSupermercados] = useState<Supermercado[]>([]);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [userRegion, setUserRegion] = useState<Region | null>(null);
  const [selected, setSelected] = useState<Supermercado | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef<any>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [visitOrderByPk, setVisitOrderByPk] = useState<Record<number, number>>({});
  const [following, setFollowing] = useState(false);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const [activeSupermercadoPks, setActiveSupermercadoPks] = useState<number[] | null>(null);
  const [produtosBySuperState, setProdutosBySuperState] = useState<Record<number, string[]>>({});
  

  // Parse params per navigation visit (respond to changes)
  const supermercadoPks = useMemo<number[] | null>(() => {
    const raw = (params as any)?.supermercadoPks as string | string[] | undefined;
    const str = Array.isArray(raw) ? raw[0] : raw;
    if (!str) return null;
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed.map((n) => Number(n)).filter((n) => Number.isFinite(n));
    } catch {}
    return null;
  }, [params]);

  const produtosBySuper = useMemo<Record<number, string[]>>(() => {
    const raw = (params as any)?.produtosBySuper as string | string[] | undefined;
    const str = Array.isArray(raw) ? raw[0] : raw;
    const normalized: Record<number, string[]> = {};
    if (!str) return normalized;
    try {
      const parsed = JSON.parse(str);
      if (parsed && typeof parsed === "object") {
        for (const k of Object.keys(parsed)) {
          const pk = Number(k);
          if (Number.isFinite(pk)) normalized[pk] = Array.isArray(parsed[k]) ? parsed[k] : [];
        }
      }
    } catch {}
    return normalized;
  }, [params]);

  const listaId = useMemo<number | null>(() => {
    const raw = (params as any)?.listaId as string | string[] | undefined;
    const str = Array.isArray(raw) ? raw[0] : raw;
    if (!str) return null;
    const n = Number(str);
    return Number.isFinite(n) ? n : null;
  }, [params]);

  const loadData = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === "granted");
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        });
      }
      // derive supermercados and produtos from latest lista if listaId provided
      let pksToUse: number[] | null = supermercadoPks;
      let produtosMap: Record<number, string[]> = produtosBySuper;
      if (listaId && token) {
        try {
          const fresh: Lista = await getListaById(listaId, token);
          const setPks = new Set<number>();
          const tmp: Record<number, string[]> = {};
          for (const p of fresh.produtos || []) {
            const spk = p.supermercado?.pk ?? p.supermercado_pk;
            if (typeof spk === 'number') {
              setPks.add(spk);
              if (!tmp[spk]) tmp[spk] = [];
              tmp[spk].push(p.nome);
            }
          }
          pksToUse = Array.from(setPks);
          produtosMap = tmp;
        } catch (e) {
          // ignore, fallback to params
        }
      }

      setActiveSupermercadoPks(pksToUse);
      setProdutosBySuperState(produtosMap);

      const data = await getAllSupermercados(token!);
      const filterSet = pksToUse ? new Set(pksToUse) : null;
      const filtered = filterSet ? data.filter((s) => filterSet.has(s.pk)) : data;
      setSupermercados(filtered);
      // Defer to next tick so state is committed before computing route
      setTimeout(() => {
        computeDrivingRoute();
      }, 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar dados";
      Toast.show({ type: "error", text1: msg });
    } finally {
      setLoading(false);
    }
  }, [token, supermercadoPks, produtosBySuper, listaId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useRefreshOnFocus(loadData, [loadData]);

  

  const initialRegion = useMemo<Region>(() => {
    if (userRegion) return userRegion;
    return { latitude: -14.235, longitude: -51.9253, latitudeDelta: 20, longitudeDelta: 20 };
  }, [userRegion]);

  const html = useMemo(() => {
    const markers = (supermercados || []).map((s) => {
      const anyS: any = s as any;
      const lat = Number(anyS.latitude ?? anyS.Latitude);
      const lng = Number(anyS.longitude ?? anyS.Longitude);
      const order = (visitOrderByPk as any)[s.pk] as number | undefined;
      return { pk: s.pk, nome: s.nome, endereco: s.endereco, lat, lng, order };
    }).filter(m => isFinite(m.lat) && isFinite(m.lng));
    const route = (routeCoords || []).map(c => [c.latitude, c.longitude]);
    const user = userRegion ? { lat: userRegion.latitude, lng: userRegion.longitude } : null;
    const data = { markers, route, user, initial: { latitude: initialRegion.latitude, longitude: initialRegion.longitude } };
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
    .lbl { background: rgba(255,255,255,0.95); padding: 2px 6px; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 12px; color: #111827; }
  </style>
  </head>
  <body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const DATA = ${JSON.stringify(data)};
    const map = L.map('map', { zoomControl: true }).setView([DATA.initial.latitude, DATA.initial.longitude], DATA.user ? 13 : 4);
    L.tileLayer("https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=" + ${JSON.stringify(mapTilerKey)}, { maxZoom: 19, tileSize: 256, crossOrigin: true }).addTo(map);
    if (DATA.user) {
      L.circleMarker([DATA.user.lat, DATA.user.lng], { radius: 6, color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 0.9 }).addTo(map);
    }
    (DATA.markers || []).forEach(m => {
      const title = (m.order ? (m.order + '. ') : '') + (m.nome || '');
      const marker = L.marker([m.lat, m.lng]).addTo(map);
      marker.bindPopup('<b>' + title + '</b><br/>' + (m.endereco || ''));
      // add label near marker
      const divIcon = L.divIcon({ className: 'lbl', html: title });
      L.marker([m.lat, m.lng], { icon: divIcon }).addTo(map);
    });
    if ((DATA.route || []).length > 1) {
      const line = L.polyline(DATA.route, { color: '#2563EB', weight: 4 }).addTo(map);
      try { map.fitBounds(line.getBounds(), { padding: [60,60] }); } catch (e) {}
    }
  </script>
  <div style="position:absolute; left:8px; bottom:4px; font-size:10px; color:#666">© OpenStreetMap contributors | Tiles © MapTiler</div>
  </body>
  </html>`;
  }, [supermercados, visitOrderByPk, routeCoords, userRegion, initialRegion]);

  const haversine = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const c = 2 * Math.asin(Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon));
    return R * c;
  };

  const computeDrivingRoute = useCallback(async () => {
    try {
      const points = supermercados
        .map((s) => {
          const anyS: any = s as any;
          const latStr = anyS.latitude ?? anyS.Latitude;
          const lngStr = anyS.longitude ?? anyS.Longitude;
          const lat = Number(latStr);
          const lng = Number(lngStr);
          return { s, lat, lng };
        })
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));

      if (!userRegion || points.length === 0) {
        setRouteCoords([]);
        setVisitOrderByPk({});
        return;
      }

      const start = { latitude: userRegion.latitude, longitude: userRegion.longitude };

      // OSRM expects lon,lat; build coordinate string starting with user location
      const coordPairs: string[] = [];
      coordPairs.push(`${start.longitude},${start.latitude}`);
      for (const p of points) coordPairs.push(`${p.lng},${p.lat}`);
      const coordsStr = coordPairs.join(";");
      // Try OSRM Trip API first (optimizes visit order)
      const tripUrl = `https://router.project-osrm.org/trip/v1/driving/${coordsStr}?source=first&roundtrip=false&geometries=geojson&overview=full`;
      const tripRes = await fetch(tripUrl);
      if (!tripRes.ok) throw new Error(`OSRM Trip HTTP ${tripRes.status}`);
      const tripData = await tripRes.json();
      if (tripData?.code !== 'Ok' || !tripData.trips || tripData.trips.length === 0) {
        throw new Error('OSRM Trip no usable trips');
      }
      const trip = tripData.trips[0];

      // Geometry from Trip
      let coords: { latitude: number; longitude: number }[] = (trip.geometry?.coordinates || []).map((c: number[]) => ({
        latitude: c[1],
        longitude: c[0],
      }));

      // If Trip didn't return geometry for some reason, try Route API to at least draw a path in the provided order
      if (!coords || coords.length === 0) {
        const routeUrl = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?alternatives=false&geometries=geojson&overview=full`;
        const routeRes = await fetch(routeUrl);
        if (!routeRes.ok) throw new Error(`OSRM Route HTTP ${routeRes.status}`);
        const routeData = await routeRes.json();
        if (routeData?.code !== 'Ok' || !routeData.routes || routeData.routes.length === 0) {
          throw new Error('OSRM Route no usable route');
        }
        coords = (routeData.routes[0].geometry?.coordinates || []).map((c: number[]) => ({ latitude: c[1], longitude: c[0] }));
      }

      setRouteCoords(coords);

      // Visit order from Trip waypoints when available
      const orderMap: Record<number, number> = {};
      let order = 1;
      const waypoints: any[] = trip.waypoints || tripData.waypoints || [];
      for (const wp of waypoints) {
        const inputIdx: number = wp.waypoint_index ?? wp.waypointIndex ?? wp.waypoint ?? -1;
        if (inputIdx <= 0) continue; // 0 is the user origin
        const supermarketIdx = inputIdx - 1; // because first after user
        const s = points[supermarketIdx]?.s;
        if (s) {
          orderMap[s.pk] = order;
          order += 1;
        }
      }
      if (Object.keys(orderMap).length === 0) {
        // keep original order
        points.forEach((p, i) => { orderMap[p.s.pk] = i + 1; });
      }
      setVisitOrderByPk(orderMap);

      // Fit map after setting coords
      if (coords.length > 1) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coords, { edgePadding: { top: 60, bottom: 60, left: 40, right: 40 }, animated: true });
        }, 0);
      }
    } catch (e) {
      // Fallback: nearest-neighbor straight-line
      const points = supermercados
        .map((s) => {
          const anyS: any = s as any;
          const latStr = anyS.latitude ?? anyS.Latitude;
          const lngStr = anyS.longitude ?? anyS.Longitude;
          const lat = Number(latStr);
          const lng = Number(lngStr);
          return { s, lat, lng };
        })
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
      if (!userRegion || points.length === 0) return;
      const start = { latitude: userRegion.latitude, longitude: userRegion.longitude };
      const remaining = [...points];
      const route: { latitude: number; longitude: number }[] = [start];
      const orderMap: Record<number, number> = {};
      let current = start;
      let order = 1;
      while (remaining.length > 0) {
        let bestIdx = 0;
        let bestDist = Infinity;
        for (let i = 0; i < remaining.length; i++) {
          const cand = { latitude: remaining[i].lat, longitude: remaining[i].lng };
          const d = haversine(current, cand);
          if (d < bestDist) { bestDist = d; bestIdx = i; }
        }
        const next = remaining.splice(bestIdx, 1)[0];
        const nextCoord = { latitude: next.lat, longitude: next.lng };
        route.push(nextCoord);
        orderMap[next.s.pk] = order;
        order += 1;
        current = nextCoord;
      }
      setRouteCoords(route);
      setVisitOrderByPk(orderMap);
      if (route.length > 1) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(route, { edgePadding: { top: 60, bottom: 60, left: 40, right: 40 }, animated: true });
        }, 0);
      }
    }
  }, [userRegion, supermercados]);

  // Compute driving route via OSRM Trip API, fallback to nearest-neighbor if it fails
  useEffect(() => {
    // Only run when we have user location and supermercados loaded
    if (userRegion && supermercados.length > 0) {
      computeDrivingRoute();
    }
  }, [userRegion, supermercados, computeDrivingRoute]);

  useFocusEffect(
    useCallback(() => {
      if (userRegion && supermercados.length > 0) {
        computeDrivingRoute();
      }
    }, [userRegion, supermercados, computeDrivingRoute])
  );

  useEffect(() => {
    if (routeCoords.length > 1) {
      mapRef.current?.fitToCoordinates(routeCoords, { edgePadding: { top: 60, bottom: 60, left: 40, right: 40 }, animated: true });
    }
  }, [routeCoords]);

  const centerOnUser = useCallback(async () => {
    try {
      if (!hasLocationPermission) {
        Toast.show({ type: "error", text1: "Permissão de localização necessária" });
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const region: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };
      setUserRegion(region);
      mapRef.current?.animateToRegion(region, 500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível recentrar";
      Toast.show({ type: "error", text1: msg });
    }
  }, [hasLocationPermission]);

  const toggleFollow = useCallback(async () => {
    try {
      if (!hasLocationPermission) {
        Toast.show({ type: "error", text1: "Permissão de localização necessária" });
        return;
      }
      if (!following) {
        // Start watching
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 4000, distanceInterval: 5 },
          (location) => {
            const region: Region = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            };
            setUserRegion(region);
            mapRef.current?.animateToRegion(region, 500);
          }
        );
        locationSubRef.current = sub;
        setFollowing(true);
      } else {
        // Stop watching
        locationSubRef.current?.remove();
        locationSubRef.current = null;
        setFollowing(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao acompanhar localização";
      Toast.show({ type: "error", text1: msg });
    }
  }, [following, hasLocationPermission]);

  useEffect(() => {
    return () => {
      // cleanup watcher on unmount
      locationSubRef.current?.remove();
      locationSubRef.current = null;
    };
  }, []);

  

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  const produtosBySuperMap = produtosBySuperState;

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
      <Pressable style={[styles.centerButton, styles.followButton]} onPress={toggleFollow}>
        <Text style={styles.centerButtonText}>{following ? 'Parar' : 'Acompanhar'}</Text>
      </Pressable>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </Pressable>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selected ? `${visitOrderByPk[selected.pk] ? visitOrderByPk[selected.pk] + '. ' : ''}${selected.nome}` : ''}</Text>
            <Text style={styles.modalText}>{selected?.endereco}</Text>
            <Text style={[styles.modalText, { fontWeight: '600', marginTop: 8 }]}>Produtos a comprar:</Text>
            <ScrollView style={{ maxHeight: 160, marginTop: 4 }}>
              {(selected ? (produtosBySuperMap[selected.pk] || []) : []).map((pName, idx) => (
                <Text key={`${selected?.pk}-p-${idx}`} style={styles.productItem}>• {pName}</Text>
              ))}
              {selected && (!produtosBySuperMap[selected.pk] || produtosBySuperMap[selected.pk].length === 0) && (
                <Text style={styles.modalText}>Nenhum produto associado.</Text>
              )}
            </ScrollView>
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
  modalText: { color: '#374151', marginBottom: 6 },
  productItem: { color: '#111827', marginBottom: 4 },
  modalButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#2F80ED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  modalButtonText: { color: '#fff', fontWeight: '600' },
  labelBubble: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    maxWidth: 220,
  },
  labelText: {
    fontSize: 12,
    color: '#111827',
  },
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
  followButton: {
    position: 'absolute',
    right: 16,
    bottom: 80,
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
  backButton: {
    position: 'absolute',
    left: 16,
    top: 20,
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
  backButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  circleMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  circleText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
