import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Botao } from '../../components/Botao';
import { EstadoVazio } from '../../components/Estados';
import { Moldura } from '../../components/Moldura';
import { fonte } from '../../constants/theme';
import { useHolocron } from '../../contexts/HolocronContext';
import { usePersistedState } from '../../hooks/usePersistedState';
import { useTema } from '../../hooks/useTema';
import { CHAVES, ehPolitica, type PoliticaConflito } from '../../services/chaves';

const POLITICAS: { id: PoliticaConflito; rotulo: string }[] = [
  { id: 'manual', rotulo: 'Escolher' },
  { id: 'ultima', rotulo: 'Última escrita' },
  { id: 'mesclar', rotulo: 'Mesclar' },
];

export default function Conflitos() {
  const tema = useTema();
  const { conflitos, resolverConflito } = useHolocron();
  const [politicaBruta, definirPolitica] = usePersistedState<string>(CHAVES.politica, 'manual');
  const politica: PoliticaConflito = ehPolitica(politicaBruta) ? politicaBruta : 'manual';
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function resolver(itemId: string, escolha: 'local' | 'remoto' | 'ultima' | 'mesclar') {
    setErro(null);
    setOcupado(itemId);
    try {
      await resolverConflito(itemId, escolha);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível resolver o conflito.');
    } finally {
      setOcupado(null);
    }
  }

  return (
    <SafeAreaView style={[estilos.tela, { backgroundColor: tema.fundo }]} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <Text style={[estilos.titulo, { color: tema.texto }]}>Conflitos de sincronização</Text>
        <Text style={[estilos.corpo, { color: tema.textoSecundario }]}>
          Quando o arquivo local e o servidor divergem, a política abaixo decide o próximo encontro. Escolher deixa a
          decisão nesta tela. Última escrita fica com o horário mais recente. Mesclar junta anotações e preserva o
          maior progresso.
        </Text>
        <View style={estilos.politicas}>
          {POLITICAS.map((item) => (
            <Botao
              key={item.id}
              rotulo={item.rotulo}
              secundario={politica !== item.id}
              onPress={() => definirPolitica(item.id)}
            />
          ))}
        </View>
        {conflitos.length === 0 ? <EstadoVazio mensagem="Nenhum conflito aberto." /> : null}
        {conflitos.map((item) => (
          <Moldura key={item.itemId}>
            <View style={estilos.card}>
              <Text style={[estilos.nome, { color: tema.texto }]}>{item.nome}</Text>
              <Text style={[estilos.detalhe, { color: tema.textoSecundario }]}>
                Local: {item.local.status}, {item.local.progresso}%, nota {item.local.nota}
              </Text>
              <Text style={[estilos.detalhe, { color: tema.textoSecundario }]}>
                Servidor: {item.remoto.status}, {item.remoto.progresso}%, nota {item.remoto.nota}
              </Text>
              <Botao rotulo="Ficar com o aparelho" onPress={() => void resolver(item.itemId, 'local')} desabilitado={ocupado === item.itemId} />
              <Botao rotulo="Ficar com o servidor" secundario onPress={() => void resolver(item.itemId, 'remoto')} desabilitado={ocupado === item.itemId} />
              <Botao rotulo="Última escrita" secundario onPress={() => void resolver(item.itemId, 'ultima')} desabilitado={ocupado === item.itemId} />
              <Botao rotulo="Mesclar" secundario onPress={() => void resolver(item.itemId, 'mesclar')} desabilitado={ocupado === item.itemId} />
            </View>
          </Moldura>
        ))}
        {erro ? <Text style={[estilos.erro, { color: tema.perigo }]}>{erro}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: 16, gap: 16, paddingBottom: 32 },
  titulo: { fontFamily: fonte.titulo, fontSize: 28 },
  corpo: { fontFamily: fonte.texto, fontSize: 18, lineHeight: 24 },
  politicas: { gap: 8 },
  card: { padding: 16, gap: 8 },
  nome: { fontFamily: fonte.titulo, fontSize: 22 },
  detalhe: { fontFamily: fonte.texto, fontSize: 16 },
  erro: { fontFamily: fonte.texto, fontSize: 16 },
});
