import type { DeckId } from '../types/starwars';

const MARCAS: { lado: DeckId; termo: string; peso: number }[] = [
  { lado: 'sith', termo: 'sith', peso: 4 },
  { lado: 'sith', termo: 'darth', peso: 4 },
  { lado: 'jedi', termo: 'jedi', peso: 4 },
  { lado: 'jedi', termo: 'padawan', peso: 3 },
  { lado: 'mandalorianos', termo: 'mandalorian', peso: 4 },
  { lado: 'mandalorianos', termo: 'mandaloriano', peso: 4 },
  { lado: 'cacadores', termo: 'bounty hunter', peso: 4 },
  { lado: 'cacadores', termo: 'caçador de recompensa', peso: 4 },
  { lado: 'separatistas', termo: 'separatist', peso: 4 },
  { lado: 'separatistas', termo: 'separatista', peso: 4 },
  { lado: 'rebeldes', termo: 'rebel alliance', peso: 4 },
  { lado: 'rebeldes', termo: 'aliança rebelde', peso: 4 },
  { lado: 'rebeldes', termo: 'rebel', peso: 2 },
  { lado: 'imperio', termo: 'galactic empire', peso: 4 },
  { lado: 'imperio', termo: 'imperial', peso: 3 },
  { lado: 'imperio', termo: 'empire', peso: 1 },
  { lado: 'imperio', termo: 'império', peso: 3 },
  { lado: 'republica', termo: 'galactic republic', peso: 4 },
  { lado: 'republica', termo: 'república', peso: 3 },
  { lado: 'republica', termo: 'republic', peso: 1 },
];

export function ladoDaCarta(texto: string): DeckId | null {
  const base = texto.toLowerCase();
  const pontos = new Map<string, number>();
  for (const marca of MARCAS) {
    if (!base.includes(marca.termo)) {
      continue;
    }
    pontos.set(marca.lado, (pontos.get(marca.lado) ?? 0) + marca.peso);
  }
  let melhor: DeckId | null = null;
  let maior = 2;
  for (const [lado, peso] of pontos) {
    if (peso > maior) {
      maior = peso;
      melhor = lado as DeckId;
    }
  }
  return melhor;
}
