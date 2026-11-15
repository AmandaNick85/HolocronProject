import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { useOnline } from '../hooks/useOnline';
import { guardarCapa } from '../services/arquivo';
import { backendApi, mensagemHttp, statusHttp } from '../services/backendApi';
import { CHAVES, ehPolitica, type PoliticaConflito } from '../services/chaves';
import { mesclar, mesmoEstudo, reconciliar, ultimaEscrita, type ConflitoEstudo } from '../services/conflito';
import { acrescentarConflitos, listarConflitos, removerConflito } from '../services/conflitosStore';
import {
  contarFila,
  enfileirar,
  iniciarBanco,
  listarLocais,
  puxarServidor,
  removerLocal,
  salvarLocal,
  sincronizarFila,
  substituirLocais,
} from '../services/database';
import { ler } from '../services/storage';
import type { ArquivoHolocron, EntradaResumo, StatusEstudo } from '../types/starwars';
import { ehCategoria } from '../types/starwars';

interface NovoArquivo {
  entrada: EntradaResumo;
  categoria: string;
}

interface Atualizacao {
  status?: StatusEstudo;
  progresso?: number;
  nota?: number;
  anotacao?: string;
}

interface HolocronValor {
  arquivos: ArquivoHolocron[];
  carregando: boolean;
  erro: string | null;
  dominioMedio: number;
  contagem: Record<StatusEstudo, number>;
  recarregar: () => Promise<void>;
  adicionar: (novo: NovoArquivo) => Promise<void>;
  atualizar: (itemId: string, patch: Atualizacao) => Promise<void>;
  incrementar: (itemId: string) => Promise<void>;
  remover: (itemId: string) => Promise<void>;
  obter: (itemId: string) => ArquivoHolocron | undefined;
  conflitos: ConflitoEstudo[];
  resolverConflito: (itemId: string, escolha: 'local' | 'remoto' | 'ultima' | 'mesclar') => Promise<void>;
}

const HolocronContext = createContext<HolocronValor | null>(null);

const CONTAGEM_VAZIA: Record<StatusEstudo, number> = {
  'Para Explorar': 0,
  Estudando: 0,
  Dominado: 0,
  Favorito: 0,
};

function agora(): string {
  return new Date().toISOString();
}

