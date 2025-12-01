import { Request, Response } from 'express';
import Ofertas from '../models/Ofertas';

export const ofertasController = {
    save: async (req: Request, res: Response) => {
        try {
            const { tipo, preco, data_fim, produto_pk } = req.body;

            const novaOferta = await Ofertas.create({ tipo, preco, data_fim, produto_pk });
            return res.status(201).json(novaOferta);
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao salvar oferta', detalhes: error.message });
        }
    },

    findAll: async (_req: Request, res: Response) => {
        try {
            const ofertas = await Ofertas.findAll();
            return res.status(200).json(ofertas);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar ofertas', detalhes: error.message });
        }
    },

    findByProduto: async (req: Request, res: Response) => {
        try {
            const { produto_pk } = req.params;
            const ofertas = await Ofertas.findAll({ where: { produto_pk } });
            return res.status(200).json(ofertas);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar ofertas', detalhes: error.message });
        }
    }
}