import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTema } from '../hooks/useTema';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  preenchido?: boolean;
  semSombra?: boolean;
}

export function Moldura({ children, style, preenchido = false, semSombra = false }: Props) {
  const tema = useTema();

  return (
    <View
      style={[
        estilos.externa,
        !semSombra && tema.sombra,
        { borderColor: tema.tinta, backgroundColor: tema.fundo },
        style,
      ]}
    >
      <View
        style={[
          estilos.interna,
          {
            borderColor: tema.tintaFraca,
            backgroundColor: preenchido ? tema.tintaSuave : tema.painel,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  externa: {
    borderWidth: 1,
    padding: 3,
  },
  interna: {
    borderWidth: 1,
  },
});
