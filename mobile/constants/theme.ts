import type { ViewStyle } from 'react-native';

export const espaco = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
} as const;

export const raio = {
  reto: 0,
} as const;

export type Alianca = 'azul' | 'verde' | 'vermelho';

export const ALIANCAS: Alianca[] = ['azul', 'verde', 'vermelho'];

export const ROTULO_ALIANCA: Record<Alianca, string> = {
  azul: 'Azul',
  verde: 'Verde',
  vermelho: 'Vermelho',
};

export interface Tema {
  modo: 'light' | 'dark';
  alianca: Alianca;
  fundo: string;
  painel: string;
  texto: string;
  textoSecundario: string;
  tinta: string;
  tintaForte: string;
  tintaFraca: string;
  tintaSuave: string;
  tintaSobre: string;
  amostra: string;
  perigo: string;
  sombra: ViewStyle;
}

const AMOSTRA: Record<Alianca, string> = {
  azul: '#3EC6FF',
  verde: '#3DFF8F',
  vermelho: '#FF5A5A',
};

const TINTA_ESCURA: Record<Alianca, { tinta: string; forte: string; fraca: string; suave: string; secundario: string }> = {
  azul: {
    tinta: '#3EC6FF',
    forte: '#8AD9FF',
    fraca: '#3EC6FF99',
    suave: '#3EC6FF22',
    secundario: '#A9D7EA',
  },
  verde: {
    tinta: '#3DFF8F',
    forte: '#9DFFC4',
    fraca: '#3DFF8F99',
    suave: '#3DFF8F22',
    secundario: '#B6F5CF',
  },
  vermelho: {
    tinta: '#FF5A5A',
    forte: '#FFA3A3',
    fraca: '#FF5A5A99',
    suave: '#FF5A5A22',
    secundario: '#FFC4C4',
  },
};

const TINTA_CLARA: Record<Alianca, { tinta: string; forte: string; fraca: string; suave: string; secundario: string }> = {
  azul: {
    tinta: '#0C6A94',
    forte: '#084E6E',
    fraca: '#0C6A9488',
    suave: '#0C6A9418',
    secundario: '#0C4A68',
  },
  verde: {
    tinta: '#0E7A3A',
    forte: '#0A5A2A',
    fraca: '#0E7A3A88',
    suave: '#0E7A3A18',
    secundario: '#0B5C2C',
  },
  vermelho: {
    tinta: '#B42323',
    forte: '#8C1A1A',
    fraca: '#B4232388',
    suave: '#B4232318',
    secundario: '#8C1A1A',
  },
};

export function montarTema(modo: 'light' | 'dark', alianca: Alianca): Tema {
  const tinta = modo === 'dark' ? TINTA_ESCURA[alianca] : TINTA_CLARA[alianca];
  const escuro = modo === 'dark';

  return {
    modo,
    alianca,
    fundo: escuro ? '#07090C' : '#D7DCE3',
    painel: escuro ? '#10161C' : '#F7F8FA',
    texto: escuro ? '#E8F4F8' : '#12171C',
    textoSecundario: tinta.secundario,
    tinta: tinta.tinta,
    tintaForte: tinta.forte,
    tintaFraca: tinta.fraca,
    tintaSuave: tinta.suave,
    tintaSobre: escuro ? '#071016' : '#F7FBFD',
    amostra: AMOSTRA[alianca],
    perigo: escuro ? '#FF8D8D' : '#8C1A1A',
    sombra: {
      shadowColor: '#000000',
      shadowOffset: { width: 2, height: 3 },
      shadowOpacity: escuro ? 0.5 : 0.18,
      shadowRadius: 4,
      elevation: 4,
    },
  };
}

export const fonte = {
  wordmark: 'Audiowide_400Regular',
  texto: 'Rajdhani_500Medium',
  textoForte: 'Rajdhani_600SemiBold',
  titulo: 'Rajdhani_700Bold',
  mono: 'ShareTechMono_400Regular',
} as const;
