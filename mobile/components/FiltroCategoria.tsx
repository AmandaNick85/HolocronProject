import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fonte } from '../constants/theme';
import { useTema } from '../hooks/useTema';
import { CATEGORIAS, ROTULO_CATEGORIA, type Categoria } from '../types/starwars';
import { Moldura } from './Moldura';

interface Props {
  ativa: Categoria;
  onMudar: (categoria: Categoria) => void;
}

export function FiltroCategoria({ ativa, onMudar }: Props) {
  const tema = useTema();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.faixa}>
      {CATEGORIAS.map((categoria) => {
        const selecionada = categoria === ativa;
        return (
          <Pressable
            key={categoria}
            accessibilityRole="button"
            accessibilityState={{ selected: selecionada }}
            accessibilityLabel={ROTULO_CATEGORIA[categoria]}
            onPress={() => onMudar(categoria)}
          >
            <Moldura preenchido={selecionada} semSombra style={estilos.modulo}>
              <View style={estilos.miolo}>
                <Text style={[estilos.rotulo, { color: selecionada ? tema.tinta : tema.texto }]} numberOfLines={1}>
                  {ROTULO_CATEGORIA[categoria]}
                </Text>
              </View>
            </Moldura>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  faixa: {
    gap: 8,
    paddingVertical: 4,
  },
  modulo: {
    width: 104,
  },
  miolo: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
  },
  rotulo: {
    fontFamily: fonte.textoForte,
    fontSize: 13,
    textAlign: 'center',
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
});
