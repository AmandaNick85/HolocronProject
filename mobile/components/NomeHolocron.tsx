import { StyleSheet, Text } from 'react-native';
import { fonte } from '../constants/theme';
import { useTema } from '../hooks/useTema';

interface Props {
  tamanho?: number;
}

export function NomeHolocron({ tamanho = 28 }: Props) {
  const tema = useTema();

  return (
    <Text
      accessibilityRole="header"
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.72}
      style={[
        estilos.nome,
        {
          color: tema.tinta,
          fontSize: tamanho,
          textShadowColor: tema.tinta,
        },
      ]}
    >
      HOLOCRON
    </Text>
  );
}

const estilos = StyleSheet.create({
  nome: {
    fontFamily: fonte.wordmark,
    letterSpacing: 7,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
