export const CATEGORIAS = [
  'characters',
  'locations',
  'vehicles',
  'droids',
  'species',
  'creatures',
  'organizations',
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export const ROTULO_CATEGORIA: Record<Categoria, string> = {
  characters: 'Personagens',
  locations: 'Locais',
  vehicles: 'Veículos',
  droids: 'Droides',
  species: 'Espécies',
  creatures: 'Criaturas',
  organizations: 'Organizações',
};

export const STATUS_ESTUDO = ['Para Explorar', 'Estudando', 'Dominado', 'Favorito'] as const;

export type StatusEstudo = (typeof STATUS_ESTUDO)[number];

export function ehCategoria(valor: string): valor is Categoria {
  return (CATEGORIAS as readonly string[]).includes(valor);
}

export function ehStatus(valor: string): valor is StatusEstudo {
  return (STATUS_ESTUDO as readonly string[]).includes(valor);
}

export interface EntradaResumo {
  _id: string;
  name: string;
  description: string;
  image: string;
}

export interface PaginaDatabank {
  info: {
    total: number;
    page: number;
    next: string | null;
    prev: string | null;
  };
  data: EntradaResumo[];
}

export interface ArquivoHolocron {
  item_id: string;
  categoria: Categoria;
  nome: string;
  imagem_url: string;
  descricao: string;
  status: StatusEstudo;
  progresso: number;
  nota: number;
  anotacao: string;
  updated_at: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
}

export interface Sessao {
  user: Usuario;
  token: string;
}

export interface LinhaTecnica {
  rotulo: string;
  valor: string;
}

export interface FichaTecnica {
  origem: string;
  linhas: LinhaTecnica[];
}

export interface UltimaLeitura {
  nome: string;
  categoria: Categoria;
}
