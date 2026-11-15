import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { CampoTexto } from '../../../../components/Campos';
import { EstadoErro, EstadoVazio } from '../../../../components/Estados';
import { fonte } from '../../../../constants/theme';
import { useHolocron } from '../../../../contexts/HolocronContext';
import { useFetch } from '../../../../hooks/useFetch';
import { useTema } from '../../../../hooks/useTema';
import { CHAVES } from '../../../../services/chaves';
import { gravar } from '../../../../services/storage';
import { complementoSwapi, obterEntrada } from '../../../../services/databank';
import { ladoDaCarta } from '../../../../services/lado';
import {
  ehCategoria,
  ROTULO_CATEGORIA,
  ROTULO_DECK,
  type Categoria,
  type FichaTecnica,
} from '../../../../types/starwars';

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
  const { obter, adicionar, atualizar, remover, decks, criarDeck } = useHolocron();
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [imagemFalhou, setImagemFalhou] = useState(false);
  const [ficha, setFicha] = useState<FichaTecnica | null>(null);
  const [nomeDeck, setNomeDeck] = useState('');
  const [criarOutro, setCriarOutro] = useState(false);

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

  const lado = useMemo(
    () => (dados ? ladoDaCarta(`${dados.name}\n${dados.description}`) : null),
    [dados],
  );
  const compativeis = useMemo(
    () => (lado ? decks.filter((item) => item.faccao === lado) : []),
    [decks, lado],
  );
  const deckAtual = decks.find((item) => item.id === salvo?.deck_id) ?? null;

  async function colocar(proximo: string) {
    if (!dados) {
      return;
    }
    setAviso(null);
    setEnviando(true);
    try {
      if (salvo) {
        const baralho = decks.find((item) => item.id === proximo);
        if (!baralho) {
          return;
        }
        await atualizar(salvo.item_id, { deck: baralho.faccao, deck_id: baralho.id });
      } else {
        await adicionar({ entrada: dados, categoria, deckId: proximo });
      }
    } catch (falha) {
      setAviso(falha instanceof Error ? falha.message : 'Não foi possível colocar a carta no deck.');
    } finally {
      setEnviando(false);
    }
  }

  async function criarEAdicionar() {
    if (!dados || !lado) {
      return;
    }
    setAviso(null);
    setEnviando(true);
    try {
      const deck = await criarDeck(nomeDeck, lado);
      if (!salvo) {
        await adicionar({ entrada: dados, categoria, deckId: deck.id });
      } else {
        await atualizar(salvo.item_id, { deck: deck.faccao, deck_id: deck.id });
      }
      setNomeDeck('');
    } catch (falha) {
      setAviso(falha instanceof Error ? falha.message : 'Não foi possível criar o deck.');
    } finally {
      setEnviando(false);
    }
  }

  async function tirar() {
    if (!salvo) {
      return;
    }
    setAviso(null);
    setEnviando(true);
    try {
      await remover(salvo.item_id);
    } catch (falha) {
      setAviso(falha instanceof Error ? falha.message : 'Não foi possível tirar a carta.');
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

  const outros = compativeis.filter((item) => item.id !== deckAtual?.id);

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
          {deckAtual ? (
            <Text style={[estilos.estudo, { color: tema.tinta }]}>
              No deck {deckAtual.nome} · {ROTULO_DECK[deckAtual.faccao]}
            </Text>
          ) : lado ? (
            <Text style={[estilos.estudo, { color: tema.textoSecundario }]}>
              Carta {ROTULO_DECK[lado]}. Toque no deck para colocar.
            </Text>
          ) : (
            <Text style={[estilos.estudo, { color: tema.textoSecundario }]}>
              Esta ficha não tem lado, então não entra em deck.
            </Text>
          )}
          <Text style={[estilos.lore, { color: tema.texto }]}>
            {dados.description || 'A enciclopédia não trouxe uma descrição para esta ficha.'}
          </Text>
          {lado && !deckAtual && compativeis.length > 0
            ? compativeis.map((item) => (
                <Botao
                  key={item.id}
                  rotulo={enviando ? 'Colocando…' : `Adicionar a ${item.nome}`}
                  onPress={() => void colocar(item.id)}
                  desabilitado={enviando}
                />
              ))
            : null}
          {lado && deckAtual
            ? outros.map((item) => (
                <Botao
                  key={item.id}
                  rotulo={enviando ? 'Movendo…' : `Mover para ${item.nome}`}
                  onPress={() => void colocar(item.id)}
                  desabilitado={enviando}
                  secundario
                />
              ))
            : null}
          {lado && (compativeis.length === 0 || criarOutro) ? (
            <View style={estilos.criar}>
              <CampoTexto
                rotulo={`Nome do deck ${ROTULO_DECK[lado]}`}
                valor={nomeDeck}
                onChangeText={setNomeDeck}
              />
              <Botao
                rotulo={enviando ? 'Criando…' : deckAtual ? 'Criar e mover' : 'Criar deck e adicionar'}
                onPress={() => void criarEAdicionar()}
                desabilitado={enviando || nomeDeck.trim().length < 2}
                secundario={compativeis.length > 0}
              />
            </View>
          ) : lado ? (
            <Botao rotulo="Criar outro deck" onPress={() => setCriarOutro(true)} secundario desabilitado={enviando} />
          ) : null}
          {deckAtual ? (
            <Botao rotulo={enviando ? 'Tirando…' : 'Tirar do deck'} onPress={() => void tirar()} desabilitado={enviando} secundario />
          ) : null}
          {aviso ? <Text style={[estilos.aviso, { color: tema.perigo }]}>{aviso}</Text> : null}
          {ficha ? (
            <View style={[estilos.ficha, { borderColor: tema.tintaFraca }]}>
              <Text style={[estilos.fichaTitulo, { color: tema.texto }]}>{ficha.origem}</Text>
              {ficha.linhas.map((linha) => (
                <Text key={`${linha.rotulo}-${linha.valor}`} style={[estilos.fichaLinha, { color: tema.textoSecundario }]}>
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
  criar: {
    gap: 8,
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
