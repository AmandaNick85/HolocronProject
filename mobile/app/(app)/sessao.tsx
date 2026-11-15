import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Botao } from '../../components/Botao';
import { fonte } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useColuna } from '../../hooks/useColuna';
import { useTema } from '../../hooks/useTema';

function data(expiraEm: number | null): string {
  if (!expiraEm) {
    return 'sem expiração no payload';
  }
  return new Date(expiraEm * 1000).toLocaleString('pt-BR');
}

export default function Sessao() {
  const tema = useTema();
  const coluna = useColuna();
  const { usuario, claims } = useAuth();

  return (
    <SafeAreaView style={[estilos.tela, { backgroundColor: tema.fundo }]} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={[estilos.conteudo, coluna]}>
        <Text style={[estilos.titulo, { color: tema.texto }]}>Sessão JWT</Text>
        <Text style={[estilos.corpo, { color: tema.textoSecundario }]}>
          O login envia e-mail e senha uma vez. O servidor devolve um token HS256. O aplicativo guarda esse token no
          Secure Store e o envia em Authorization: Bearer nas rotas do arquivo pessoal. O valor completo não aparece
          nesta tela.
        </Text>
        <Linha rotulo="Conta" valor={usuario?.nome ?? '—'} />
        <Linha rotulo="E-mail" valor={usuario?.email ?? '—'} />
        <Linha rotulo="Algoritmo" valor={claims?.algoritmo ?? '—'} />
        <Linha rotulo="userId" valor={claims?.userId ?? '—'} />
        <Linha rotulo="Expira" valor={data(claims?.expiraEm ?? null)} />
        <View style={estilos.acoes}>
          <Botao
            rotulo="Voltar à enciclopédia"
            onPress={() => {
              if (router.canDismiss()) {
                router.dismissAll();
              }
              router.replace('/(app)/(tabs)');
            }}
          />
          <Botao rotulo="Fechar" secundario onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  const tema = useTema();
  return (
    <View style={[estilos.linha, { borderColor: tema.tintaFraca }]}>
      <Text style={[estilos.rotulo, { color: tema.textoSecundario }]}>{rotulo}</Text>
      <Text style={[estilos.valor, { color: tema.texto }]}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { gap: 16, paddingVertical: 16 },
  titulo: { fontFamily: fonte.titulo, fontSize: 28 },
  corpo: { fontFamily: fonte.texto, fontSize: 18, lineHeight: 24 },
  linha: { borderBottomWidth: 1, paddingBottom: 8, gap: 4 },
  rotulo: { fontFamily: fonte.textoForte, fontSize: 14 },
  valor: { fontFamily: fonte.mono, fontSize: 14 },
  acoes: { gap: 8, marginTop: 8 },
});
