import { Request, Response } from 'express';
import Categoria from '../models/Categoria';
import Produto from '../models/Produto';

export const categoriaController = {
    save: async (req: Request, res: Response) => {
        try {
            const { nome } = req.body;

            const novaCategoria = await Categoria.create({ nome });
            return res.status(201).json(novaCategoria);
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao salvar categoria', detalhes: error.message });
        }
    },

    findAll: async (_req: Request, res: Response) => {
        try {
            const categorias = await Categoria.findAll({ include: [Produto] });
            if (!categorias.length) return res.status(404).json({ error: 'Nenhuma categoria encontrada' });

            return res.status(200).json(categorias);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar categorias', detalhes: error.message });
        }
    },

    findById: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const categoria = await Categoria.findByPk(pk, { include: [Produto] });

            if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada' });

            return res.status(200).json(categoria);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar categoria', detalhes: error.message });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const { nome } = req.body;

            const categoria = await Categoria.findByPk(pk);
            if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada' });

            await categoria.update({ nome: nome || categoria.nome });
            return res.json(categoria);
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao atualizar categoria', detalhes: error.message });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const deletado = await Categoria.destroy({ where: { pk } });

            if (deletado) return res.status(204).send();
            return res.status(404).json({ error: 'Categoria não encontrada' });
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao deletar categoria', detalhes: error.message });
        }
    }
};
