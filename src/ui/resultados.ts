import { app, type Pantalla } from '../app';
import { audio } from '../audio';
import { esIlimitada, type Partida } from '../core/partida';
import { agregarPuntuacion, type Puntuacion } from '../storage';
import { boton, h } from './dom';

function fechaHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

export function pantallaResultados(params: Record<string, unknown>): Pantalla {
  const partida = params.partida as Partida;
  const total = esIlimitada(partida) ? partida.indice : partida.preguntas.length;
  const porcentaje = total > 0 ? Math.round((partida.aciertos / total) * 100) : 0;

  const puntuacion: Puntuacion = {
    nombre: app.g.nombre ?? 'Jugador',
    puntaje: partida.puntaje,
    aciertos: partida.aciertos,
    total,
    dificultad: partida.dificultad,
    categoria: partida.categoria,
    fecha: fechaHoy(),
  };
  agregarPuntuacion(app.g, puntuacion);
  app.guardar();
  audio.efecto('victoria');

  const el = h(
    'main',
    { class: 'pantalla resultados' },
    h(
      'div',
      { class: 'tarjeta pila' },
      h('h1', { text: '¡Partida terminada!' }),
      h('p', { class: 'puntaje-final', text: `${partida.puntaje} puntos` }),
      h('p', { class: 'texto-grande', text: `${partida.aciertos} de ${total} correctas (${porcentaje}%)` }),
      h('div', { class: 'fila-botones' },
        boton('Jugar de nuevo', () => app.ir('configuracion'), { variante: 'primario', clase: 'btn-grande' }),
        boton('Ver puntuaciones', () => app.ir('puntuaciones'), { variante: 'secundario' }),
      ),
    ),
  );
  return { el };
}
