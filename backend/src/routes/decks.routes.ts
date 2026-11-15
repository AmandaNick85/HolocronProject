import { Router } from 'express';
import { criarDeck, listarDecks, removerDeck } from '../controllers/decks.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export const decksRoutes = Router();

decksRoutes.use(authMiddleware);
decksRoutes.get('/', listarDecks);
decksRoutes.post('/', criarDeck);
decksRoutes.delete('/:id', removerDeck);
