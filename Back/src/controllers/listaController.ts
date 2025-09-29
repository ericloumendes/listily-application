import { Request, Response } from 'express';
import Lista from '../models/Lista';
import Usuario from '../models/Usuario';
import Produto from '../models/Produto';
import Supermercado from '../models/Supermercado';
import Preco from '../models/Preco';

export const listaController = {
    save: async (req: Request, res: Response) => {
        try {
            const { usuario_pk, ...dados } = req.body;

            // Check if the user exists
            const usuario = await Usuario.findByPk(usuario_pk);
            if (!usuario) {
                return res.status(400).json({ error: 'Usuário não encontrado' });
            }

            const novoRegistro = await Lista.create({
                ...dados,
                usuario_pk
            });

            return res.status(201).json(novoRegistro);
        } catch (error: any) {
            return res.status(400).json({
                error: 'Erro ao salvar lista',
                detalhes: error.message
            });
        }
    },

    findAll: async (_req: Request, res: Response) => {
        try {
            const registros = await Lista.findAll({ include: [Usuario] });

            if (!registros.length) {
                return res.status(404).json({ error: 'Listas não encontradas' });
            }

            return res.status(200).json(registros);
        } catch (error: any) {
            return res.status(500).json({
                error: 'Erro ao buscar listas',
                detalhes: error.message
            });
        }
    },

    findById: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const registro = await Lista.findByPk(pk, { include: [Usuario, { model: Produto, include: [Supermercado, Preco] } ] });

            if (registro) {
                return res.status(200).json(registro);
            }

            return res.status(404).json({ error: 'Lista não encontrada' });
        } catch (error: any) {
            return res.status(500).json({
                error: 'Erro ao buscar lista',
                detalhes: error.message
            });
        }
    },

    // listaController.ts (add this method)
    findByUsuario: async (req: Request, res: Response) => {
        try {
            const { usuario_pk } = req.params;

            // Check if the user exists
            const usuario = await Usuario.findByPk(usuario_pk);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // Find all lists for this user
            const listas = await Lista.findAll({
                where: { usuario_pk },
                include: [Usuario]
            });

            if (!listas.length) {
                return res.status(404).json({ error: 'Nenhuma lista encontrada para este usuário' });
            }

            return res.status(200).json(listas);
        } catch (error: any) {
            return res.status(500).json({
                error: 'Erro ao buscar listas do usuário',
                detalhes: error.message
            });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const { usuario_pk, ...dados } = req.body;

            const registro = await Lista.findByPk(pk);
            if (!registro) {
                return res.status(404).json({ error: 'Lista não encontrada' });
            }

            // If updating usuario_pk, check if the user exists
            if (usuario_pk) {
                const usuario = await Usuario.findByPk(usuario_pk);
                if (!usuario) {
                    return res.status(400).json({ error: 'Usuário não encontrado' });
                }
            }

            await registro.update({
                ...dados,
                usuario_pk: usuario_pk || registro.usuario_pk
            });

            return res.json(registro);
        } catch (error: any) {
            return res.status(400).json({
                error: 'Erro ao atualizar lista',
                detalhes: error.message
            });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;

            const deletado = await Lista.destroy({ where: { pk } });

            if (deletado) {
                return res.status(204).send();
            }

            return res.status(404).json({ error: 'Lista não encontrada' });
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao deletar lista', detalhes: error.message });
        }
    }
};
