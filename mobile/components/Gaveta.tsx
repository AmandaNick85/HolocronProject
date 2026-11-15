import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonte } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useGaveta } from '../contexts/GavetaContext';
import { useHolocron } from '../contexts/HolocronContext';
import { useTema } from '../hooks/useTema';
import { exportarArquivo } from '../services/arquivo';

export function Gaveta() {
  const tema = useTema();
  const insets = useSafeAreaInsets();
  const { aberta, fechar } = useGaveta();
  const { sair } = useAuth();
  const { arquivos, conflitos } = useHolocron();
  const [aviso, setAviso] = useState<string | null>(null);

  if (!aberta) {
    return null;
  }

  function ir(caminho: '/sessao' | '/conflitos' | '/principios') {
    fechar();
    router.push(caminho);
  }

  function inicio() {
    fechar();
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace('/(app)/(tabs)');
  }

  async function exportar() {
    setAviso(null);
    try {
      const destino = await exportarArquivo(arquivos);
      setAviso(destino.startsWith('file') ? 'Arquivo gravado no aparelho.' : 'Download iniciado.');
    } catch {
      setAviso('Não foi possível gravar o arquivo.');
    }
  }

  return (
    <View style={estilos.camada}>
      <View
        style={[
          estilos.painel,
          {
            backgroundColor: tema.fundo,
            borderColor: tema.tinta,
            paddingTop: insets.top + 16,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        <Text style={[estilos.titulo, { color: tema.tinta }]}>MENU</Text>
        <Item rotulo="Enciclopédia" onPress={inicio} />
        <Item rotulo="Sessão JWT" onPress={() => ir('/sessao')} />
        <Item rotulo={conflitos.length > 0 ? `Conflitos (${conflitos.length})` : 'Conflitos'} onPress={() => ir('/conflitos')} />
        <Item rotulo="Princípios da interface" onPress={() => ir('/principios')} />
        <Item rotulo="Exportar arquivo" onPress={() => void exportar()} />
        {aviso ? <Text style={[estilos.aviso, { color: tema.textoSecundario }]}>{aviso}</Text> : null}
        <Item
          rotulo="Sair"
          onPress={() => {
            fechar();
            void sair();
          }}
        />
      </View>
      <Pressable accessibilityLabel="Fechar menu" style={estilos.velo} onPress={fechar} />
    </View>
  );
}

function Item({ rotulo, onPress }: { rotulo: string; onPress: () => void }) {
  const tema = useTema();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[estilos.item, { borderColor: tema.tintaFraca }]}>
      <Text style={[estilos.itemTexto, { color: tema.texto }]}>{rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  camada: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    zIndex: 20,
  },
  velo: {
    flex: 1,
    backgroundColor: '#00000088',
  },
  painel: {
    width: 280,
    borderRightWidth: 1,
    paddingHorizontal: 16,
    gap: 8,
  },
  titulo: {
    fontFamily: fonte.wordmark,
    fontSize: 14,
    letterSpacing: 3,
    marginBottom: 8,
  },
  item: {
    minHeight: 48,
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  itemTexto: {
    fontFamily: fonte.textoForte,
    fontSize: 18,
  },
  aviso: {
    fontFamily: fonte.texto,
    fontSize: 14,
  },
});
