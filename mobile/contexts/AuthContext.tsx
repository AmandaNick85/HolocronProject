import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { router } from 'expo-router';
import { backendApi, definirAoNaoAutorizado, mensagemHttp } from '../services/backendApi';
import { CHAVES } from '../services/chaves';
import { limparConflitos } from '../services/conflitosStore';
import { limparBanco } from '../services/database';
import { lerClaims, type ClaimsJwt } from '../services/jwtClaims';
import { migrarArmazenamento } from '../services/migrar';
import { apagarSegredo, CHAVE_TOKEN, gravarSegredo, lerSegredo, promoverTokenLegado } from '../services/seguro';
import { apagar, gravar, ler } from '../services/storage';
import type { Sessao, Usuario } from '../types/starwars';

interface AuthValor {
  usuario: Usuario | null;
  claims: ClaimsJwt | null;
  pronto: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  registrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthValor | null>(null);

function ehUsuario(valor: unknown): valor is Usuario {
  if (!valor || typeof valor !== 'object') {
    return false;
  }
  const bruto = valor as Record<string, unknown>;
  return typeof bruto.id === 'string' && typeof bruto.nome === 'string' && typeof bruto.email === 'string';
}

async function guardarSessao(sessao: Sessao): Promise<void> {
  await gravarSegredo(CHAVE_TOKEN, sessao.token);
  await gravar(CHAVES.usuario, sessao.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [claims, setClaims] = useState<ClaimsJwt | null>(null);
  const [pronto, setPronto] = useState(false);
  const saindo = useRef(false);

  const sair = useCallback(async () => {
    if (saindo.current) {
      return;
    }
    saindo.current = true;
    try {
      await apagarSegredo(CHAVE_TOKEN);
      await apagar(CHAVES.usuario);
      await limparBanco();
      await limparConflitos();
      setUsuario(null);
      setClaims(null);
      router.replace('/login');
    } finally {
      saindo.current = false;
    }
  }, []);

  useEffect(() => {
    definirAoNaoAutorizado(() => {
      void sair();
    });
  }, [sair]);

  useEffect(() => {
    let vivo = true;
    (async () => {
      await migrarArmazenamento();
      await promoverTokenLegado();
      const [token, perfil] = await Promise.all([lerSegredo(CHAVE_TOKEN), ler<unknown>(CHAVES.usuario)]);
      if (!vivo) {
        return;
      }
      const lidos = token ? lerClaims(token) : null;
      if (token && lidos && ehUsuario(perfil) && perfil.id === lidos.userId) {
        setUsuario(perfil);
        setClaims(lidos);
      } else {
        await apagarSegredo(CHAVE_TOKEN);
        await apagar(CHAVES.usuario);
      }
      setPronto(true);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const concluir = useCallback(async (caminho: '/auth/login' | '/auth/register', corpo: Record<string, string>) => {
    try {
      const resposta = await backendApi.post<unknown>(caminho, corpo);
      const dados = resposta.data;
      if (!dados || typeof dados !== 'object' || !('user' in dados) || !('token' in dados)) {
        throw new Error('Resposta de sessão inválida.');
      }
      const sessao = dados as { user: unknown; token: unknown };
      if (!ehUsuario(sessao.user) || typeof sessao.token !== 'string') {
        throw new Error('Resposta de sessão inválida.');
      }
      const lidos = lerClaims(sessao.token);
      if (!lidos || lidos.userId !== sessao.user.id) {
        throw new Error('O token JWT não corresponde à conta.');
      }
      await guardarSessao({ user: sessao.user, token: sessao.token });
      setUsuario(sessao.user);
      setClaims(lidos);
      router.replace('/(app)/(tabs)');
    } catch (erro) {
      throw new Error(mensagemHttp(erro, 'Não foi possível entrar.'));
    }
  }, []);

  const entrar = useCallback(
    (email: string, senha: string) => concluir('/auth/login', { email, senha }),
    [concluir],
  );

  const registrar = useCallback(
    (nome: string, email: string, senha: string) => concluir('/auth/register', { nome, email, senha }),
    [concluir],
  );

  const valor = useMemo(
    () => ({ usuario, claims, pronto, entrar, registrar, sair }),
    [usuario, claims, pronto, entrar, registrar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValor {
  const valor = useContext(AuthContext);
  if (!valor) {
    throw new Error('useAuth precisa ficar dentro de AuthProvider.');
  }
  return valor;
}
