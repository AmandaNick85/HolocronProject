import { useCallback, useEffect, useRef, useState } from 'react';
import { apagar, gravar, ler } from '../services/storage';

type Ouvinte = () => void;

const memoria = new Map<string, unknown>();
const ouvintes = new Map<string, Set<Ouvinte>>();
const carregado = new Set<string>();
const cargas = new Map<string, Promise<void>>();

function garantirCarga(chave: string): void {
  if (carregado.has(chave) || cargas.has(chave)) {
    return;
  }
  const promessa = ler<unknown>(chave).then((salvo) => {
    if (!memoria.has(chave) && salvo !== null) {
      memoria.set(chave, salvo);
    }
    carregado.add(chave);
    ouvintes.get(chave)?.forEach((ouvinte) => ouvinte());
  });
  cargas.set(chave, promessa);
}

function inscrever(chave: string, ouvinte: Ouvinte): () => void {
  let grupo = ouvintes.get(chave);
  if (!grupo) {
    grupo = new Set();
    ouvintes.set(chave, grupo);
  }
  grupo.add(ouvinte);
  return () => {
    grupo?.delete(ouvinte);
  };
}

export function usePersistedState<T>(chave: string, inicial: T): [T, (valor: T | ((atual: T) => T)) => void, boolean] {
  const inicialRef = useRef(inicial);
  inicialRef.current = inicial;
  const [, setTick] = useState(0);

  useEffect(() => {
    garantirCarga(chave);
    const cancelar = inscrever(chave, () => setTick((n) => n + 1));
    if (carregado.has(chave)) {
      setTick((n) => n + 1);
    }
    return cancelar;
  }, [chave]);

  const definir = useCallback((valor: T | ((atual: T) => T)) => {
    const atual = (memoria.has(chave) ? memoria.get(chave) : inicialRef.current) as T;
    const proximo = typeof valor === 'function' ? (valor as (corrente: T) => T)(atual) : valor;
    memoria.set(chave, proximo);
    carregado.add(chave);
    void gravar(chave, proximo);
    ouvintes.get(chave)?.forEach((ouvinte) => ouvinte());
  }, [chave]);

  const valor = (memoria.has(chave) ? memoria.get(chave) : inicial) as T;
  return [valor, definir, carregado.has(chave)];
}

export async function apagarEstado(chave: string): Promise<void> {
  memoria.delete(chave);
  carregado.add(chave);
  await apagar(chave);
  ouvintes.get(chave)?.forEach((ouvinte) => ouvinte());
}