export function HolocronProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const online = useOnline();
  const [arquivos, setArquivos] = useState<ArquivoHolocron[]>([]);
  const [conflitos, setConflitos] = useState<ConflitoEstudo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const onlineRef = useRef(online);
  onlineRef.current = online;
  const geracao = useRef(0);
  const cadeia = useRef(Promise.resolve());

  const emSerie = useCallback(<T,>(tarefa: () => Promise<T>): Promise<T> => {
    const execucao = cadeia.current.then(tarefa, tarefa);
    cadeia.current = execucao.then(
      () => undefined,
      () => undefined,
    );
    return execucao;
  }, []);

  const aplicarLocais = useCallback(async () => {
    const locais = await listarLocais();
    setArquivos(locais);
    return locais;
  }, []);

  const sincronizar = useCallback(async () => {
    await emSerie(async () => {
      if (!onlineRef.current) {
        return;
      }
      await sincronizarFila();
      const pendentes = await contarFila();
      if (pendentes > 0) {
        await aplicarLocais();
        return;
      }
      const remotos = await puxarServidor();
      if (!remotos) {
        return;
      }
      const locais = await listarLocais();
      const { mantidos, conflitos: achados } = reconciliar(locais, remotos);
      const politicaBruta = await ler<unknown>(CHAVES.politica);
      const politica: PoliticaConflito = ehPolitica(politicaBruta) ? politicaBruta : 'manual';
      if (politica === 'manual') {
        setConflitos(await acrescentarConflitos(achados));
        await substituirLocais(mantidos);
        setArquivos(mantidos);
        return;
      }
      const resolvidos = await Promise.all(
        achados.map(async (item) => {
          const escolhido = politica === 'ultima' ? ultimaEscrita(item.local, item.remoto) : mesclar(item.local, item.remoto);
          await salvarLocal(escolhido);
          if (!mesmoEstudo(escolhido, item.remoto)) {
            try {
              await backendApi.put(`/arquivos/${encodeURIComponent(item.itemId)}`, {
                status: escolhido.status,
                progresso: escolhido.progresso,
                nota: escolhido.nota,
                anotacao: escolhido.anotacao,
              });
            } catch {
              await enfileirar('atualizar', item.itemId, escolhido);
            }
          }
          await removerConflito(item.itemId);
          return escolhido;
        }),
      );
      const porId = new Map(mantidos.map((item) => [item.item_id, item]));
      for (const item of resolvidos) {
        porId.set(item.item_id, item);
      }
      const lista = [...porId.values()];
      await substituirLocais(lista);
      setArquivos(lista);
      setConflitos(await listarConflitos());
    });
  }, [aplicarLocais, emSerie]);

  const recarregar = useCallback(async () => {
    const ticket = geracao.current;
    setCarregando(true);
    setErro(null);
    try {
      await iniciarBanco();
      await aplicarLocais();
      setConflitos(await listarConflitos());
      if (ticket !== geracao.current) {
        return;
      }
      setCarregando(false);
      await sincronizar();
    } catch (falha) {
      if (ticket !== geracao.current) {
        return;
      }
      setErro(falha instanceof Error ? falha.message : 'Não foi possível abrir o arquivo local.');
      setCarregando(false);
    }
  }, [aplicarLocais, sincronizar]);

  useEffect(() => {
    geracao.current += 1;
    if (!usuario) {
      setArquivos([]);
      setConflitos([]);
      setErro(null);
      setCarregando(false);
      return;
    }
    void recarregar();
  }, [usuario, recarregar]);

  useEffect(() => {
    if (!usuario || !online) {
      return;
    }
    void sincronizar();
  }, [online, usuario, sincronizar]);

  const adicionar = useCallback(async ({ entrada, categoria }: NovoArquivo) => emSerie(async () => {
    if (!ehCategoria(categoria)) {
      throw new Error('Categoria inválida.');
    }
    if (!entrada.image) {
      throw new Error('Essa ficha não tem imagem oficial para arquivar.');
    }
    if (arquivos.some((item) => item.item_id === entrada._id)) {
      throw new Error('Essa entrada já está no Holocron.');
    }

    const registro: ArquivoHolocron = {
      item_id: entrada._id,
      categoria,
      nome: entrada.name,
      imagem_url: entrada.image,
      descricao: entrada.description,
      status: 'Para Explorar',
      progresso: 0,
      nota: 0,
      anotacao: '',
      updated_at: agora(),
    };

    setArquivos((atual) => [registro, ...atual.filter((item) => item.item_id !== registro.item_id)]);
    await salvarLocal(registro);
    void guardarCapa(registro.item_id, registro.imagem_url);

    const reverter = async (mensagem: string) => {
      setArquivos((atual) => atual.filter((item) => item.item_id !== registro.item_id));
      await removerLocal(registro.item_id);
      throw new Error(mensagem);
    };

    if (!onlineRef.current) {
      await enfileirar('criar', registro.item_id, registro);
      return;
    }

    try {
      await backendApi.post('/arquivos', registro);
    } catch (falha) {
      const status = statusHttp(falha);
      if (status === 409) {
        return;
      }
      if (status === 400 || status === 401) {
        await reverter(mensagemHttp(falha, 'Não foi possível guardar.'));
        return;
      }
      await enfileirar('criar', registro.item_id, registro);
    }
  }), [arquivos, emSerie]);

  const atualizar = useCallback(async (itemId: string, patch: Atualizacao) => emSerie(async () => {
    const atual = arquivos.find((item) => item.item_id === itemId);
    if (!atual) {
      throw new Error('Essa entrada não está no Holocron.');
    }
    const registro: ArquivoHolocron = {
      ...atual,
      ...patch,
      updated_at: agora(),
    };
    setArquivos((lista) => lista.map((item) => (item.item_id === itemId ? registro : item)));
    await salvarLocal(registro);

    if (!onlineRef.current) {
      await enfileirar('atualizar', itemId, registro);
      return;
    }

    try {
      await backendApi.put(`/arquivos/${encodeURIComponent(itemId)}`, {
        status: registro.status,
        progresso: registro.progresso,
        nota: registro.nota,
        anotacao: registro.anotacao,
      });
    } catch (falha) {
      const status = statusHttp(falha);
      if (status === 400 || status === 401) {
        setArquivos((lista) => lista.map((item) => (item.item_id === itemId ? atual : item)));
        await salvarLocal(atual);
        throw new Error(mensagemHttp(falha, 'Não foi possível atualizar o estudo.'));
      }
      await enfileirar('atualizar', itemId, registro);
    }
  }), [arquivos, emSerie]);

  const incrementar = useCallback(async (itemId: string) => {
    const atual = arquivos.find((item) => item.item_id === itemId);
    if (!atual) {
      throw new Error('Essa entrada não está no Holocron.');
    }
    const progresso = Math.min(100, atual.progresso + 25);
    await atualizar(itemId, { progresso });
  }, [arquivos, atualizar]);

  const remover = useCallback(async (itemId: string) => emSerie(async () => {
    const atual = arquivos.find((item) => item.item_id === itemId);
    if (!atual) {
      return;
    }
    setArquivos((lista) => lista.filter((item) => item.item_id !== itemId));
    await removerLocal(itemId);

    if (!onlineRef.current) {
      await enfileirar('remover', itemId, atual);
      return;
    }

    try {
      await backendApi.delete(`/arquivos/${encodeURIComponent(itemId)}`);
    } catch (falha) {
      const status = statusHttp(falha);
      if (status === 404) {
        return;
      }
      if (status === 400 || status === 401) {
        setArquivos((lista) => [atual, ...lista.filter((item) => item.item_id !== itemId)]);
        await salvarLocal(atual);
        throw new Error(mensagemHttp(falha, 'Não foi possível remover.'));
      }
      await enfileirar('remover', itemId, atual);
    }
  }), [arquivos, emSerie]);

  const contagem = useMemo(() => {
    const base = { ...CONTAGEM_VAZIA };
    for (const item of arquivos) {
      base[item.status] += 1;
    }
    return base;
  }, [arquivos]);

  const dominioMedio = useMemo(() => {
    if (arquivos.length === 0) {
      return 0;
    }
    const soma = arquivos.reduce((total, item) => total + item.progresso, 0);
    return Math.round(soma / arquivos.length);
  }, [arquivos]);

  const resolverConflito = useCallback(
    async (itemId: string, escolha: 'local' | 'remoto' | 'ultima' | 'mesclar') =>
      emSerie(async () => {
        const lista = await listarConflitos();
        const conflito = lista.find((item) => item.itemId === itemId);
        if (!conflito) {
          return;
        }
        const escolhido =
          escolha === 'local'
            ? conflito.local
            : escolha === 'remoto'
              ? conflito.remoto
              : escolha === 'ultima'
                ? ultimaEscrita(conflito.local, conflito.remoto)
                : mesclar(conflito.local, conflito.remoto);
        await salvarLocal(escolhido);
        if (!mesmoEstudo(escolhido, conflito.remoto) && onlineRef.current) {
          await backendApi.put(`/arquivos/${encodeURIComponent(itemId)}`, {
            status: escolhido.status,
            progresso: escolhido.progresso,
            nota: escolhido.nota,
            anotacao: escolhido.anotacao,
          });
        } else if (!mesmoEstudo(escolhido, conflito.remoto)) {
          await enfileirar('atualizar', itemId, escolhido);
        }
        await removerConflito(itemId);
        setConflitos(await listarConflitos());
        await aplicarLocais();
      }),
    [aplicarLocais, emSerie],
  );

  const obter = useCallback(
    (itemId: string) => arquivos.find((item) => item.item_id === itemId),
    [arquivos],
  );

  const valor = useMemo(
    () => ({
      arquivos,
      carregando,
      erro,
      dominioMedio,
      contagem,
      recarregar,
      adicionar,
      atualizar,
      incrementar,
      remover,
      obter,
      conflitos,
      resolverConflito,
    }),
    [
      arquivos,
      carregando,
      erro,
      dominioMedio,
      contagem,
      recarregar,
      adicionar,
      atualizar,
      incrementar,
      remover,
      obter,
      conflitos,
      resolverConflito,
    ],
  );

  return <HolocronContext.Provider value={valor}>{children}</HolocronContext.Provider>;
}

export function useHolocron(): HolocronValor {
  const valor = useContext(HolocronContext);
  if (!valor) {
    throw new Error('useHolocron precisa ficar dentro de HolocronProvider.');
  }
  return valor;
}
