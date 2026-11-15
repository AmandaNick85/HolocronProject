import type { ArquivoHolocron } from '../types/starwars';

export async function exportarArquivo(arquivos: ArquivoHolocron[]): Promise<string> {
  const blob = new Blob([JSON.stringify(arquivos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'holocron-arquivo.json';
  link.click();
  URL.revokeObjectURL(url);
  return 'holocron-arquivo.json';
}

export async function guardarCapa(_itemId: string, _url: string): Promise<string | null> {
  return null;
}

export async function lerCapas(): Promise<Record<string, string>> {
  return {};
}
