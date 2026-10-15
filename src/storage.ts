export interface Puntuacion {
  nombre: string;
  puntaje: number;
  aciertos: number;
  total: number;
  dificultad: string;
  categoria: string;
  fecha: string; // YYYY-MM-DD
}

export interface Configuracion {
  sonido: boolean;
  tema: 'claro' | 'oscuro' | 'auto';
}

export interface Guardado {
  v: 1;
  nombre: string | null;
  puntuaciones: Puntuacion[];
  config: Configuracion;
}

export const CLAVE_GUARDADO = 'biblia-quiz:v1';
const MAX_PUNTUACIONES = 20;

export function configPorDefecto(): Configuracion {
  return { sonido: true, tema: 'auto' };
}

export function guardadoNuevo(): Guardado {
  return { v: 1, nombre: null, puntuaciones: [], config: configPorDefecto() };
}

const esObjeto = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const entero = (v: unknown, min: number, porDefecto: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.floor(v)) : porDefecto;

function normalizarPuntuacion(v: unknown): Puntuacion | null {
  if (!esObjeto(v)) return null;
  if (typeof v.nombre !== 'string' || typeof v.puntaje !== 'number' || typeof v.fecha !== 'string') return null;
  return {
    nombre: v.nombre.slice(0, 20),
    puntaje: entero(v.puntaje, 0, 0),
    aciertos: entero(v.aciertos, 0, 0),
    total: entero(v.total, 0, 0),
    dificultad: typeof v.dificultad === 'string' ? v.dificultad : 'facil',
    categoria: typeof v.categoria === 'string' ? v.categoria : 'Todas',
    fecha: v.fecha,
  };
}

function normalizarConfig(entrada: unknown): Configuracion {
  const d = configPorDefecto();
  if (!esObjeto(entrada)) return d;
  const sonido = typeof entrada.sonido === 'boolean' ? entrada.sonido : d.sonido;
  const tema = entrada.tema === 'claro' || entrada.tema === 'oscuro' || entrada.tema === 'auto' ? entrada.tema : d.tema;
  return { sonido, tema };
}

/** Valida datos guardados: cualquier campo dañado vuelve a su valor por defecto. */
export function normalizarGuardado(entrada: unknown): Guardado {
  const base = guardadoNuevo();
  if (!esObjeto(entrada)) return base;
  const nombre = typeof entrada.nombre === 'string' ? limpiarNombre(entrada.nombre) : null;
  const puntuaciones = Array.isArray(entrada.puntuaciones)
    ? entrada.puntuaciones.map(normalizarPuntuacion).filter((p): p is Puntuacion => p !== null).slice(0, MAX_PUNTUACIONES)
    : [];
  return { v: 1, nombre, puntuaciones, config: normalizarConfig(entrada.config) };
}

/** Nombre del jugador: 1 a 20 caracteres; letras (con tildes y ñ), espacios, punto, apóstrofo y guion. */
export function limpiarNombre(texto: string): string | null {
  const limpio = texto.replace(/\s+/g, ' ').trim().slice(0, 20);
  return /^[\p{L}\p{M} .'-]{1,20}$/u.test(limpio) ? limpio : null;
}

function almacenSeguro(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function cargar(almacen: Pick<Storage, 'getItem'> | null = almacenSeguro()): Guardado {
  try {
    const texto = almacen?.getItem(CLAVE_GUARDADO);
    return texto ? normalizarGuardado(JSON.parse(texto)) : guardadoNuevo();
  } catch {
    return guardadoNuevo();
  }
}

export function guardar(g: Guardado, almacen: Pick<Storage, 'setItem'> | null = almacenSeguro()): void {
  try {
    almacen?.setItem(CLAVE_GUARDADO, JSON.stringify(g));
  } catch {
    // Sin almacenamiento (ventana privada o bloqueado): el juego sigue en memoria.
  }
}

/** Agrega una puntuación y mantiene la lista ordenada de mayor a menor, acotada a MAX_PUNTUACIONES. */
export function agregarPuntuacion(g: Guardado, p: Puntuacion): void {
  g.puntuaciones.push(p);
  g.puntuaciones.sort((a, b) => b.puntaje - a.puntaje);
  g.puntuaciones = g.puntuaciones.slice(0, MAX_PUNTUACIONES);
}
