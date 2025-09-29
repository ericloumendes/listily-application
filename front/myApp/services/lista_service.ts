import { apiRequest } from "../config/api";
import { jwtDecode } from "jwt-decode";
import { Lista } from "../interfaces/lista_interface";

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
  return apiRequest<Lista[]>(`/lista/usuario/${pk}`, "GET", undefined, token); // Filter by usuario_pk
}

// Get a specific Lista by id (pk)
export async function getListaById(id: number, token: string) {
  return apiRequest<Lista>(`/lista/${id}`, "GET", undefined, token); // Fetch a specific Lista by pk
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
