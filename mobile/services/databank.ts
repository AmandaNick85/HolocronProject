import {
  starWarsApi,
  swapi,
} from './starWarsApi';
import { comCache } from './cache';
import type {
  Categoria,
  EntradaResumo,
  FichaTecnica,
  PaginaDatabank,
} from '../types/starwars';

const LIMITE = 20;

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor : '';
}

function resumir(valor: unknown): EntradaResumo | null {
  if (!valor || typeof valor !== 'object') {
    return null;
  }
  const bruto = valor as Record<string, unknown>;
  if (typeof bruto._id !== 'string' || typeof bruto.name !== 'string') {
    return null;
  }
  return {
    _id: bruto._id,
    name: bruto.name,
    description: texto(bruto.description),
    image: texto(bruto.image),
  };
}

function paginaDe(valor: unknown, page: number): PaginaDatabank {
  if (Array.isArray(valor)) {
    const data = valor.map(resumir).filter((item): item is EntradaResumo => item !== null);
    return { info: { total: data.length, page, next: null, prev: null }, data };
  }

  if (!valor || typeof valor !== 'object') {
    throw new Error('A enciclopédia devolveu um formato inesperado.');
  }

  const bruto = valor as Record<string, unknown>;
  const lista = Array.isArray(bruto.data) ? bruto.data : [];
  const info = bruto.info && typeof bruto.info === 'object' ? (bruto.info as Record<string, unknown>) : {};
  const data = lista.map(resumir).filter((item): item is EntradaResumo => item !== null);

  return {
    info: {
      total: typeof info.total === 'number' ? info.total : data.length,
      page: typeof info.page === 'number' ? info.page : page,
      next: typeof info.next === 'string' ? info.next : null,
      prev: typeof info.prev === 'string' ? info.prev : null,
    },
    data,
  };
}

async function pedir(caminho: string, params?: Record<string, string | number>): Promise<unknown> {
  try {
    const resposta = await starWarsApi.get<unknown>(caminho, { params });
    return resposta.data;
  } catch (erro) {
    if (erro instanceof Error && erro.message.startsWith('A enciclopédia')) {
      throw erro;
    }
    throw new Error('A enciclopédia não respondeu.');
  }
}

export async function listarPagina(categoria: Categoria, page: number): Promise<PaginaDatabank> {
  return comCache(`pagina_${categoria}_${page}`, async () => {
    const dados = await pedir(`/${categoria}`, { page, limit: LIMITE });
    return paginaDe(dados, page);
  });
}

export async function indiceCategoria(categoria: Categoria): Promise<EntradaResumo[]> {
  return comCache(`indice_${categoria}`, async () => {
    const todos: EntradaResumo[] = [];
    let page = 1;
    let seguir = true;

    while (seguir && page <= 40) {
      const dados = await pedir(`/${categoria}`, { page, limit: 100 });
      const pagina = paginaDe(dados, page);
      todos.push(
        ...pagina.data.map((item) => ({
          ...item,
          description: item.description.slice(0, 180),
        })),
      );
      seguir = Boolean(pagina.info.next);
      page += 1;
    }

    return todos;
  });
}

export function filtrarPorNome(lista: EntradaResumo[], consulta: string): EntradaResumo[] {
  const termo = consulta.trim().toLowerCase();
  if (!termo) {
    return lista;
  }
  return lista.filter((item) => item.name.toLowerCase().includes(termo));
}

export async function obterEntrada(categoria: Categoria, id: string): Promise<EntradaResumo> {
  return comCache(`entrada_${categoria}_${id}`, async () => {
    const dados = await pedir(`/${categoria}/${encodeURIComponent(id)}`);
    const entrada = resumir(dados);
    if (!entrada) {
      throw new Error('Essa ficha não está na enciclopédia.');
    }
    return entrada;
  });
}

function util(valor: unknown): string | null {
  if (typeof valor !== 'string') {
    return null;
  }
  const limpo = valor.trim();
  if (!limpo || limpo.toLowerCase() === 'unknown' || limpo.toLowerCase() === 'n/a') {
    return null;
  }
  return limpo;
}

function genero(valor: unknown): string | null {
  const bruto = util(valor);
  if (!bruto) {
    return null;
  }
  const mapa: Record<string, string> = {
    male: 'masculino',
    female: 'feminino',
    hermaphrodite: 'hermafrodita',
    none: 'nenhum',
  };
  return mapa[bruto.toLowerCase()] ?? bruto;
}

function linhasDe(recurso: string, item: Record<string, unknown>): FichaTecnica['linhas'] {
  const pares: [string, unknown][] =
    recurso === 'people'
      ? [
          ['Altura', item.height ? `${item.height} cm` : null],
          ['Massa', item.mass ? `${item.mass} kg` : null],
          ['Nascimento', item.birth_year],
          ['Gênero', genero(item.gender)],
        ]
      : recurso === 'planets'
        ? [
            ['Clima', item.climate],
            ['Terreno', item.terrain],
            ['População', item.population],
          ]
        : recurso === 'species'
          ? [
              ['Classificação', item.classification],
              ['Idioma', item.language],
              ['Altura média', item.average_height ? `${item.average_height} cm` : null],
            ]
          : [
              ['Modelo', item.model],
              ['Fabricante', item.manufacturer],
              ['Classe', item.starship_class ?? item.vehicle_class],
            ];

  return pares
    .map(([rotulo, valor]) => {
      const textoValor = util(valor);
      return textoValor ? { rotulo, valor: textoValor } : null;
    })
    .filter((linha): linha is { rotulo: string; valor: string } => linha !== null);
}

async function buscarRecurso(recurso: string, nome: string): Promise<Record<string, unknown> | null> {
  const resposta = await swapi.get<unknown>(`/${recurso}/`, { params: { search: nome } });
  const dados = resposta.data;
  if (!dados || typeof dados !== 'object' || !('results' in dados)) {
    return null;
  }
  const results = (dados as { results?: unknown }).results;
  if (!Array.isArray(results)) {
    return null;
  }
  const alvo = nome.trim().toLowerCase();
  for (const item of results) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const registro = item as Record<string, unknown>;
    if (typeof registro.name === 'string' && registro.name.trim().toLowerCase() === alvo) {
      return registro;
    }
  }
  return null;
}

export async function complementoSwapi(categoria: Categoria, nome: string): Promise<FichaTecnica | null> {
  const recursos =
    categoria === 'characters'
      ? ['people']
      : categoria === 'locations'
        ? ['planets']
        : categoria === 'species'
          ? ['species']
          : categoria === 'vehicles'
            ? ['starships', 'vehicles']
            : [];

  if (recursos.length === 0) {
    return null;
  }

  try {
    for (const recurso of recursos) {
      const item = await buscarRecurso(recurso, nome);
      if (!item) {
        continue;
      }
      const linhas = linhasDe(recurso, item);
      if (linhas.length === 0) {
        return null;
      }
      const origem = recurso === 'starships' ? 'naves' : recurso === 'people' ? 'pessoas' : recurso;
      return { origem: `SWAPI · ${origem}`, linhas };
    }
    return null;
  } catch {
    return null;
  }
}
