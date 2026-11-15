import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { fonte } from '../constants/theme';
import { useTema } from '../hooks/useTema';

interface Props {
  valor: number;
  tamanho?: number;
}

export function Medidor({ valor, tamanho = 112 }: Props) {
  const tema = useTema();
  const limite = Math.max(0, Math.min(100, valor));
  const animacao = useRef(new Animated.Value(limite)).current;
  const [mostrado, setMostrado] = useState(limite);
  const centro = tamanho / 2;
  const raio = centro - 8;
  const volta = 2 * Math.PI * raio;
  const deslocamento = volta * (1 - mostrado / 100);
  const numero = tamanho > 140 ? 40 : 26;

  useEffect(() => {
    const id = animacao.addListener(({ value }) => {
      setMostrado(Math.round(value));
    });
    return () => {
      animacao.removeListener(id);
    };
  }, [animacao]);

  useEffect(() => {
    Animated.timing(animacao, {
      toValue: limite,
      duration: 700,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [animacao, limite]);

  return (
    <View style={{ width: tamanho, height: tamanho }} accessibilityLabel={`Domínio médio ${limite}%`}>
      <Svg width={tamanho} height={tamanho}>
        <G rotation={-90} originX={centro} originY={centro}>
          <Circle cx={centro} cy={centro} r={raio} stroke={tema.tintaFraca} strokeWidth={3} fill="transparent" />
          <Circle
            cx={centro}
            cy={centro}
            r={raio}
            stroke={tema.tinta}
            strokeWidth={3}
            fill="transparent"
            strokeDasharray={`${volta} ${volta}`}
            strokeDashoffset={deslocamento}
          />
        </G>
      </Svg>
      <View style={estilos.centro} pointerEvents="none">
        <Text style={[estilos.numero, { color: tema.texto, fontSize: numero }]}>{mostrado}%</Text>
        <Text style={[estilos.legenda, { color: tema.textoSecundario }]}>domínio</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: {
    fontFamily: fonte.mono,
  },
  legenda: {
    fontFamily: fonte.texto,
    fontSize: 13,
    marginTop: -2,
  },
});
