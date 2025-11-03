import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { Lista } from "../interfaces/lista_interface";

function decodeJwt(token: string): { pk: number; email: string; nome: string } {
  return jwtDecode(token);
}

async function setJsonItem(key: string, value: unknown) {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch {}
}

async function getJsonItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function saveUserListas(token: string, listas: Lista[]) {
  const { pk } = decodeJwt(token);
  const key = `listas:user:${pk}`;
  await setJsonItem(key, listas);
}

export async function getUserListas(token: string): Promise<Lista[] | null> {
  const { pk } = decodeJwt(token);
  const key = `listas:user:${pk}`;
  return getJsonItem<Lista[]>(key);
}

export async function saveLista(token: string, lista: Lista) {
  const { pk } = decodeJwt(token);
  const key = `lista:user:${pk}:${lista.pk}`;
  await setJsonItem(key, lista);
}

export async function getLista(token: string, id: number): Promise<Lista | null> {
  const { pk } = decodeJwt(token);
  const key = `lista:user:${pk}:${id}`;
  return getJsonItem<Lista>(key);
}
