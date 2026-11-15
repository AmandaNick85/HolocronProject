import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Audiowide_400Regular } from '@expo-google-fonts/audiowide';
import { Rajdhani_500Medium, Rajdhani_600SemiBold, Rajdhani_700Bold } from '@expo-google-fonts/rajdhani';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { HolocronProvider } from '../contexts/HolocronContext';
import { useTema } from '../hooks/useTema';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Navegacao() {
  const { pronto } = useAuth();
  const tema = useTema();
  const [fontes, erroFonte] = useFonts({
    Audiowide_400Regular,
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
    ShareTechMono_400Regular,
  });
  const visualPronto = Boolean(fontes || erroFonte) && pronto;

  useEffect(() => {
    if (visualPronto) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [visualPronto]);

  if (!visualPronto) {
    return null;
  }

  return (
    <>
      <StatusBar style={tema.modo === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: tema.fundo },
        }}
      />
    </>
  );
}

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <HolocronProvider>
          <Navegacao />
        </HolocronProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
