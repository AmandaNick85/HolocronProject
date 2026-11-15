import { Router } from 'express';
import { atualizar, criar, listar, remover } from '../controllers/arquivos.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export const arquivosRoutes = Router();

arquivosRoutes.use(authMiddleware);
arquivosRoutes.get('/', listar);
arquivosRoutes.post('/', criar);
arquivosRoutes.put('/:itemId', atualizar);
arquivosRoutes.delete('/:itemId', remover);
