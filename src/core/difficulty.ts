export type Dificultad = 'facil' | 'media' | 'dificil' | 'mixta';

export interface ModoDificultad {
  nombre: string;
  /** Segundos para responder cada pregunta. */
  tiempo: number;
  /** Puntos base por respuesta correcta. */
  puntosBase: number;
}

export const MODOS: Record<Exclude<Dificultad, 'mixta'>, ModoDificultad> = {
  facil: { nombre: 'Fácil', tiempo: 20, puntosBase: 10 },
  media: { nombre: 'Media', tiempo: 15, puntosBase: 20 },
  dificil: { nombre: 'Difícil', tiempo: 10, puntosBase: 30 },
};

export const DIFICULTADES: Dificultad[] = ['facil', 'media', 'dificil', 'mixta'];

export function nombreDificultad(d: Dificultad): string {
  return d === 'mixta' ? 'Mixta' : MODOS[d].nombre;
}
