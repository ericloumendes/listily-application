import { Preco } from "./preco_interface"
import { Supermercado } from "./supermercado_interface"
import { Oferta } from "./oferta_interface"

export type Produto = {
    pk: number
    nome: string
    descricao: string
    codigo_barras: string
    imagem: Base64URLString
    supermercado_pk: number
    supermercado: Supermercado
    categoria_pk: number
    precos: Preco[]
    ofertas: Oferta[]
}