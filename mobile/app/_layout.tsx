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
import { StarryBackground } from '../components/StarryBackground'; // <-- Importe o componente aqui

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
    <StarryBackground>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          // Deixamos 'transparent' para as estrelas aparecerem atrás de todas as telas
          contentStyle: { backgroundColor: 'transparent' }, 
        }}
      />
    </StarryBackground>
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