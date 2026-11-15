import axios, { type AxiosError } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { urlApiPermitida, urlParaAparelho } from './rede';
import { CHAVE_TOKEN, lerSegredo } from './seguro';

const configurada = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3000';
const hostDoMetro = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost ?? null;

const baseURL = urlParaAparelho(configurada, Platform.OS, hostDoMetro);

if (!urlApiPermitida(baseURL, typeof __DEV__ === 'undefined' ? false : __DEV__)) {
  throw new Error('A API do Holocron precisa de HTTPS fora do laboratório local.');
}

export const backendApi = axios.create({
  baseURL,
  timeout: 12000,
});

type Ouvidor = () => void;
let aoNaoAutorizado: Ouvidor | null = null;

export function definirAoNaoAutorizado(ouvidor: Ouvidor): void {
  aoNaoAutorizado = ouvidor;
}

backendApi.interceptors.request.use(async (config) => {
  const caminho = config.url ?? '';
  if (caminho.startsWith('/auth/')) {
    return config;
  }
  const token = await lerSegredo(CHAVE_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

backendApi.interceptors.response.use(
  (resposta) => resposta,
  (erro: AxiosError) => {
    const enviado = erro.config?.headers?.Authorization;
    if (erro.response?.status === 401 && typeof enviado === 'string' && enviado.length > 0) {
      aoNaoAutorizado?.();
    }
    return Promise.reject(erro);
  },
);

export function mensagemHttp(erro: unknown, reserva: string): string {
  if (axios.isAxiosError(erro)) {
    const dados = erro.response?.data;
    if (dados && typeof dados === 'object' && 'erro' in dados) {
      const texto = (dados as { erro?: unknown }).erro;
      if (typeof texto === 'string' && texto.trim()) {
        return texto;
      }
    }
    if (!erro.response) {
      return `Sem rede para alcançar o Holocron em ${baseURL}.`;
    }
  }
  if (erro instanceof Error && erro.message) {
    return erro.message;
  }
  return reserva;
}

export function statusHttp(erro: unknown): number | null {
  if (axios.isAxiosError(erro)) {
    return erro.response?.status ?? null;
  }
  return null;
}
