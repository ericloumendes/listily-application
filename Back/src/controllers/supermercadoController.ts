import { Request, Response } from 'express';
import Supermercado from '../models/Supermercado';

export const supermercadoController = {
    save: async (req: Request, res: Response) => {
        try {
            const { nome, endereco, Latitude, Longitude } = req.body;

            const novoSupermercado = await Supermercado.create({ nome, endereco, Latitude, Longitude });
            return res.status(201).json(novoSupermercado);
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao salvar supermercado', detalhes: error.message });
        }
    },

    findAll: async (_req: Request, res: Response) => {
        try {
            const supermercados = await Supermercado.findAll();
            if (!supermercados.length) return res.status(404).json({ error: 'Nenhum supermercado encontrado' });

            return res.status(200).json(supermercados);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar supermercados', detalhes: error.message });
        }
    },

    findById: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const supermercado = await Supermercado.findByPk(pk);

            if (!supermercado) return res.status(404).json({ error: 'Supermercado não encontrado' });

            return res.status(200).json(supermercado);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar supermercado', detalhes: error.message });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const { nome, endereco, latitude, longitude } = req.body;

            const supermercado = await Supermercado.findByPk(pk);
            if (!supermercado) return res.status(404).json({ error: 'Supermercado não encontrado' });

            await supermercado.update({ nome: nome || supermercado.nome, endereco: endereco || supermercado.endereco, latitude: latitude || supermercado.Latitude, longitude: longitude || supermercado.Longitude });

            return res.json(supermercado);
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao atualizar supermercado', detalhes: error.message });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const deletado = await Supermercado.destroy({ where: { pk } });

            if (deletado) return res.status(204).send();
            return res.status(404).json({ error: 'Supermercado não encontrado' });
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao deletar supermercado', detalhes: error.message });
        }
    }
};
