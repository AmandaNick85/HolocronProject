import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, View } from 'react-native';

const QUADROS = [
  require('../assets/nave-chama-0.png'),
  require('../assets/nave-chama-1.png'),
  require('../assets/nave-chama-2.png'),
];
const PULSO = [2, 0, 1, 0];

const ALTURA = 48;
const LARGURA = Math.round(ALTURA * (328 / 217));

export function NavePassagem() {
  const deslocamento = useRef(new Animated.Value(-LARGURA)).current;
  const [passo, setPasso] = useState(0);

  useEffect(() => {
    const pulso = setInterval(() => setPasso((atual) => (atual + 1) % PULSO.length), 120);
    return () => clearInterval(pulso);
  }, []);

  useEffect(() => {
    const destino = Dimensions.get('window').width;
    let viva = true;

    const cruzar = () => {
      deslocamento.setValue(-LARGURA);
      Animated.timing(deslocamento, {
        toValue: destino,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (viva && finished) {
          cruzar();
        }
      });
    };

    cruzar();
    return () => {
      viva = false;
      deslocamento.stopAnimation();
    };
  }, [deslocamento]);

  return (
    <View style={estilos.faixa} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[estilos.voo, { left: deslocamento }]}>
        <Image source={QUADROS[PULSO[passo]]} style={estilos.nave} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const estilos = StyleSheet.create({
  faixa: {
    height: ALTURA + 4,
    marginHorizontal: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  voo: {
    position: 'absolute',
    top: 2,
  },
  nave: {
    width: LARGURA,
    height: ALTURA,
  },
});
