import { StyleSheet, Text, View } from 'react-native';
import { fonte } from '../constants/theme';
import { COR_DECK, ROTULO_DECK, type DeckId } from '../types/starwars';

interface Props {
  lado: DeckId;
  detalhe?: string;
}

export function SeloLado({ lado, detalhe }: Props) {
  const cor = COR_DECK[lado];
  const rotulo = detalhe ? `${ROTULO_DECK[lado]} · ${detalhe}` : ROTULO_DECK[lado];

  return (
    <View style={[estilos.selo, { borderColor: cor }]} accessibilityRole="text" accessibilityLabel={rotulo}>
      <View style={[estilos.marca, { backgroundColor: cor }]} />
      <Text style={[estilos.texto, { color: cor }]} numberOfLines={1}>
        {rotulo}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  selo: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingRight: 8,
    maxWidth: '100%',
  },
  marca: {
    width: 8,
    alignSelf: 'stretch',
  },
  texto: {
    fontFamily: fonte.textoForte,
    fontSize: 12,
    paddingVertical: 4,
  },
});
