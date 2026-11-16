import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { useTema } from '../hooks/useTema'; // 1. IMPORTAÇÃO DO SEU HOOK

interface Star {
  id: number;
  top: number;
  left: number;
  size: number;
  opacity: number;
  color: string;
}

const STAR_COLORS = ['#FFFFFF', '#3EC6FF', '#A3D5FF', '#CFE8FF', '#E8F4F8'];

export function StarryBackground({ children }: { children: React.ReactNode }) {
  const { colors } = useTema(); // 2. PUXA AS CORES DO SEU HOOK
  const { width, height } = Dimensions.get('window');
  const twinkleAnim = useRef(new Animated.Value(0.4)).current;

  // Gera posições fixas das estrelas
  const stars = useMemo<Star[]>(() => {
    const count = 75; 
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: Math.random() * Math.max(height, 900),
      left: Math.random() * Math.max(width, 1440),
      size: Math.random() > 0.85 ? 2.5 : Math.random() > 0.5 ? 1.5 : 1,
      opacity: 0.3 + Math.random() * 0.7,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    }));
  }, [width, height]);

  // Efeito sutil de cintilação
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(twinkleAnim, {
          toValue: 0.4,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [twinkleAnim]);

  return (
    {/* 3. APLICANDO A COR DINÂMICA DO TEMA COM UM FALLBACK SE PRECISAR */}
    <View style={[styles.container, { backgroundColor: colors?.background || '#07090C' }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {stars.map((star, index) => {
          const starStyle = {
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: star.color,
          };

          return index % 4 === 0 ? (
            <Animated.View
              key={star.id}
              style={[styles.star, starStyle, { opacity: twinkleAnim }]}
            />
          ) : (
            <View
              key={star.id}
              style={[styles.star, starStyle, { opacity: star.opacity }]}
            />
          );
        })}
      </View>

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Removido o backgroundColor fixo daqui para ser controlado dinamicamente acima
  },
  star: {
    position: 'absolute',
  },
  content: {
    flex: 1,
  },
});
