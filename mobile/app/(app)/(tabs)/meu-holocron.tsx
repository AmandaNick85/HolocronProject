import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BannerOffline, EstadoErro, EstadoVazio } from '../../../components/Estados';
import { CardEntrada } from '../../../components/CardEntrada';
import { PainelEstudo } from '../../../components/PainelEstudo';
import { fonte } from '../../../constants/theme';
import { useHolocron } from '../../../contexts/HolocronContext';
import { useColuna } from '../../../hooks/useColuna';
import { useOnline } from '../../../hooks/useOnline';
import { usePersistedState } from '../../../hooks/usePersistedState';
import { useTema } from '../../../hooks/useTema';
import { CHAVES } from '../../../services/chaves';
import { STATUS_ESTUDO, type StatusEstudo } from '../../../types/starwars';
import { Moldura } from '../../../components/Moldura';

type Filtro = 'Todos' | StatusEstudo;

const FILTROS: Filtro[] = ['Todos', ...STATUS_ESTUDO];

function ehFiltro(valor: string): valor is Filtro {
  return valor === 'Todos' || (STATUS_ESTUDO as readonly string[]).includes(valor);
}

export default function MeuHolocron() {
  const tema = useTema();
  const online = useOnline();
  const { arquivos, carregando, erro, recarregar, dominioMedio, contagem } = useHolocron();
  const coluna = useColuna();
  const [filtroBruto, definirFiltro] = usePersistedState<string>(CHAVES.filtro, 'Todos');
  const filtro: Filtro = ehFiltro(filtroBruto) ? filtroBruto : 'Todos';
  const [atualizando, setAtualizando] = useState(false);

  const visiveis = useMemo(
    () => (filtro === 'Todos' ? arquivos : arquivos.filter((item) => item.status === filtro)),
    [arquivos, filtro],
  );

  const recente = arquivos[0]?.nome ?? 'Nenhuma entrada guardada';
  const totalFiltro = filtro === 'Todos' ? arquivos.length : contagem[filtro];

  async function atualizar() {
    setAtualizando(true);
    try {
      await recarregar();
    } finally {
      setAtualizando(false);
    }
  }

  return (
    <SafeAreaView style={[estilos.tela, { backgroundColor: tema.fundo }]} edges={['top', 'left', 'right']}>
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
          <PainelEstudo titulo="Arquivo" linha={recente} contagem={String(totalFiltro)} dominio={dominioMedio}>
            <View style={estilos.filtros}>
              {FILTROS.map((item) => {
                const ativo = item === filtro;
                const quantidade = item === 'Todos' ? arquivos.length : contagem[item];
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativo }}
                    onPress={() => definirFiltro(item)}
                    style={estilos.filtro}
                  >
                    <Moldura preenchido={ativo} semSombra>
                      <View style={estilos.filtroMiolo}>
                        <Text style={[estilos.filtroTexto, { color: tema.texto }]} numberOfLines={1}>
                          {item}
                        </Text>
                        <Text style={[estilos.filtroNumero, { color: tema.tinta }]}>{quantidade}</Text>
                      </View>
                    </Moldura>
                  </Pressable>
                );
              })}
            </View>
          </PainelEstudo>
        }
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator color={tema.tinta} style={estilos.espera} />
          ) : erro ? (
            <EstadoErro mensagem={erro} onTentar={() => void recarregar()} />
          ) : (
            <EstadoVazio
              mensagem={
                arquivos.length === 0
                  ? 'Seu arquivo ainda está vazio. Abra uma entrada na enciclopédia e guarde para estudar.'
                  : 'Nada com esse status no arquivo.'
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
            status={item.status}
            progresso={item.progresso}
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
    flexWrap: 'wrap',
    gap: 8,
  },
  filtro: {
    flexGrow: 1,
    flexBasis: 140,
  },
  filtroMiolo: {
    minHeight: 56,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 2,
  },
  filtroTexto: {
    fontFamily: fonte.textoForte,
    fontSize: 14,
  },
  filtroNumero: {
    fontFamily: fonte.mono,
    fontSize: 14,
  },
});
