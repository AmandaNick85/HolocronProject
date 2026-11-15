import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonte } from '../constants/theme';
import { useTema } from '../hooks/useTema';
import { COR_DECK, type DeckUsuario } from '../types/starwars';
import { Moldura } from './Moldura';

interface Props {
  decks: DeckUsuario[];
  ativo: string | null;
  onMudar: (deckId: string) => void;
}

export function SeletorDeck({ decks, ativo, onMudar }: Props) {
  const tema = useTema();

  return (
    <View style={estilos.grade}>
      {decks.map((deck) => {
        const escolhido = deck.id === ativo;
        return (
          <Pressable
            key={deck.id}
            accessibilityRole="button"
            accessibilityState={{ selected: escolhido }}
            accessibilityLabel={deck.nome}
            onPress={() => onMudar(deck.id)}
            style={estilos.celula}
          >
            <Moldura preenchido={escolhido} semSombra>
              <View style={[estilos.miolo, { borderLeftColor: COR_DECK[deck.faccao] }]}>
                <Text style={[estilos.nome, { color: escolhido ? COR_DECK[deck.faccao] : tema.texto }]} numberOfLines={2}>
                  {deck.nome}
                </Text>
              </View>
            </Moldura>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  celula: {
    flexGrow: 1,
    flexBasis: 140,
  },
  miolo: {
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderLeftWidth: 4,
  },
  nome: {
    fontFamily: fonte.textoForte,
    fontSize: 16,
  },
});
