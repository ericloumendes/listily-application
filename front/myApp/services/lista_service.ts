import { apiRequest } from "../config/api";
import { jwtDecode } from "jwt-decode";
import { Lista } from "../interfaces/lista_interface";
import { readListaFromFile, readUserListasFromFile, saveListaToFile, saveUserListasToFile } from "./file_storage";

// Decode JWT to get user id
function decodeJwt(token: string): { pk: number; email: string; nome: string } {
  return jwtDecode(token);
}

// Create a new Lista
export async function createLista(nome: string, token: string) {
  const { pk } = decodeJwt(token); // Decode JWT to get user id
  const newLista = { nome, usuario_pk: pk }; // Use the user's id as usuario_pk
  return apiRequest<Lista>("/lista", "POST", newLista, token); // POST request to create Lista
}

// Get Listas for the logged-in user using JWT token
export async function getListas(token: string) {
  const { pk } = decodeJwt(token); // Decode JWT to get user id
  try {
    const res = await apiRequest<Lista[]>(`/lista/usuario/${pk}`, "GET", undefined, token); // Filter by usuario_pk
    return Array.isArray(res) ? res : [];
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const lower = msg.toLowerCase();
    if (/HTTP\s+404/.test(msg) || /not\s*found/i.test(msg) || lower.includes("nenhuma lista encontrada")) {
      // Treat 'no listas' as empty array
      return [];
    }
    throw e;
  }
}

// Get a specific Lista by id (pk)
export async function getListaById(id: number, token: string) {
  return apiRequest<Lista>(`/lista/${id}`, "GET", undefined, token); // Fetch a specific Lista by pk
}

// Cached-aware variants
export async function getListasCached(token: string): Promise<{ data: Lista[]; fromCache: boolean }>{
  try {
    const data = await getListas(token);
    const safeData = Array.isArray(data) ? data : [];
    try {
      await saveUserListasToFile(token, safeData);
    } catch {}
    return { data: safeData, fromCache: false };
  } catch (e) {
    const cached = await readUserListasFromFile(token);
    if (cached) return { data: cached, fromCache: true };
    throw e;
  }
}

export async function getListaByIdCached(id: number, token: string): Promise<{ data: Lista; fromCache: boolean }>{
  try {
    const data = await getListaById(id, token);
    await saveListaToFile(token, data);
    return { data, fromCache: false };
  } catch (e) {
    const cached = await readListaFromFile(token, id);
    if (cached) return { data: cached, fromCache: true } as { data: Lista; fromCache: boolean };
    throw e;
  }
}

// Add a Produto to a Lista
export async function addProdutoToLista(produtoPk: number, listaPk: number, token: string) {
  const body = { produto_pk: produtoPk, lista_pk: listaPk };
  return apiRequest<void>("/produto/lista", "POST", body, token); // POST request to add Produto to Lista
}

// Delete a specific Lista by id
export async function deleteLista(id: number, token: string) {
  return apiRequest<void>(`/lista/${id}`, "DELETE", undefined, token); // DELETE request for Lista by id
}

// Delete a Produto from a Lista
export async function deleteProdutoFromLista(produtoPk: number, listaPk: number, token: string) {
  const body = { produto_pk: produtoPk, lista_pk: listaPk };
  return apiRequest<void>("/produto/lista/remover", "POST", body, token); // DELETE request to remove Produto from Lista
}
