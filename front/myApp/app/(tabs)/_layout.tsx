import { Tabs, Redirect } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { useAuth } from "../../context/AuthContext";
import { useOffline } from "../../context/OfflineContext";

export default function TabsLayout() {
  const { token, loading } = useAuth();
  const { offline } = useOffline();

  if (loading) return null; // Or splash screen
  if (!token) return <Redirect href="/login" />; // 🚫 not logged in
  if (offline) return (
    <Tabs>
      <Tabs.Screen name="about" options={{ 
        title: "Minhas listas",
        tabBarIcon: ({ color }) => <EvilIcons size={28} name="navicon" color={color} />
        }} />
      {/* Hide other tabs when offline */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="map" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      {/* Keep non-tab screens hidden as before */}
      <Tabs.Screen name="create-lista" options={{ href: null, title: "Criar Lista" }} />
      <Tabs.Screen name="detail-lista/[id]" options={{ href: null, title: "Detalhes da Lista" }} />
      <Tabs.Screen name="add-produto-lista/[listaId]" options={{ href: null, title: "Adicionar produto à lista" }} />
      <Tabs.Screen name="registrar-valor/[produtoId]" options={{ href: null, title: "Registrar Preço de um produto" }} />
      <Tabs.Screen name="list-supermercado" options={{ href: null, title: "Selecione o supermercado:" }} />
      <Tabs.Screen name="create-supermercado" options={{ href: null, title: "Registro de supermercado" }} />
      <Tabs.Screen name="create-produto/[id]" options={{ href: null, title: "Registro de produto" }} />
      <Tabs.Screen name="route-map" options={{ href: null, title: "Mapa de rota" }} />
    </Tabs>
  );

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ 
        title: "Produtos",
        tabBarIcon: ({ color }) => <EvilIcons size={28} name="search" color={color} />
         }} />
      <Tabs.Screen name="map" options={{
        title: "Mapa",
        tabBarIcon: ({ color }) => <EvilIcons size={28} name="location" color={color} />
      }} />
      <Tabs.Screen name="about" options={{ 
        title: "Minhas listas",
        tabBarIcon: ({ color }) => <EvilIcons size={28} name="navicon" color={color} />
        }} />
      <Tabs.Screen name="profile" options={{ 
        title: "Perfil",
        tabBarIcon: ({ color }) => <EvilIcons size={28} name="user" color={color} />
        }} />
      <Tabs.Screen name="create-lista" options={{
        href: null, // 🚫 removes it from the tab bar
        title: "Criar Lista",
      }} />
      <Tabs.Screen name="detail-lista/[id]" options={{
        href: null, // 🚫 removes it from the tab bar
        title: "Detalhes da Lista",
      }} />
      <Tabs.Screen name="add-produto-lista/[listaId]" options={{
        href: null, // 🚫 removes it from the tab bar
        title: "Adicionar produto à lista",
      }} />
      <Tabs.Screen name="registrar-valor/[produtoId]" options={{
        href: null, // 🚫 removes it from the tab bar
        title: "Registrar Preço de um produto",
      }} />
      <Tabs.Screen name="list-supermercado" options={{
        href: null, // 🚫 removes it from the tab bar
        title: "Selecione o supermercado:",
      }} />
      <Tabs.Screen name="create-supermercado" options={{
        href: null, // 🚫 removes it from the tab bar
        title: "Registro de supermercado",
      }} />
      <Tabs.Screen name="create-produto/[id]" options={{
        href: null, // 🚫 removes it from the tab bar
        title: "Registro de produto",
      }} />
      <Tabs.Screen name="route-map" options={{
        href: null, // 🚫 removes it from the tab bar
        title: "Mapa de rota",
      }} />
    </Tabs>
  );
}
