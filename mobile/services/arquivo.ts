import { File, Paths } from 'expo-file-system';
import type { ArquivoHolocron } from '../types/starwars';
import { CHAVES } from './chaves';
import { gravar, ler } from './storage';

const NOME = 'holocron-arquivo.json';

export async function exportarArquivo(arquivos: ArquivoHolocron[]): Promise<string> {
  const destino = new File(Paths.document, NOME);
  destino.create({ overwrite: true });
  destino.write(JSON.stringify(arquivos, null, 2));
  return destino.uri;
}

export async function guardarCapa(itemId: string, url: string): Promise<string | null> {
  if (!url.startsWith('https://')) {
    return null;
  }
  try {
    const destino = new File(Paths.cache, `capa-${itemId.replace(/[^A-Za-z0-9._-]/g, '_')}.img`);
    const baixado = await File.downloadFileAsync(url, destino, { idempotent: true });
    const mapa = (await ler<Record<string, string>>(CHAVES.capas)) ?? {};
    mapa[itemId] = baixado.uri;
    await gravar(CHAVES.capas, mapa);
    return baixado.uri;
  } catch {
    return null;
  }
}

export async function lerCapas(): Promise<Record<string, string>> {
  return (await ler<Record<string, string>>(CHAVES.capas)) ?? {};
}
