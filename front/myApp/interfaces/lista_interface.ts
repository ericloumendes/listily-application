import { Produto } from "./produto_interface"

export type Lista = {
    pk: number
    nome: string
    usuario_pk: number
    produtos: Produto[]
}