import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';
import { Gaveta } from '../../components/Gaveta';
import { fonte } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { GavetaProvider } from '../../contexts/GavetaContext';
import { useTema } from '../../hooks/useTema';

export default function LayoutApp() {
  const { usuario, pronto } = useAuth();
  const tema = useTema();

  if (!pronto) {
    return null;
  }

  if (!usuario) {
    return <Redirect href="/login" />;
  }

  return (
    <GavetaProvider>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: tema.fundo },
            headerTintColor: tema.tinta,
            headerTitleStyle: { fontFamily: fonte.textoForte, fontSize: 20, color: tema.texto },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: tema.fundo },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="entrada/[categoria]/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="editar-modal"
            options={{ presentation: 'modal', title: 'Anotações e Progresso' }}
          />
          <Stack.Screen name="sessao" options={{ title: 'Sessão JWT' }} />
          <Stack.Screen name="conflitos" options={{ title: 'Conflitos' }} />
          <Stack.Screen name="principios" options={{ title: 'Interface' }} />
        </Stack>
        <Gaveta />
      </View>
    </GavetaProvider>
  );
}
