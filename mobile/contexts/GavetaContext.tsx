import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface GavetaValor {
  aberta: boolean;
  abrir: () => void;
  fechar: () => void;
}

const GavetaContext = createContext<GavetaValor | null>(null);

export function GavetaProvider({ children }: { children: ReactNode }) {
  const [aberta, setAberta] = useState(false);
  const abrir = useCallback(() => setAberta(true), []);
  const fechar = useCallback(() => setAberta(false), []);
  const valor = useMemo(() => ({ aberta, abrir, fechar }), [aberta, abrir, fechar]);
  return <GavetaContext.Provider value={valor}>{children}</GavetaContext.Provider>;
}

export function useGaveta(): GavetaValor {
  const valor = useContext(GavetaContext);
  if (!valor) {
    throw new Error('useGaveta precisa ficar dentro de GavetaProvider.');
  }
  return valor;
}
