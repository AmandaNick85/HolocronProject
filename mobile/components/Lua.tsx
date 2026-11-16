import { Image, StyleSheet, View } from 'react-native';

export function Lua() {
  return (
    <View style={estilos.lugar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Image source={require('../assets/lua.jpg')} style={estilos.foto} resizeMode="cover" />
    </View>
  );
}

const estilos = StyleSheet.create({
  lugar: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
  },
  foto: {
    width: 320,
    height: 320,
    marginLeft: -50,
    marginTop: -50,
  },
});
