import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import Usuario from '../models/Usuario';
import Lista from '../models/Lista';
import Produto from '../models/Produto';
import ListaProduto from '../models/ListaProduto';
import Supermercado from '../models/Supermercado';
import Preco from '../models/Preco';
import Categoria from '../models/Categoria';
import Ofertas from '../models/Ofertas';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // mudar senha
  host: process.env.DB_HOST, // colocar domínio
  port: parseInt(process.env.DB_PORT), // colocar porta
  dialect: 'postgres', // colocar o banco de dados utilizado
  models: [Usuario, Lista, Produto, ListaProduto, Supermercado, Preco, Categoria, Ofertas],  // Adicionar os modelos a serem trabalhados aqui
});

export default sequelize;