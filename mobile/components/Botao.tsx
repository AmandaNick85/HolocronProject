import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { fonte } from '../constants/theme';
import { useTema } from '../hooks/useTema';

interface Props {
  rotulo: string;
  onPress: () => void;
  desabilitado?: boolean;
  secundario?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Botao({ rotulo, onPress, desabilitado = false, secundario = false, style }: Props) {
  const tema = useTema();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado }}
      disabled={desabilitado}
      onPress={onPress}
      style={[
        estilos.botao,
        tema.sombra,
        {
          backgroundColor: secundario ? 'transparent' : tema.tinta,
          borderColor: tema.tinta,
          opacity: desabilitado ? 0.55 : 1,
        },
        style,
      ]}
    >
      <Text style={[estilos.texto, { color: secundario ? tema.tinta : tema.tintaSobre }]}>{rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    minHeight: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  texto: {
    fontFamily: fonte.textoForte,
    fontSize: 16,
  },
});
