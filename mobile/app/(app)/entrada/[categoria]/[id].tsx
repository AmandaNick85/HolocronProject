import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Botao } from '../../../../components/Botao';
import { EstadoErro, EstadoVazio } from '../../../../components/Estados';
import { fonte } from '../../../../constants/theme';
import { useHolocron } from '../../../../contexts/HolocronContext';
import { useFetch } from '../../../../hooks/useFetch';
import { useTema } from '../../../../hooks/useTema';
import { CHAVES } from '../../../../services/chaves';
import { gravar } from '../../../../services/storage';
import { complementoSwapi, obterEntrada } from '../../../../services/databank';
import { ehCategoria, ROTULO_CATEGORIA, type Categoria, type FichaTecnica } from '../../../../types/starwars';

function unico(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) {
    return valor[0] ?? '';
  }
  return valor ?? '';
}

export default function Entrada() {
  const tema = useTema();
  const params = useLocalSearchParams<{ categoria?: string | string[]; id?: string | string[] }>();
  const categoriaBruta = unico(params.categoria);
  const id = unico(params.id);
  const categoriaValida = ehCategoria(categoriaBruta);
  const categoria = (categoriaValida ? categoriaBruta : 'characters') as Categoria;
  const { obter, adicionar, remover } = useHolocron();
  const [aberta, setAberta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [imagemFalhou, setImagemFalhou] = useState(false);
  const [ficha, setFicha] = useState<FichaTecnica | null>(null);

  const buscar = useCallback(() => obterEntrada(categoria, id), [categoria, id]);
  const { dados, carregando, erro, recarregar } = useFetch(buscar);
  const salvo = obter(id);

  useEffect(() => {
    if (!dados) {
      return;
    }
    void gravar(CHAVES.ultima, { nome: dados.name, categoria });
  }, [dados, categoria]);

  useEffect(() => {
    if (!dados) {
      return;
    }
    let vivo = true;
    setFicha(null);
    void complementoSwapi(categoria, dados.name).then((resultado) => {
      if (vivo) {
        setFicha(resultado);
      }
    });
    return () => {
      vivo = false;
    };
  }, [dados, categoria]);

  async function alternarGuarda() {
    if (!dados) {
      return;
    }
    setAviso(null);
    setEnviando(true);
    try {
      if (salvo) {
        await remover(salvo.item_id);
      } else {
        await adicionar({ entrada: dados, categoria });
      }
    } catch (falha) {
      setAviso(falha instanceof Error ? falha.message : 'Não foi possível atualizar o arquivo.');
    } finally {
      setEnviando(false);
    }
  }

  async function abrirEstudo() {
    if (!dados) {
      return;
    }
    setAviso(null);
    setEnviando(true);
    try {
      if (!salvo) {
        await adicionar({ entrada: dados, categoria });
      }
      router.push({ pathname: '/(app)/editar-modal', params: { itemId: dados._id } });
    } catch (falha) {
      setAviso(falha instanceof Error ? falha.message : 'Guarde a entrada antes de anotar.');
    } finally {
      setEnviando(false);
    }
  }

  if (!categoriaValida || !id) {
    return (
      <SafeAreaView style={[estilos.tela, { backgroundColor: tema.fundo }]}>
        <EstadoVazio mensagem="Categoria ou ficha inválida." />
      </SafeAreaView>
    );
  }

  const longa = (dados?.description.length ?? 0) > 280;

  return (
    <SafeAreaView style={[estilos.tela, { backgroundColor: tema.fundo }]} edges={['top', 'left', 'right']}>
      <View style={estilos.topo}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} hitSlop={8}>
          <Text style={[estilos.voltar, { color: tema.tinta }]}>←</Text>
        </Pressable>
        <Text style={[estilos.categoria, { color: tema.tinta }]}>{ROTULO_CATEGORIA[categoria]}</Text>
      </View>

      {carregando ? (
        <ActivityIndicator color={tema.tinta} style={estilos.espera} />
      ) : erro ? (
        <EstadoErro mensagem={erro} onTentar={() => void recarregar()} />
      ) : !dados ? (
        <EstadoVazio mensagem="Essa ficha não está na enciclopédia." />
      ) : (
        <ScrollView contentContainerStyle={estilos.conteudo}>
          <View style={estilos.capa}>
            {dados.image && !imagemFalhou ? (
              <Image
                source={{ uri: dados.image }}
                style={estilos.foto}
                resizeMode="cover"
                onError={() => setImagemFalhou(true)}
              />
            ) : (
              <View style={[estilos.foto, { backgroundColor: tema.tintaSuave }]} />
            )}
            <View style={[estilos.tag, { backgroundColor: tema.fundo, borderColor: tema.tinta }]}>
              <Text style={[estilos.tagTexto, { color: tema.tinta }]}>{ROTULO_CATEGORIA[categoria]}</Text>
            </View>
          </View>
          <Text style={[estilos.nome, { color: tema.texto }]}>{dados.name}</Text>
          {salvo ? (
            <Text style={[estilos.estudo, { color: tema.tinta }]}>
              {salvo.status}  {salvo.progresso}%  nota {salvo.nota}
            </Text>
          ) : null}
          <Text
            style={[estilos.lore, { color: tema.texto }]}
            numberOfLines={aberta || !longa ? undefined : 6}
          >
            {dados.description || 'A enciclopédia não trouxe uma descrição para esta ficha.'}
          </Text>
          {longa ? (
            <Pressable accessibilityRole="button" onPress={() => setAberta((valor) => !valor)}>
              <Text style={[estilos.expandir, { color: tema.tinta }]}>
                {aberta ? 'Recolher a história' : 'Ler a história completa'}
              </Text>
            </Pressable>
          ) : null}
          <Botao
            rotulo={enviando ? 'Atualizando…' : salvo ? 'Remover do Holocron' : 'Guardar no Holocron'}
            onPress={() => void alternarGuarda()}
            desabilitado={enviando}
            secundario={Boolean(salvo)}
          />
          <Botao
            rotulo="Anotações e progresso"
            onPress={() => void abrirEstudo()}
            desabilitado={enviando}
          />
          {aviso ? <Text style={[estilos.aviso, { color: tema.perigo }]}>{aviso}</Text> : null}
          {ficha ? (
            <View style={[estilos.ficha, { borderColor: tema.tintaFraca }]}>
              <Text style={[estilos.fichaTitulo, { color: tema.texto }]}>{ficha.origem}</Text>
              {ficha.linhas.map((linha) => (
                <Text key={linha.rotulo} style={[estilos.fichaLinha, { color: tema.textoSecundario }]}>
                  {linha.rotulo}  <Text style={{ color: tema.texto }}>{linha.valor}</Text>
                </Text>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  voltar: {
    fontFamily: fonte.textoForte,
    fontSize: 26,
    width: 44,
    textAlign: 'center',
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoria: {
    fontFamily: fonte.textoForte,
    fontSize: 16,
  },
  espera: {
    marginTop: 32,
  },
  conteudo: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  capa: {
    height: 220,
  },
  foto: {
    alignSelf: 'stretch',
    height: 220,
  },
  tag: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    zIndex: 2,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagTexto: {
    fontFamily: fonte.textoForte,
    fontSize: 12,
  },
  nome: {
    fontFamily: fonte.titulo,
    fontSize: 32,
  },
  estudo: {
    fontFamily: fonte.mono,
    fontSize: 13,
  },
  lore: {
    fontFamily: fonte.texto,
    fontSize: 18,
    lineHeight: 26,
  },
  expandir: {
    fontFamily: fonte.textoForte,
    fontSize: 16,
  },
  aviso: {
    fontFamily: fonte.texto,
    fontSize: 16,
  },
  ficha: {
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  fichaTitulo: {
    fontFamily: fonte.mono,
    fontSize: 13,
  },
  fichaLinha: {
    fontFamily: fonte.texto,
    fontSize: 16,
  },
});
