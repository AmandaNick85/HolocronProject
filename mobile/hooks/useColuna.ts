import { useWindowDimensions, type ViewStyle } from 'react-native';

export function useColuna(): ViewStyle {
  const { width } = useWindowDimensions();
  const larga = width >= 720;
  return {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: larga ? 24 : 16,
  };
}
