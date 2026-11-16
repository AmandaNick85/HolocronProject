import { CHAVES } from '../services/chaves';
import { montarTema, type Alianca, type Tema } from '../constants/theme';
import { usePersistedState } from './usePersistedState';

export function useTema(): Tema & { definirAlianca: (alianca: Alianca) => void } {
  const [alianca, definirAlianca] = usePersistedState<Alianca>(CHAVES.alianca, 'azul');
  const modo = 'dark' as const;
  const segura: Alianca = alianca === 'verde' || alianca === 'vermelho' || alianca === 'azul' ? alianca : 'azul';

  return {
    ...montarTema(modo, segura),
    definirAlianca,
  };
}
