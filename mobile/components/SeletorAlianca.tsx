import { Pressable, StyleSheet, View } from 'react-native';
import { ALIANCAS, ROTULO_ALIANCA, type Alianca } from '../constants/theme';
import { useTema } from '../hooks/useTema';

const AMOSTRA: Record<Alianca, string> = {
  azul: '#3EC6FF',
  verde: '#3DFF8F',
  vermelho: '#FF5A5A',
};

export function SeletorAlianca() {
  const tema = useTema();

  return (
    <View style={estilos.fila}>
      {ALIANCAS.map((alianca) => {
        const ativa = tema.alianca === alianca;
        return (
          <Pressable
            key={alianca}
            accessibilityRole="button"
            accessibilityLabel={`Tinta ${ROTULO_ALIANCA[alianca]}`}
            accessibilityState={{ selected: ativa }}
            onPress={() => tema.definirAlianca(alianca)}
            hitSlop={8}
            style={[
              estilos.amostra,
              {
                backgroundColor: AMOSTRA[alianca],
                borderColor: ativa ? tema.texto : 'transparent',
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  amostra: {
    width: 22,
    height: 22,
    borderWidth: 2,
  },
});
