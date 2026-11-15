import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonte } from '../constants/theme';
import { useTema } from '../hooks/useTema';

interface Props {
  visivel: boolean;
}

export function BannerOffline({ visivel }: Props) {
  const tema = useTema();
  if (!visivel) {
    return null;
  }

  return (
    <View style={[estilos.faixa, { borderColor: tema.tinta, backgroundColor: tema.tintaSuave }]}>
      <Text style={[estilos.texto, { color: tema.texto }]}>
        Modo Offline — alterações no Holocron serão sincronizadas
      </Text>
    </View>
  );
}

interface ErroProps {
  mensagem: string;
  onTentar: () => void;
}

export function EstadoErro({ mensagem, onTentar }: ErroProps) {
  const tema = useTema();
  return (
    <View style={estilos.caixa}>
      <Text style={[estilos.mensagem, { color: tema.texto }]}>{mensagem}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onTentar}
        style={[estilos.botao, { borderColor: tema.tinta, backgroundColor: tema.tinta }]}
      >
        <Text style={[estilos.botaoTexto, { color: tema.tintaSobre }]}>Tentar novamente</Text>
      </Pressable>
    </View>
  );
}

export function EstadoVazio({ mensagem }: { mensagem: string }) {
  const tema = useTema();
  return (
    <View style={estilos.caixa}>
      <Text style={[estilos.mensagem, { color: tema.textoSecundario }]}>{mensagem}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  faixa: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  texto: {
    fontFamily: fonte.texto,
    fontSize: 14,
    textAlign: 'center',
  },
  caixa: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 16,
  },
  mensagem: {
    fontFamily: fonte.texto,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  botao: {
    minHeight: 48,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: {
    fontFamily: fonte.textoForte,
    fontSize: 16,
  },
});
