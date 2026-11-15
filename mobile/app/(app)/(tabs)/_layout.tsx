import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonte } from '../../../constants/theme';
import { useTema } from '../../../hooks/useTema';
import { Moldura } from '../../../components/Moldura';

interface BarraProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navegar: (routeKey: string) => void;
}

function BarraAbas({ state, navegar }: BarraProps) {
  const tema = useTema();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        estilos.barra,
        {
          backgroundColor: tema.fundo,
          borderTopColor: tema.tintaFraca,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {state.routes.map((rota, indice) => {
        const focado = state.index === indice;
        const enciclopedia = rota.name === 'index';
        const rotulo = enciclopedia ? 'Enciclopédia' : 'Meu Holocron';
        return (
          <Pressable
            key={rota.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focado }}
            accessibilityLabel={rotulo}
            onPress={() => navegar(rota.key)}
            style={estilos.aba}
          >
            <Moldura preenchido={focado} semSombra>
              <View style={estilos.miolo}>
                <Text style={[estilos.rotulo, { color: tema.texto }]} numberOfLines={1}>
                  {rotulo}
                </Text>
              </View>
            </Moldura>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function LayoutAbas() {
  return (
    <Tabs
      tabBar={(props) => <BarraAbas state={props.state} navegar={props.navigateToTab} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Enciclopédia' }} />
      <Tabs.Screen name="meu-holocron" options={{ title: 'Meu Holocron' }} />
    </Tabs>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  aba: {
    flex: 1,
  },
  miolo: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  rotulo: {
    fontFamily: fonte.textoForte,
    fontSize: 14,
  },
});
