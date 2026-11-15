import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BannerOffline, EstadoErro, EstadoVazio } from '../../../components/Estados';
import { Botao } from '../../../components/Botao';
import { CampoTexto } from '../../../components/Campos';
import { CardEntrada } from '../../../components/CardEntrada';
import { PainelEstudo } from '../../../components/PainelEstudo';
import { fonte } from '../../../constants/theme';
import { useHolocron } from '../../../contexts/HolocronContext';
import { useColuna } from '../../../hooks/useColuna';
import { useOnline } from '../../../hooks/useOnline';
import { usePersistedState } from '../../../hooks/usePersistedState';
import { useTema } from '../../../hooks/useTema';
import { CHAVES } from '../../../services/chaves';
import { SeloLado } from '../../../components/SeloLado';
import { COR_DECK, DECKS, ehDeck, ROTULO_DECK, type DeckId, type DeckUsuario } from '../../../types/starwars';
import { Moldura } from '../../../components/Moldura';

type Filtro = 'Todos' | DeckId;

const FILTROS: Filtro[] = ['Todos', ...DECKS];

function ehFiltro(valor: string): valor is Filtro {
  return valor === 'Todos' || ehDeck(valor);
}

function rotuloFiltro(filtro: Filtro): string {
  return filtro === 'Todos' ? 'Todos' : ROTULO_DECK[filtro];
}

function gruposDe(lista: DeckUsuario[]): { faccao: DeckId; itens: DeckUsuario[] }[] {
  return DECKS.map((faccao) => ({
    faccao,
    itens: lista.filter((item) => item.faccao === faccao),
  })).filter((grupo) => grupo.itens.length > 0);
}

