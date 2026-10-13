import { MODOS, type Dificultad } from './difficulty';
import { shuffle, rngFrom } from './rng';
import type { Categoria, Pregunta } from '../content/quiz';
import { elegirPreguntas, preguntasFiltradas } from '../content/quiz';

export type Cantidad = 10 | 15 | 20 | 'ilimitada';

export interface ParametrosPartida {
  categoria: Categoria;
  dificultad: Dificultad;
  cantidad: Cantidad;
}

export interface Partida extends ParametrosPartida {
  /** En modo ilimitado, es el banco filtrado completo (se recicla por rondas). */
  preguntas: Pregunta[];
  semilla: string;
  indice: number;
  puntaje: number;
  aciertos: number;
}

export function crearPartida(params: ParametrosPartida): Partida {
  const semilla = `partida:${Date.now()}:${Math.random()}`;
  const preguntas =
    params.cantidad === 'ilimitada'
      ? shuffle(rngFrom(semilla), preguntasFiltradas(params.categoria, params.dificultad))
      : elegirPreguntas(params.categoria, params.dificultad, params.cantidad, semilla);
  return { ...params, preguntas, semilla, indice: 0, puntaje: 0, aciertos: 0 };
}

export function esIlimitada(partida: Partida): boolean {
  return partida.cantidad === 'ilimitada';
}

/** Pregunta actual. En modo ilimitado, recicla el banco barajándolo de nuevo en cada ronda. */
export function preguntaActual(partida: Partida): Pregunta {
  if (!esIlimitada(partida)) return partida.preguntas[partida.indice];
  const total = partida.preguntas.length;
  const ronda = Math.floor(partida.indice / total);
  const orden = ronda === 0 ? partida.preguntas : shuffle(rngFrom(`${partida.semilla}:ronda${ronda}`), partida.preguntas);
  return orden[partida.indice % total];
}

/** Tiempo (segundos) para la pregunta actual según la dificultad (la "mixta" usa la de cada pregunta). */
export function tiempoPregunta(partida: Partida): number {
  const pregunta = preguntaActual(partida);
  const dificultadEfectiva = partida.dificultad === 'mixta' ? pregunta.dificultad : partida.dificultad;
  return MODOS[dificultadEfectiva].tiempo;
}

/** Puntos ganados por una respuesta correcta, con bonus por tiempo restante. */
export function calcularPuntos(partida: Partida, segundosRestantes: number): number {
  const pregunta = preguntaActual(partida);
  const dificultadEfectiva = partida.dificultad === 'mixta' ? pregunta.dificultad : partida.dificultad;
  const modo = MODOS[dificultadEfectiva];
  const bonus = Math.round((Math.max(0, segundosRestantes) / modo.tiempo) * 10);
  return modo.puntosBase + bonus;
}
