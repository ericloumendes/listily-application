import { apiRequest } from "../config/api";
import { Supermercado } from "../interfaces/supermercado_interface";

// Get all Supermercados from the backend
export async function getAllSupermercados(token: string) {
  return apiRequest<Supermercado[]>("/supermercado", "GET", undefined, token); // GET request to retrieve all supermercados
}

// Create a new Supermercado
export async function createSupermercado(
  nome: string,
  endereco: string,
  Latitude: string,
  Longitude: string,
  token: string
) {
  const body = { nome, endereco, Latitude, Longitude };
  return apiRequest<Supermercado>("/supermercado", "POST", body, token); // POST request to create supermercado
}

