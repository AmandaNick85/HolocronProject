import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHAVES, CHAVES_LEGADAS } from './chaves';

export async function migrarArmazenamento(): Promise<void> {
  const pares = Object.entries(CHAVES_LEGADAS);
  await Promise.all(
    pares.map(async ([nova, antiga]) => {
      const atual = await AsyncStorage.getItem(nova);
      if (atual !== null) {
        return;
      }
      const legado = await AsyncStorage.getItem(antiga);
      if (legado === null) {
        return;
      }
      await AsyncStorage.setItem(nova, legado);
      await AsyncStorage.removeItem(antiga);
    }),
  );

  const todas = await AsyncStorage.getAllKeys();
  await Promise.all(
    todas
      .filter((chave) => chave.startsWith('holocron_cache_'))
      .map(async (antiga) => {
        const nova = `${CHAVES.cache}${antiga.slice('holocron_cache_'.length)}`;
        const atual = await AsyncStorage.getItem(nova);
        if (atual !== null) {
          return;
        }
        const legado = await AsyncStorage.getItem(antiga);
        if (legado === null) {
          return;
        }
        await AsyncStorage.setItem(nova, legado);
        await AsyncStorage.removeItem(antiga);
      }),
  );
}
