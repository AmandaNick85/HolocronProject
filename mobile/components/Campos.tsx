import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { fonte } from '../constants/theme';
import { useTema } from '../hooks/useTema';
import { Moldura } from './Moldura';

interface CampoProps {
  rotulo: string;
  valor: string;
  onChangeText: (valor: string) => void;
  seguro?: boolean;
  teclado?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  multiline?: boolean;
}

export function CampoTexto({
  rotulo,
  valor,
  onChangeText,
  seguro = false,
  teclado = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
}: CampoProps) {
  const tema = useTema();
  const [focado, setFocado] = useState(false);

  return (
    <View style={estilos.grupo}>
      <Text style={[estilos.rotulo, { color: tema.textoSecundario }]}>{rotulo}</Text>
      <View style={[estilos.borda, { borderColor: focado ? tema.tinta : tema.tintaFraca, backgroundColor: tema.painel }]}>
        <TextInput
          value={valor}
          onChangeText={onChangeText}
          secureTextEntry={seguro}
          keyboardType={teclado}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          multiline={multiline}
          accessibilityLabel={rotulo}
          placeholder={rotulo}
          placeholderTextColor={tema.textoSecundario}
          selectionColor={tema.tinta}
          cursorColor={tema.tinta}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          style={[estilos.input, multiline && estilos.multilinha, { color: tema.texto }]}
        />
      </View>
    </View>
  );
}

interface BuscaProps {
  valor: string;
  onChangeText: (valor: string) => void;
}

export function CampoBusca({ valor, onChangeText }: BuscaProps) {
  const tema = useTema();
  const [focado, setFocado] = useState(false);

  return (
    <Moldura semSombra>
      <View style={[estilos.busca, { borderColor: focado ? tema.tinta : 'transparent' }]}>
        <Text style={[estilos.marca, { color: tema.tinta }]}>⌕</Text>
        <TextInput
          value={valor}
          onChangeText={onChangeText}
          placeholder="Buscar nesta categoria"
          placeholderTextColor={tema.textoSecundario}
          accessibilityLabel="Buscar nesta categoria"
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={tema.tinta}
          cursorColor={tema.tinta}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          style={[estilos.inputBusca, { color: tema.texto }]}
        />
        {valor.length > 0 ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => onChangeText('')} hitSlop={8}>
            <Text style={[estilos.marca, { color: tema.tinta }]}>×</Text>
          </Pressable>
        ) : null}
      </View>
    </Moldura>
  );
}

const estilos = StyleSheet.create({
  grupo: {
    gap: 8,
  },
  rotulo: {
    fontFamily: fonte.textoForte,
    fontSize: 14,
  },
  borda: {
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  input: {
    fontFamily: fonte.texto,
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  multilinha: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    minHeight: 44,
    borderWidth: 1,
  },
  marca: {
    fontFamily: fonte.textoForte,
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  inputBusca: {
    flex: 1,
    fontFamily: fonte.texto,
    fontSize: 18,
    paddingVertical: 8,
  },
});
