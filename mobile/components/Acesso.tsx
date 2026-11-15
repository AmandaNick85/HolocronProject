import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { comportamentoTeclado } from '../constants/plataforma';
import { fonte } from '../constants/theme';
import { useTema } from '../hooks/useTema';
import { SeletorAlianca } from './SeletorAlianca';

interface Props {
  children: ReactNode;
  rodape: ReactNode;
}

export function Acesso({ children, rodape }: Props) {
  const tema = useTema();

  return (
    <SafeAreaView style={[estilos.tela, { backgroundColor: tema.fundo }]} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={estilos.flex}
        behavior={comportamentoTeclado}
      >
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[estilos.wordmark, { color: tema.tinta }]} accessibilityRole="header">
            HOLOCRON
          </Text>
          <Text style={[estilos.frase, { color: tema.textoSecundario }]}>
            Enciclopédia para estudar a história da galáxia no seu arquivo pessoal.
          </Text>
          <SeletorAlianca />
          <View style={estilos.formulario}>{children}</View>
          {rodape}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  wordmark: {
    fontFamily: fonte.wordmark,
    fontSize: 26,
    letterSpacing: 4,
    textAlign: 'center',
  },
  frase: {
    fontFamily: fonte.texto,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  formulario: {
    gap: 16,
    marginTop: 8,
  },
});
