import { lerClaims } from './jwtClaims';

function trecho(valor: object): string {
  const bytes = new TextEncoder().encode(JSON.stringify(valor));
  let binario = '';
  bytes.forEach((byte) => {
    binario += String.fromCharCode(byte);
  });
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function token(carga: object): string {
  return `${trecho({ alg: 'HS256', typ: 'JWT' })}.${trecho(carga)}.assinatura`;
}

describe('lerClaims', () => {
  it('lê algoritmo, userId e expiração sem expor o segredo', () => {
    const lido = lerClaims(token({ userId: 'leia', exp: 2_000_000_000 }));
    expect(lido).toEqual({ algoritmo: 'HS256', userId: 'leia', expiraEm: 2_000_000_000 });
  });

  it('recusa token incompleto', () => {
    expect(lerClaims('so.duas')).toBeNull();
    expect(lerClaims('')).toBeNull();
  });
});
