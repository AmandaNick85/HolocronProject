import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTema } from '../hooks/useTema';
import { Lua } from './Lua';

interface Estrela {
  id: number;
  x: number;
  y: number;
  tamanho: number;
  opacidade: number;
  halo: boolean;
}

function campo(quantidade: number): Estrela[] {
  let estado = 0x9e3779b9;
  const proximo = () => {
    estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0;
    return estado / 4294967296;
  };
  return Array.from({ length: quantidade }, (_, id) => {
    const sorteio = proximo();
    const destaque = sorteio > 0.9;
    return {
      id,
      x: proximo() * 100,
      y: proximo() * 100,
      tamanho: destaque ? 5 : sorteio > 0.72 ? 3.5 : 2.5,
      opacidade: destaque ? 1 : 0.5 + sorteio * 0.35,
      halo: destaque,
    };
  });
}

const ESTRELAS = campo(72);

export function Ceu({ children }: { children: ReactNode }) {
  const tema = useTema();
  const claro = tema.modo === 'light';

  return (
    <View style={[estilos.raiz, { backgroundColor: tema.fundo }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {ESTRELAS.map((estrela) => {
          const cor = claro ? '#1A2430' : '#F7FBFF';
          const opacidade = claro ? Math.min(1, estrela.opacidade + 0.15) : estrela.opacidade;
          return (
            <View
              key={estrela.id}
              style={{
                position: 'absolute',
                left: `${estrela.x}%`,
                top: `${estrela.y}%`,
                width: estrela.tamanho,
                height: estrela.tamanho,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {estrela.halo ? (
                <View
                  style={{
                    position: 'absolute',
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: cor,
                    opacity: claro ? 0.2 : 0.32,
                  }}
                />
              ) : null}
              <View
                style={{
                  width: estrela.tamanho,
                  height: estrela.tamanho,
                  borderRadius: estrela.tamanho,
                  backgroundColor: cor,
                  opacity: opacidade,
                }}
              />
            </View>
          );
        })}
        <Lua />
      </View>
      <View style={estilos.conteudo}>{children}</View>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  conteudo: {
    flex: 1,
  },
});
