import { Router } from 'express';
import { entrar, registrar } from '../controllers/auth.controller';

export const authRoutes = Router();

authRoutes.post('/register', registrar);
authRoutes.post('/login', entrar);
