import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonte } from '../../constants/theme';
import { useTema } from '../../hooks/useTema';

const BLOCOS = [
  {
    titulo: 'Hierarquia',
    texto: 'O wordmark identifica o datapad. O medidor mostra o domínio médio. O nome da categoria, a última ficha e a contagem vêm em seguida. A busca e as categorias ficam antes da lista.',
  },
  {
    titulo: 'Uma ação por tela',
    texto: 'A enciclopédia serve para achar. A ficha serve para ler. O modal serve para anotar, notar e avançar 25%. O menu lateral guarda sessão, conflitos e saída.',
  },
  {
    titulo: 'Quatro estados',
    texto: 'Toda lista passa por carregando, erro com nova tentativa, vazio com orientação, ou sucesso. Sem rede, a faixa avisa que a alteração fica na fila.',
  },
  {
    titulo: 'Toque e leitura',
    texto: 'Alvos de toque têm pelo menos 44 pontos. O texto longo corta com reticências. A tinta azul, verde ou vermelho muda o acento sem trocar a estrutura.',
  },
];

export default function Principios() {
  const tema = useTema();

  return (
    <SafeAreaView style={[estilos.tela, { backgroundColor: tema.fundo }]} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <Text style={[estilos.titulo, { color: tema.texto }]}>Interface</Text>
        {BLOCOS.map((bloco) => (
          <Text key={bloco.titulo} style={estilos.bloco}>
            <Text style={[estilos.rotulo, { color: tema.tinta }]}>{bloco.titulo}. </Text>
            <Text style={[estilos.corpo, { color: tema.textoSecundario }]}>{bloco.texto}</Text>
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: 16, gap: 16, paddingBottom: 32 },
  titulo: { fontFamily: fonte.titulo, fontSize: 28 },
  bloco: { lineHeight: 24 },
  rotulo: { fontFamily: fonte.textoForte, fontSize: 18 },
  corpo: { fontFamily: fonte.texto, fontSize: 18 },
});
