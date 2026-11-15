import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonte } from '../constants/theme';
import { useGaveta } from '../contexts/GavetaContext';
import { useTema } from '../hooks/useTema';
import { Medidor } from './Medidor';
import { SeletorAlianca } from './SeletorAlianca';

interface Props {
  titulo: string;
  linha: string;
  contagem: string;
  dominio: number;
  children?: ReactNode;
}

export function PainelEstudo({ titulo, linha, contagem, dominio, children }: Props) {
  const tema = useTema();
  const { abrir } = useGaveta();

  return (
    <View style={estilos.bloco}>
      <View style={estilos.topo}>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir menu" onPress={abrir} style={estilos.menu}>
          <Text style={[estilos.marca, { color: tema.tinta }]}>≡</Text>
        </Pressable>
        <Text style={[estilos.wordmark, { color: tema.tinta }]} accessibilityRole="header">
          HOLOCRON
        </Text>
        <View style={estilos.menu} />
      </View>
      <SeletorAlianca />
      <View style={estilos.linha}>
        <Medidor valor={dominio} />
        <View style={estilos.texto}>
          <Text
            style={[estilos.titulo, { color: tema.texto }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {titulo}
          </Text>
          <Text style={[estilos.subtitulo, { color: tema.textoSecundario }]} numberOfLines={1}>
            {linha}
          </Text>
          <Text style={[estilos.contagem, { color: tema.tinta }]}>{contagem}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  bloco: {
    gap: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menu: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marca: {
    fontFamily: fonte.textoForte,
    fontSize: 22,
  },
  wordmark: {
    flex: 1,
    fontFamily: fonte.wordmark,
    fontSize: 22,
    letterSpacing: 4,
    textAlign: 'center',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  texto: {
    flex: 1,
    gap: 4,
  },
  titulo: {
    fontFamily: fonte.titulo,
    fontSize: 28,
  },
  subtitulo: {
    fontFamily: fonte.texto,
    fontSize: 16,
  },
  contagem: {
    fontFamily: fonte.mono,
    fontSize: 14,
    marginTop: 4,
  },
});
