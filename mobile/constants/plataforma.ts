import { Platform, type KeyboardAvoidingViewProps } from 'react-native';

export const comportamentoTeclado: KeyboardAvoidingViewProps['behavior'] = Platform.select({
  ios: 'padding',
  android: 'height',
  default: undefined,
});
