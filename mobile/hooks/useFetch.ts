import { useCallback, useEffect, useState } from 'react';

export function useFetch<T>(buscar: () => Promise<T>) {
  const [dados, setDados] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setDados(await buscar());
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao carregar.');
    } finally {
      setCarregando(false);
    }
  }, [buscar]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { dados, carregando, erro, recarregar };
}
