import assert from 'node:assert/strict';
import test from 'node:test';

process.env.JWT_SECRET = 'segredo-de-laboratorio-com-32-chars';

import { assinarToken, lerToken } from './jwt';

test('assina e lê um JWT HS256 só com userId', () => {
  const token = assinarToken('usuario-1');
  const partes = token.split('.');
  assert.equal(partes.length, 3);
  const payload = JSON.parse(Buffer.from(partes[1], 'base64url').toString('utf8')) as {
    userId: string;
    senha?: string;
  };
  assert.equal(payload.userId, 'usuario-1');
  assert.equal(payload.senha, undefined);
  assert.deepEqual(lerToken(token), { userId: 'usuario-1' });
});

test('recusa token adulterado', () => {
  const token = assinarToken('usuario-1');
  const partes = token.split('.');
  partes[1] = Buffer.from(JSON.stringify({ userId: 'outro' })).toString('base64url');
  assert.throws(() => lerToken(partes.join('.')));
});
