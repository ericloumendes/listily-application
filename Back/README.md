### 📁 Estrutura de Pastas
```
src/
├── controllers/
│ └── modeloController.ts
├── models/
│ └── Modelo.ts
├── routes/
│ ├── index.ts
│ └── modeloRoutes.ts
├── app.ts
```

### Exemplos de uso

📁 1. Modelo (models/Modelo.ts)
```ts
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'nome_da_tabela',
  timestamps: false // desativa createdAt e updatedAt
})
export class Modelo extends Model {

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number; // coluna ID (chave primária)

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  nome!: string; // coluna de exemplo
}
```

🧠 2. Controller (controllers/modeloController.ts)
```ts
import { Request, Response } from 'express';
import { Modelo } from '../models/Modelo';

export const controllerModelo = {

  // Criar um novo registro
  save: async (req: Request, res: Response) => {
    try {
      const novoRegistro = await Modelo.create(req.body);
      return res.status(201).json(novoRegistro);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao salvar registro', detalhes: error.message });
    }
  },

  // Buscar todos os registros
  findAll: async (req: Request, res: Response) => {
    try {
      const registros = await Modelo.findAll();
      return res.json(registros);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao buscar registros', detalhes: error.message });
    }
  },

  // Atualizar um registro por ID
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [atualizado] = await Modelo.update(req.body, { where: { id } });

      if (atualizado) {
        const registro = await Modelo.findByPk(id);
        return res.json(registro);
      }

      return res.status(404).json({ error: 'Registro não encontrado' });
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao atualizar registro', detalhes: error.message });
    }
  },

  // Deletar um registro por ID
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deletado = await Modelo.destroy({ where: { id } });

      if (deletado) {
        return res.status(204).send();
      }

      return res.status(404).json({ error: 'Registro não encontrado' });
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao deletar registro', detalhes: error.message });
    }
  }
};
```

🚏 3. Rotas (routes/modeloRoutes.ts)
```ts
import { Router } from 'express';
import { controllerModelo } from '../controllers/modeloController';

const routes = Router();

routes.post('/', controllerModelo.save);       // Criar
routes.get('/', controllerModelo.findAll);     // Listar
routes.put('/:id', controllerModelo.update);   // Atualizar
routes.delete('/:id', controllerModelo.delete); // Deletar

export default routes;
```

🔗 4. Index das Rotas (routes/index.ts)
```ts
import { Router } from 'express';
import modeloRoutes from './modeloRoutes';

const router = Router();

router.use('/modelo', modeloRoutes); // Base: /modelo

export default router;
```
🏁 5. Uso no App (app.ts ou server.ts)
```ts
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
import router from "./routes";

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

export default app;
```