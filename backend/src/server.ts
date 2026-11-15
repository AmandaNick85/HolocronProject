import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { obterBanco } from './database/conexao';
import { arquivosRoutes } from './routes/arquivos.routes';
import { authRoutes } from './routes/auth.routes';

const porta = Number(process.env.PORT ?? 3000);

obterBanco();

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/saude', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/auth', authRoutes);
app.use('/arquivos', arquivosRoutes);

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof SyntaxError) {
    res.status(400).json({ erro: 'JSON inválido.' });
    return;
  }
  res.status(500).json({ erro: 'Falha interna.' });
});

app.listen(porta, '0.0.0.0', () => {
  process.stdout.write(`Holocron API em http://0.0.0.0:${porta}\n`);
});
