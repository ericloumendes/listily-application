import { Request, Response } from 'express';
import Usuario from '../models/Usuario';
import bcrypt from 'bcrypt';


export const usuarioController = {
    save: async (req: Request, res: Response) => {
        try {
            const { nome, email, senha, rg } = req.body;

            // Encrypt password
            const hashedPassword = await bcrypt.hash(senha, 10); // 10 salt rounds

            const novoUsuario = await Usuario.create({
                nome,
                email,
                senha: hashedPassword,
                rg,
                data_criacao: new Date()
            });

            return res.status(201).json(novoUsuario);
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao salvar usuário', detalhes: error.message });
        }
    },

    findAll: async (req: Request, res: Response) => {
        try {
            const registros = await Usuario.findAll();

            if (!registros.length) {
                return res.status(404).json({ error: 'Registros não encontrados' });
            }

            return res.status(200).json(registros);
        } catch (error: any) {
            return res.status(500).json({
                error: 'Erro ao buscar registros',
                detalhes: error.message
            });
        }
    },

    findById: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const registro = await Usuario.findByPk(pk);

            if (registro) {
                return res.status(200).json(registro);
            }

            return res.status(404).json({ error: 'Registro não encontrado' });
        } catch (error: any) {
            return res.status(500).json({
                error: 'Erro ao buscar registro',
                detalhes: error.message
            });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const { nome, email, senha, rg } = req.body;
        
            const usuario = await Usuario.findByPk(pk);
            if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
        
            // Encrypt password only if provided
            let hashedPassword = usuario.senha;
            if (senha) {
                hashedPassword = await bcrypt.hash(senha, 10);
            }
        
            await usuario.update({
                nome: nome || usuario.nome,
                email: email || usuario.email,
                senha: hashedPassword,
                rg: rg || usuario.rg
            });
        
            return res.json(usuario);
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao atualizar usuário', detalhes: error.message });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;

            const deletado = await Usuario.destroy({ where: { pk } });

            if (deletado) {
                return res.status(204).send();
            }

            return res.status(404).json({ error: 'Registro não encontrado' });
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao deletar registro', detalhes: error.message });
        }
    }
}