export default function MeuHolocron() {
  const tema = useTema();
  const online = useOnline();
  const { arquivos, decks, carregando, erro, recarregar, criarDeck, removerDeck } = useHolocron();
  const coluna = useColuna();
  const [filtroBruto, definirFiltro] = usePersistedState<string>(CHAVES.filtro, 'Todos');
  const filtro: Filtro = ehFiltro(filtroBruto) ? filtroBruto : 'Todos';
  const [atualizando, setAtualizando] = useState(false);
  const [nome, setNome] = useState('');
  const [deckAberto, setDeckAberto] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [formulario, setFormulario] = useState(false);

  const doLado = filtro === 'Todos' ? decks : decks.filter((item) => item.faccao === filtro);
  const grupos = gruposDe(doLado);
  const aberto = doLado.find((item) => item.id === deckAberto) ?? null;
  const mostrarFormulario = formulario || decks.length === 0;

  const visiveis = useMemo(() => {
    if (aberto) {
      return arquivos.filter((item) => item.deck_id === aberto.id);
    }
    if (filtro === 'Todos') {
      return [];
    }
    return arquivos.filter((item) => item.deck === filtro && !item.deck_id);
  }, [aberto, arquivos, filtro]);

  const recente = aberto?.nome ?? arquivos[0]?.nome ?? 'Nenhum deck aberto';
  const totalFiltro = aberto || filtro !== 'Todos' ? visiveis.length : arquivos.length;

  async function atualizar() {
    setAtualizando(true);
    try {
      await recarregar();
    } finally {
      setAtualizando(false);
    }
  }

  async function criar() {
    if (filtro === 'Todos') {
      setAviso('Escolha o lado antes de criar o deck.');
      return;
    }
    setCriando(true);
    setAviso(null);
    try {
      await criarDeck(nome, filtro);
      setNome('');
      setFormulario(false);
    } catch (falha) {
      setAviso(falha instanceof Error ? falha.message : 'Não foi possível criar o deck.');
    } finally {
      setCriando(false);
    }
  }

  async function apagar(id: string) {
    setAviso(null);
    try {
      await removerDeck(id);
      setDeckAberto(null);
    } catch (falha) {
      setAviso(falha instanceof Error ? falha.message : 'Não foi possível apagar o deck.');
    }
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'left', 'right']}>
      <BannerOffline visivel={!online} />
      <FlatList
        style={estilos.lista}
        contentContainerStyle={[estilos.conteudo, coluna]}
        data={carregando ? [] : visiveis}
        keyExtractor={(item) => String(item.item_id)}
        ItemSeparatorComponent={Separador}
        refreshing={atualizando}
        onRefresh={() => {
          void atualizar();
        }}
        ListHeaderComponent={
          <PainelEstudo titulo="Decks" linha={recente} contagem={String(totalFiltro)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.filtros}>
              {FILTROS.map((item) => {
                const ativo = item === filtro;
                const quantidade = item === 'Todos' ? arquivos.length : arquivos.filter((carta) => carta.deck === item).length;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativo }}
                    accessibilityLabel={rotuloFiltro(item)}
                    onPress={() => definirFiltro(item)}
                  >
                    <Moldura preenchido={ativo} semSombra>
                      <View style={estilos.filtroMiolo}>
                        <View style={estilos.filtroCabeca}>
                          {item !== 'Todos' ? (
                            <View style={[estilos.ponto, { backgroundColor: COR_DECK[item] }]} />
                          ) : null}
                          <Text style={[estilos.filtroTexto, { color: tema.texto }]} numberOfLines={1}>
                            {rotuloFiltro(item)}
                          </Text>
                        </View>
                        <Text style={[estilos.filtroNumero, { color: item === 'Todos' ? tema.tinta : COR_DECK[item] }]}>
                          {quantidade}
                        </Text>
                      </View>
                    </Moldura>
                  </Pressable>
                );
              })}
            </ScrollView>
            {decks.length > 0 ? (
              <Botao
                rotulo={formulario ? 'Fechar' : 'Novo deck'}
                onPress={() => setFormulario((atual) => !atual)}
                secundario={formulario}
              />
            ) : null}
            {mostrarFormulario ? (
              <View style={estilos.criar}>
                <Text style={[estilos.dica, { color: tema.textoSecundario }]}>
                  {filtro === 'Todos'
                    ? 'Escolha o lado acima. A carta só entra num deck desse mesmo lado.'
                    : `Este deck só recebe cartas ${ROTULO_DECK[filtro]}.`}
                </Text>
                <CampoTexto rotulo="Nome do deck" valor={nome} onChangeText={setNome} />
                <Botao
                  rotulo={criando ? 'Criando…' : filtro === 'Todos' ? 'Escolha o lado' : 'Criar deck'}
                  onPress={() => void criar()}
                  desabilitado={criando || filtro === 'Todos' || nome.trim().length < 2}
                />
              </View>
            ) : null}
            {grupos.map((grupo) => (
              <View key={grupo.faccao} style={estilos.grupo}>
                <View style={estilos.grupoCabeca}>
                  <View style={[estilos.grupoBarra, { backgroundColor: COR_DECK[grupo.faccao] }]} />
                  <Text style={[estilos.grupoTitulo, { color: COR_DECK[grupo.faccao] }]}>{ROTULO_DECK[grupo.faccao]}</Text>
                </View>
                {grupo.itens.map((item) => {
                  const ativo = item.id === aberto?.id;
                  const quantidade = arquivos.filter((carta) => carta.deck_id === item.id).length;
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: ativo }}
                      accessibilityLabel={`${item.nome}, ${ROTULO_DECK[item.faccao]}, ${quantidade} cartas`}
                      onPress={() => setDeckAberto(ativo ? null : item.id)}
                    >
                      <Moldura preenchido={ativo} semSombra>
                        <View style={[estilos.deckLinha, { borderLeftColor: COR_DECK[item.faccao] }]}>
                          <View style={estilos.deckTexto}>
                            <Text style={[estilos.filtroTexto, { color: tema.texto }]} numberOfLines={1}>
                              {item.nome}
                            </Text>
                            <SeloLado lado={item.faccao} />
                          </View>
                          <Text style={[estilos.filtroNumero, { color: COR_DECK[item.faccao] }]}>
                            {quantidade} {quantidade === 1 ? 'carta' : 'cartas'}
                          </Text>
                        </View>
                      </Moldura>
                    </Pressable>
                  );
                })}
              </View>
            ))}
            {aberto ? (
              <View style={estilos.criar}>
                <Botao rotulo="Buscar cartas na enciclopédia" onPress={() => router.navigate('/(app)/(tabs)')} secundario />
                <Botao
                  rotulo="Apagar deck"
                  onPress={() => void apagar(aberto.id)}
                  secundario
                  desabilitado={arquivos.some((carta) => carta.deck_id === aberto.id)}
                />
                {arquivos.some((carta) => carta.deck_id === aberto.id) ? (
                  <Text style={[estilos.dica, { color: tema.textoSecundario }]}>Tire as cartas antes de apagar o deck.</Text>
                ) : null}
              </View>
            ) : null}
            {aviso ? <Text style={[estilos.dica, { color: tema.perigo }]}>{aviso}</Text> : null}
          </PainelEstudo>
        }
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator color={tema.tinta} style={estilos.espera} />
          ) : erro ? (
            <EstadoErro mensagem={erro} onTentar={() => void recarregar()} />
          ) : !aberto && filtro === 'Todos' && decks.length > 0 ? undefined : (
            <EstadoVazio
              mensagem={
                decks.length === 0
                  ? 'Dê um nome, escolha o lado e crie o primeiro deck.'
                  : aberto
                    ? `Nenhuma carta em ${aberto.nome}. Abra a enciclopédia e toque em Adicionar.`
                    : 'Nenhuma carta solta neste lado.'
              }
            />
          )
        }
        renderItem={({ item }) => (
          <CardEntrada
            nome={item.nome}
            descricao={item.descricao}
            imagem={item.imagem_url}
            categoria={item.categoria}
            deck={item.deck}
            nomeDeck={decks.find((baralho) => baralho.id === item.deck_id)?.nome}
            status={item.status}
            nota={item.nota}
            onPress={() =>
              router.push({
                pathname: '/(app)/entrada/[categoria]/[id]',
                params: { categoria: item.categoria, id: item.item_id },
              })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

function Separador() {
  return <View style={estilos.separador} />;
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  lista: {
    flex: 1,
  },
  conteudo: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  separador: {
    height: 8,
  },
  espera: {
    marginVertical: 24,
  },
  filtros: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  filtroMiolo: {
    minWidth: 112,
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  filtroCabeca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ponto: {
    width: 8,
    height: 8,
  },
  grupo: {
    gap: 8,
  },
  grupoCabeca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  grupoBarra: {
    width: 8,
    height: 16,
  },
  grupoTitulo: {
    fontFamily: fonte.textoForte,
    fontSize: 14,
  },
  filtroTexto: {
    fontFamily: fonte.textoForte,
    fontSize: 14,
  },
  filtroNumero: {
    fontFamily: fonte.mono,
    fontSize: 14,
  },
  deckLinha: {
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
  },
  deckTexto: {
    flex: 1,
    gap: 2,
  },
  dica: {
    fontFamily: fonte.texto,
    fontSize: 16,
  },
  criar: {
    gap: 8,
  },
});
