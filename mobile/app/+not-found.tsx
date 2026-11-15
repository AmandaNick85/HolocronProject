import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonte } from '../constants/theme';
import { useTema } from '../hooks/useTema';
import { Moldura } from '../components/Moldura';

export default function NaoEncontrada() {
  const tema = useTema();

  return (
    <SafeAreaView style={estilos.tela}>
      <Stack.Screen options={{ headerShown: false }} />
      <Moldura>
        <View style={estilos.miolo}>
          <Text style={[estilos.titulo, { color: tema.texto }]}>Essa rota não existe</Text>
          <Text style={[estilos.texto, { color: tema.textoSecundario }]}>
            A ficha que você pediu não está neste Holocron.
          </Text>
          <Link href="/(app)/(tabs)" style={[estilos.link, { color: tema.tinta }]}>
            Voltar à enciclopédia
          </Link>
        </View>
      </Moldura>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  miolo: {
    padding: 16,
    gap: 8,
  },
  titulo: {
    fontFamily: fonte.titulo,
    fontSize: 28,
  },
  texto: {
    fontFamily: fonte.texto,
    fontSize: 18,
    lineHeight: 24,
  },
  link: {
    fontFamily: fonte.textoForte,
    fontSize: 16,
    marginTop: 8,
  },
});
