import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { fonte } from '../constants/theme';
import { useTema } from '../hooks/useTema';
import { ROTULO_CATEGORIA, type Categoria, type StatusEstudo } from '../types/starwars';
import { Moldura } from './Moldura';

interface Props {
  nome: string;
  descricao: string;
  imagem: string;
  categoria: Categoria;
  status?: StatusEstudo;
  progresso?: number;
  nota?: number;
  onPress: () => void;
}

export function CardEntrada({ nome, descricao, imagem, categoria, status, progresso, nota, onPress }: Props) {
  const tema = useTema();
  const [imagemFalhou, setImagemFalhou] = useState(false);
  const mostrarFoto = Boolean(imagem) && !imagemFalhou;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={nome} onPress={onPress}>
      <Moldura>
        <View style={estilos.linha}>
          <View style={estilos.capa}>
            {mostrarFoto ? (
              <Image source={{ uri: imagem }} style={estilos.foto} resizeMode="cover" onError={() => setImagemFalhou(true)} />
            ) : (
              <View style={[estilos.foto, estilos.monograma, { backgroundColor: tema.tintaSuave }]}>
                <Text style={[estilos.letra, { color: tema.tinta }]}>{nome.slice(0, 1).toUpperCase()}</Text>
              </View>
            )}
            <View style={[estilos.tag, { backgroundColor: tema.fundo, borderColor: tema.tinta }]}>
              <Text style={[estilos.tagTexto, { color: tema.tinta }]} numberOfLines={1}>
                {ROTULO_CATEGORIA[categoria]}
              </Text>
            </View>
            {typeof nota === 'number' && nota > 0 ? (
              <View style={[estilos.nota, { backgroundColor: tema.fundo, borderColor: tema.tinta }]}>
                <Text style={[estilos.notaTexto, { color: tema.texto }]}>{nota}</Text>
              </View>
            ) : null}
          </View>
          <View style={estilos.corpo}>
            <Text style={[estilos.nome, { color: tema.texto }]} numberOfLines={2}>
              {nome}
            </Text>
            <Text style={[estilos.resumo, { color: tema.textoSecundario }]} numberOfLines={2}>
              {descricao || 'Sem descrição nesta ficha.'}
            </Text>
            {status ? (
              <Text style={[estilos.estudo, { color: tema.tinta }]} numberOfLines={1}>
                {status}
                {typeof progresso === 'number' ? `  ${progresso}%` : ''}
              </Text>
            ) : null}
          </View>
        </View>
      </Moldura>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  capa: {
    width: 96,
    height: 96,
  },
  foto: {
    width: 96,
    height: 96,
  },
  monograma: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letra: {
    fontFamily: fonte.titulo,
    fontSize: 32,
  },
  tag: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    zIndex: 2,
    borderWidth: 1,
    paddingHorizontal: 4,
    maxWidth: 88,
  },
  tagTexto: {
    fontFamily: fonte.textoForte,
    fontSize: 10,
  },
  nota: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 2,
    borderWidth: 1,
    minWidth: 22,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notaTexto: {
    fontFamily: fonte.mono,
    fontSize: 12,
  },
  corpo: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  nome: {
    fontFamily: fonte.titulo,
    fontSize: 18,
  },
  resumo: {
    fontFamily: fonte.texto,
    fontSize: 15,
    lineHeight: 20,
  },
  estudo: {
    fontFamily: fonte.mono,
    fontSize: 12,
    marginTop: 4,
  },
});
