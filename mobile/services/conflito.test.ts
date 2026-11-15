import { mesclar, reconciliar, ultimaEscrita } from './conflito';
import type { ArquivoHolocron } from '../types/starwars';

function arquivo(parcial: Partial<ArquivoHolocron>): ArquivoHolocron {
  return {
    item_id: '4lom',
    categoria: 'characters',
    nome: '4-LOM',
    imagem_url: 'https://exemplo.com/4lom.jpg',
    descricao: 'Caçador',
    status: 'Para Explorar',
    progresso: 0,
    nota: 0,
    anotacao: '',
    deck: 'jedi',
    deck_id: null,
    updated_at: '2026-01-01T00:00:00.000Z',
    ...parcial,
  };
}

describe('conflito de estudo', () => {
  it('fica com a escrita mais recente', () => {
    const local = arquivo({ progresso: 25, updated_at: '2026-02-01T00:00:00.000Z' });
    const remoto = arquivo({ progresso: 50, updated_at: '2026-03-01T00:00:00.000Z' });
    expect(ultimaEscrita(local, remoto).progresso).toBe(50);
  });

  it('mescla anotação e preserva o maior progresso', () => {
    const local = arquivo({ progresso: 25, anotacao: 'no aparelho', updated_at: '2026-02-01T00:00:00.000Z' });
    const remoto = arquivo({ progresso: 50, anotacao: 'no servidor', status: 'Estudando', updated_at: '2026-03-01T00:00:00.000Z' });
    const junto = mesclar(local, remoto);
    expect(junto.progresso).toBe(50);
    expect(junto.status).toBe('Estudando');
    expect(junto.anotacao).toContain('no aparelho');
    expect(junto.anotacao).toContain('no servidor');
  });

  it('separa o que divergiu e mantém o que só existe no aparelho', () => {
    const local = arquivo({ progresso: 25 });
    const remoto = arquivo({ progresso: 50 });
    const soLocal = arquivo({ item_id: 'leia', nome: 'Leia' });
    const { mantidos, conflitos } = reconciliar([local, soLocal], [remoto]);
    expect(conflitos).toHaveLength(1);
    expect(mantidos.map((item) => item.item_id).sort()).toEqual(['4lom', 'leia']);
    expect(mantidos.find((item) => item.item_id === '4lom')?.progresso).toBe(25);
  });
});
