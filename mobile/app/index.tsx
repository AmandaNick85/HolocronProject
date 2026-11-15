import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTema } from '../hooks/useTema';

export default function Indice() {
  const { usuario, pronto } = useAuth();
  const tema = useTema();

  if (!pronto) {
    return (
      <View style={estilos.tela}>
        <ActivityIndicator color={tema.tinta} />
      </View>
    );
  }

  return <Redirect href={usuario ? '/(app)/(tabs)' : '/login'} />;
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
