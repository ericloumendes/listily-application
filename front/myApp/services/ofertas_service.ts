import { apiRequest } from "../config/api";
import { Oferta } from "../interfaces/oferta_interface";

// Get ofertas for a given produto by its PK
export async function getOfertasByProdutoPk(produtoPk: number, token: string): Promise<Oferta[]> {
  return apiRequest<Oferta[]>(`/ofertas/${produtoPk}`, "GET", undefined, token);
}

// Create a new oferta
export async function createOferta(
  tipo: string,
  preco: number,
  data_fim: string | Date,
  produto_pk: number,
  token: string
): Promise<Oferta> {
  const body = {
    tipo,
    preco,
    data_fim: new Date(data_fim).toISOString(),
    produto_pk,
  };

  return apiRequest<Oferta>("/ofertas", "POST", body, token);
}
