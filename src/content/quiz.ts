import datos from './preguntas.json';
import { type Rng, rngFrom, shuffle } from '../core/rng';
import type { Dificultad } from '../core/difficulty';

export interface Pregunta {
  id: number;
  categoria: string;
  dificultad: 'facil' | 'media' | 'dificil';
  pregunta: string;
  opciones: string[];
  correcta: number;
  ref: string | null;
}

export const PREGUNTAS: Pregunta[] = datos as Pregunta[];

export const CATEGORIAS = [
  'Antiguo Testamento',
  'Nuevo Testamento',
  'Personajes',
  'Parábolas y Enseñanzas',
  'Números y Datos',
] as const;
export type Categoria = (typeof CATEGORIAS)[number] | 'Todas';

/** Filtra el banco por categoría y dificultad ('mixta' incluye las tres dificultades). */
export function preguntasFiltradas(categoria: Categoria, dificultad: Dificultad): Pregunta[] {
  return PREGUNTAS.filter(
    (p) => (categoria === 'Todas' || p.categoria === categoria) && (dificultad === 'mixta' || p.dificultad === dificultad),
  );
}

/** Elige `cantidad` preguntas al azar (determinista por semilla), sin repetir. */
export function elegirPreguntas(categoria: Categoria, dificultad: Dificultad, cantidad: number, semilla: string): Pregunta[] {
  const rng = rngFrom(semilla);
  const elegidas = shuffle(rng, preguntasFiltradas(categoria, dificultad));
  // Si faltan, completa primero con la misma categoría (otra dificultad) y luego con cualquier pregunta.
  for (const extra of [preguntasFiltradas(categoria, 'mixta'), PREGUNTAS]) {
    if (elegidas.length >= cantidad) break;
    const ids = new Set(elegidas.map((p) => p.id));
    elegidas.push(...shuffle(rng, extra.filter((p) => !ids.has(p.id))));
  }
  return elegidas.slice(0, cantidad);
}

export interface OpcionMostrada {
  texto: string;
  correcta: boolean;
}

export function opcionesBarajadas(p: Pregunta, rng: Rng): OpcionMostrada[] {
  const opciones = p.opciones.map((texto, i) => ({ texto, correcta: i === p.correcta }));
  return shuffle(rng, opciones);
}
