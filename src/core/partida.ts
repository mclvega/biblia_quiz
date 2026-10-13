import { MODOS, type Dificultad } from './difficulty';
import type { Categoria, Pregunta } from '../content/quiz';
import { elegirPreguntas } from '../content/quiz';

export interface ParametrosPartida {
  categoria: Categoria;
  dificultad: Dificultad;
  cantidad: number;
}

export interface Partida extends ParametrosPartida {
  preguntas: Pregunta[];
  indice: number;
  puntaje: number;
  aciertos: number;
}

export function crearPartida(params: ParametrosPartida): Partida {
  const semilla = `partida:${Date.now()}:${Math.random()}`;
  return {
    ...params,
    preguntas: elegirPreguntas(params.categoria, params.dificultad, params.cantidad, semilla),
    indice: 0,
    puntaje: 0,
    aciertos: 0,
  };
}

/** Tiempo (segundos) para la pregunta actual según la dificultad (la "mixta" usa la de cada pregunta). */
export function tiempoPregunta(partida: Partida): number {
  const pregunta = partida.preguntas[partida.indice];
  const dificultadEfectiva = partida.dificultad === 'mixta' ? pregunta.dificultad : partida.dificultad;
  return MODOS[dificultadEfectiva].tiempo;
}

/** Puntos ganados por una respuesta correcta, con bonus por tiempo restante. */
export function calcularPuntos(partida: Partida, segundosRestantes: number): number {
  const pregunta = partida.preguntas[partida.indice];
  const dificultadEfectiva = partida.dificultad === 'mixta' ? pregunta.dificultad : partida.dificultad;
  const modo = MODOS[dificultadEfectiva];
  const bonus = Math.round((Math.max(0, segundosRestantes) / modo.tiempo) * 10);
  return modo.puntosBase + bonus;
}
