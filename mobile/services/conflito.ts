import type { ArquivoHolocron } from '../types/starwars';

export interface ConflitoEstudo {
  itemId: string;
  nome: string;
  local: ArquivoHolocron;
  remoto: ArquivoHolocron;
}

function estudoDifere(local: ArquivoHolocron, remoto: ArquivoHolocron): boolean {
  return (
    local.status !== remoto.status ||
    local.progresso !== remoto.progresso ||
    local.nota !== remoto.nota ||
    local.anotacao !== remoto.anotacao ||
    local.deck !== remoto.deck ||
    local.deck_id !== remoto.deck_id
  );
}

function instante(valor: string): number {
  const lido = Date.parse(valor);
  return Number.isNaN(lido) ? 0 : lido;
}

export function ultimaEscrita(local: ArquivoHolocron, remoto: ArquivoHolocron): ArquivoHolocron {
  return instante(local.updated_at) >= instante(remoto.updated_at) ? local : remoto;
}

function textoPreenchido(valor: string): boolean {
  return valor.trim().length > 0;
}

export function mesclar(local: ArquivoHolocron, remoto: ArquivoHolocron): ArquivoHolocron {
  const recente = ultimaEscrita(local, remoto);
  const anotacao =
    local.anotacao === remoto.anotacao
      ? local.anotacao
      : textoPreenchido(local.anotacao) && textoPreenchido(remoto.anotacao) && local.anotacao !== remoto.anotacao
        ? `${local.anotacao.trim()}\n${remoto.anotacao.trim()}`
        : textoPreenchido(local.anotacao)
          ? local.anotacao
          : remoto.anotacao;

  return {
    ...recente,
    status: local.status === remoto.status ? local.status : recente.status,
    progresso: Math.max(local.progresso, remoto.progresso),
    nota: Math.max(local.nota, remoto.nota),
    anotacao,
    deck: local.deck === remoto.deck ? local.deck : recente.deck,
    deck_id: local.deck_id === remoto.deck_id ? local.deck_id : recente.deck_id,
    updated_at: new Date(Math.max(instante(local.updated_at), instante(remoto.updated_at), Date.now())).toISOString(),
  };
}

export function reconciliar(
  locais: ArquivoHolocron[],
  remotos: ArquivoHolocron[],
): { mantidos: ArquivoHolocron[]; conflitos: ConflitoEstudo[] } {
  const porId = new Map(locais.map((item) => [item.item_id, item]));
  const vistos = new Set<string>();
  const mantidos: ArquivoHolocron[] = [];
  const conflitos: ConflitoEstudo[] = [];

  for (const remoto of remotos) {
    vistos.add(remoto.item_id);
    const local = porId.get(remoto.item_id);
    if (local && estudoDifere(local, remoto)) {
      conflitos.push({ itemId: local.item_id, nome: local.nome, local, remoto });
      mantidos.push(local);
    } else {
      mantidos.push(local ?? remoto);
    }
  }

  for (const local of locais) {
    if (!vistos.has(local.item_id)) {
      mantidos.push(local);
    }
  }

  return { mantidos, conflitos };
}

export function mesmoEstudo(a: ArquivoHolocron, b: ArquivoHolocron): boolean {
  return !estudoDifere(a, b);
}
