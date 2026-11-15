import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CHAVE_PERMITIDA = /^[A-Za-z0-9._-]+$/;

export const CHAVE_TOKEN = 'holocron.v2.jwt_token';
const CHAVE_TOKEN_LEGADA = 'holocron_jwt_token';

interface MemoriaWeb {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
  removeItem(chave: string): void;
}

function memoriaWeb(): MemoriaWeb | null {
  const global = globalThis as { sessionStorage?: MemoriaWeb };
  return global.sessionStorage ?? null;
}

function afirmarChave(chave: string): void {
  if (!CHAVE_PERMITIDA.test(chave)) {
    throw new Error('Chave de segredo inválida.');
  }
}

export async function promoverTokenLegado(): Promise<void> {
  const atual = await lerSegredo(CHAVE_TOKEN);
  if (atual) {
    return;
  }
  const legado = await lerSegredo(CHAVE_TOKEN_LEGADA);
  if (!legado) {
    return;
  }
  await gravarSegredo(CHAVE_TOKEN, legado);
  await apagarSegredo(CHAVE_TOKEN_LEGADA);
}

export async function lerSegredo(chave: string): Promise<string | null> {
  afirmarChave(chave);
  if (Platform.OS === 'web') {
    return memoriaWeb()?.getItem(chave) ?? null;
  }
  try {
    return await SecureStore.getItemAsync(chave);
  } catch {
    return null;
  }
}

export async function gravarSegredo(chave: string, valor: string): Promise<void> {
  afirmarChave(chave);
  if (Platform.OS === 'web') {
    memoriaWeb()?.setItem(chave, valor);
    return;
  }
  await SecureStore.setItemAsync(chave, valor);
}

export async function apagarSegredo(chave: string): Promise<void> {
  afirmarChave(chave);
  if (Platform.OS === 'web') {
    memoriaWeb()?.removeItem(chave);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(chave);
  } catch {
    // O cofre já pode estar vazio.
  }
}
