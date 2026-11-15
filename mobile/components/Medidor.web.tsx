import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type ViewStyle } from 'react-native';
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
    <View
      accessibilityLabel={`Domínio médio ${limite}%`}
      style={[
        estilos.anel,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: centro,
          backgroundImage: `conic-gradient(from -90deg, ${tema.tinta} ${mostrado}%, ${tema.tintaFraca} ${mostrado}%)`,
        } as ViewStyle,
      ]}
    >
      <View
        style={[
          estilos.miolo,
          {
            width: tamanho - 16,
            height: tamanho - 16,
            borderRadius: centro,
            backgroundColor: tema.fundo,
          },
        ]}
      >
        <Text style={[estilos.numero, { color: tema.texto, fontSize: numero }]}>{mostrado}%</Text>
        <Text style={[estilos.legenda, { color: tema.textoSecundario }]}>domínio</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  anel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  miolo: {
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
