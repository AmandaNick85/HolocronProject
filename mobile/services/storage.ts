import AsyncStorage from '@react-native-async-storage/async-storage';

export async function ler<T>(chave: string): Promise<T | null> {
  try {
    const bruto = await AsyncStorage.getItem(chave);
    if (bruto === null) {
      return null;
    }
    return JSON.parse(bruto) as T;
  } catch {
    return null;
  }
}

export async function gravar<T>(chave: string, valor: T): Promise<void> {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Preferência de interface não pode derrubar a tela.
  }
}

export async function apagar(chave: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(chave);
  } catch {
    // A limpeza segue mesmo se a chave já não existir.
  }
}

export async function apagarVarias(chaves: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(chaves);
  } catch {
    // Mesmo motivo de `apagar`.
  }
}
