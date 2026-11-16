import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Audiowide_400Regular } from '@expo-google-fonts/audiowide';
import { Rajdhani_500Medium, Rajdhani_600SemiBold, Rajdhani_700Bold } from '@expo-google-fonts/rajdhani';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ceu } from '../components/Ceu';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { HolocronProvider } from '../contexts/HolocronContext';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Navegacao() {
  const { pronto } = useAuth();
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

  return (
    <Ceu>
      <StatusBar style="light" />
      {visualPronto ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      ) : null}
    </Ceu>
  );
}

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#07090C' }}>
      <AuthProvider>
        <HolocronProvider>
          <Navegacao />
        </HolocronProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}