import { apiRequest } from "../config/api";
import { Preco } from "../interfaces/preco_interface";
import { Produto } from "../interfaces/produto_interface";

// Get all Produtos from the backend
export async function getAllProdutos(token: string): Promise<Produto[]> {
  return apiRequest<Produto[]>("/produto", "GET", undefined, token); // Get all Produtos
}

// Search for Produtos by their barcode (codigo_barras)
export async function getProdutoByCodebar(codebar: string, token: string) {
  const body = { codigo_barras: codebar };
  return apiRequest<Produto[]>("/produto/codigo-barras", "POST", body, token); // POST request to search by barcode
}

// Register a new price (preco) for a Produto
export async function registerPreco(preco: number, produtoPk: number, token: string) {
  const body = {
    preco,
    data_registro: new Date().toISOString(), // Backend will handle the date formatting
    produto_pk: produtoPk,
  };

  return apiRequest<Preco>("/preco", "POST", body, token); // POST request to register the price
}

// Create a new Produto
export async function createProduto(
  nome: string,
  descricao: string,
  codigo_barras: string | null,
  imagem: Base64URLString | null,
  supermercado_pk: number,
  categoria_pk: number,
  token: string
) {
  const body = { nome, descricao, codigo_barras, imagem, supermercado_pk, categoria_pk };
  return apiRequest<Produto>("/produto", "POST", body, token); // POST request to create produto
}

