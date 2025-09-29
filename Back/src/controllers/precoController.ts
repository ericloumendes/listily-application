import { Request, Response } from 'express';
import Preco from '../models/Preco';
import Produto from '../models/Produto';

export const precoController = {
    // Create a new price record
    save: async (req: Request, res: Response) => {
        try {
            const { preco, data_registro, produto_pk } = req.body;

            // Validate that the product exists
            const produto = await Produto.findByPk(produto_pk);
            if (!produto) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            const novoPreco = await Preco.create({
                preco,
                data_registro: data_registro ? new Date(data_registro) : new Date(),
                produto_pk
            });

            return res.status(201).json(novoPreco);
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao salvar preço', detalhes: error.message });
        }
    },

    // Get all price records
    findAll: async (_req: Request, res: Response) => {
        try {
            const precos = await Preco.findAll({ include: [Produto] });

            if (!precos.length) {
                return res.status(404).json({ error: 'Nenhum preço encontrado' });
            }

            return res.status(200).json(precos);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar preços', detalhes: error.message });
        }
    },

    // Get price by PK
    findById: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const preco = await Preco.findByPk(pk, { include: [Produto] });

            if (!preco) {
                return res.status(404).json({ error: 'Preço não encontrado' });
            }

            return res.status(200).json(preco);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar preço', detalhes: error.message });
        }
    },

    // Update price by PK
    update: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const { preco, data_registro, produto_pk } = req.body;

            const registro = await Preco.findByPk(pk);
            if (!registro) return res.status(404).json({ error: 'Preço não encontrado' });

            if (produto_pk) {
                const produto = await Produto.findByPk(produto_pk);
                if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
            }

            await registro.update({
                preco: preco || registro.preco,
                data_registro: data_registro ? new Date(data_registro) : registro.data_registro,
                produto_pk: produto_pk || registro.produto_pk
            });

            return res.json(registro);
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao atualizar preço', detalhes: error.message });
        }
    },

    // Delete price by PK
    delete: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const deletado = await Preco.destroy({ where: { pk } });

            if (deletado) return res.status(204).send();
            return res.status(404).json({ error: 'Preço não encontrado' });
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao deletar preço', detalhes: error.message });
        }
    },
};
