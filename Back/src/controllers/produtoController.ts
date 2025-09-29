import { Request, Response } from 'express';
import Produto from '../models/Produto';
import Lista from '../models/Lista';
import ListaProduto from '../models/ListaProduto';
import Supermercado from '../models/Supermercado';
import Preco from '../models/Preco';
import Categoria from '../models/Categoria';

export const produtoController = {
    save: async (req: Request, res: Response) => {
        try {
            const { nome, descricao, codigo_barras, data_cadastro, supermercado_pk, categoria_pk, imagemBase64 } = req.body;
        
            // Validate supermercado
            const supermercado = await Supermercado.findByPk(supermercado_pk);
            if (!supermercado) return res.status(404).json({ error: 'Supermercado não encontrado' });
        
            // Validate categoria
            const categoria = await Categoria.findByPk(categoria_pk);
            if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada' });
        
            // Convert image from Base64
            let imagemData = null;
            if (imagemBase64) {
                imagemData = Buffer.from(imagemBase64.split(",")[1], "base64");
            }
        
            const novoProduto = await Produto.create({
                nome,
                descricao,
                codigo_barras,
                data_cadastro: data_cadastro ? new Date(data_cadastro) : new Date(),
                supermercado_pk,
                categoria_pk,
                imagem: imagemData
            });
        
            return res.status(201).json(novoProduto);
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao salvar produto', detalhes: error.message });
        }
    },

    findAll: async (_req: Request, res: Response) => {
        try {
            const produtos = await Produto.findAll({ include: [Supermercado, Preco] });

            if (!produtos.length) return res.status(404).json({ error: 'Nenhum produto encontrado' });
            return res.status(200).json(produtos);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar produtos', detalhes: error.message });
        }
    },

    findById: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const produto = await Produto.findByPk(pk, { include: [Supermercado, Preco] });

            if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
            return res.status(200).json(produto);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar produto', detalhes: error.message });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const { nome, descricao, codigo_barras, data_cadastro, supermercado_pk, categoria_pk, imagemBase64 } = req.body;

            const produto = await Produto.findByPk(pk);
            if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });

            // Validate supermercado if provided
            if (supermercado_pk) {
                const supermercado = await Supermercado.findByPk(supermercado_pk);
                if (!supermercado) return res.status(404).json({ error: 'Supermercado não encontrado' });
            }

            // Validate categoria if provided
            if (categoria_pk) {
                const categoria = await Categoria.findByPk(categoria_pk);
                if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada' });
            }

            // Convert image from Base64 if provided
            let imagemData = produto.imagem;
            if (imagemBase64) {
                imagemData = Buffer.from(imagemBase64.split(",")[1], "base64");
            }

            await produto.update({
                nome: nome || produto.nome,
                descricao: descricao || produto.descricao,
                codigo_barras: codigo_barras || produto.codigo_barras,
                data_cadastro: data_cadastro ? new Date(data_cadastro) : produto.data_cadastro,
                supermercado_pk: supermercado_pk || produto.supermercado_pk,
                categoria_pk: categoria_pk || produto.categoria_pk,
                imagem: imagemData || produto.imagem
            });

            return res.json(produto);
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao atualizar produto', detalhes: error.message });
        }
    },


    delete: async (req: Request, res: Response) => {
        try {
            const { pk } = req.params;
            const deletado = await Produto.destroy({ where: { pk } });

            if (deletado) return res.status(204).send();
            return res.status(404).json({ error: 'Produto não encontrado' });
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao deletar produto', detalhes: error.message });
        }
    },

    addToList: async (req: Request, res: Response) => {
        try {
            const { produto_pk, lista_pk } = req.body;

            const produto = await Produto.findByPk(produto_pk);
            const lista = await Lista.findByPk(lista_pk);

            if (!produto || !lista) return res.status(404).json({ error: 'Produto ou Lista não encontrados' });

            await produto.$add('listas', lista);
            return res.status(200).json({ message: 'Produto adicionado à lista com sucesso' });
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao adicionar produto à lista', detalhes: error.message });
        }
    },

    removeFromList: async (req: Request, res: Response) => {
        try {
            const { produto_pk, lista_pk } = req.body;

            const produto = await Produto.findByPk(produto_pk);
            const lista = await Lista.findByPk(lista_pk);

            if (!produto || !lista) return res.status(404).json({ error: 'Produto ou Lista não encontrados' });

            await produto.$remove('listas', lista);
            return res.status(200).json({ message: 'Produto removido da lista com sucesso' });
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao remover produto da lista', detalhes: error.message });
        }
    },
    findByCodigoBarras: async (req: Request, res: Response) => {
        try {
            const { codigo_barras } = req.body;  // Get codigo_barras from the request body

            if (!codigo_barras) {
                return res.status(400).json({ error: 'Código de barras é obrigatório' });
            }

            // Use the static method defined in Produto model to search by codigo_barras
            const produto = await Produto.findAll({where: { codigo_barras }, include: [Supermercado, Preco]});

            if (!produto) {
                return res.status(404).json({ error: 'Produto não encontrado com esse código de barras' });
            }

            return res.status(200).json(produto);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar produto', detalhes: error.message });
        }
    }
};
