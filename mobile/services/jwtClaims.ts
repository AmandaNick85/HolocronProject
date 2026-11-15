export interface ClaimsJwt {
  algoritmo: string;
  userId: string;
  expiraEm: number | null;
}

function base64Url(trecho: string): string {
  const padrao = trecho.replace(/-/g, '+').replace(/_/g, '/');
  const falta = (4 - (padrao.length % 4)) % 4;
  return padrao + '='.repeat(falta);
}

function decodificar(trecho: string): unknown {
  const binario = globalThis.atob(base64Url(trecho));
  const bytes = Uint8Array.from(binario, (char) => char.charCodeAt(0));
  const texto = new TextDecoder().decode(bytes);
  return JSON.parse(texto) as unknown;
}

export function lerClaims(token: string): ClaimsJwt | null {
  const partes = token.split('.');
  if (partes.length !== 3 || partes.some((parte) => parte.length === 0)) {
    return null;
  }
  try {
    const cabecalho = decodificar(partes[0]);
    const carga = decodificar(partes[1]);
    if (!cabecalho || typeof cabecalho !== 'object' || !carga || typeof carga !== 'object') {
      return null;
    }
    const algoritmo = (cabecalho as { alg?: unknown }).alg;
    const userId = (carga as { userId?: unknown }).userId;
    const exp = (carga as { exp?: unknown }).exp;
    if (typeof algoritmo !== 'string' || typeof userId !== 'string') {
      return null;
    }
    return {
      algoritmo,
      userId,
      expiraEm: typeof exp === 'number' ? exp : null,
    };
  } catch {
    return null;
  }
}
