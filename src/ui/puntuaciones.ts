import { app, type Pantalla } from '../app';
import { nombreDificultad, type Dificultad } from '../core/difficulty';
import { boton, h } from './dom';

export function pantallaPuntuaciones(): Pantalla {
  const filas = app.g.puntuaciones.map((p, i) =>
    h(
      'li',
      { class: 'fila-puntuacion' },
      h('span', { class: 'puesto', text: `${i + 1}.` }),
      h('span', { class: 'nombre', text: p.nombre }),
      h('span', { class: 'detalle', text: `${p.puntaje} pts · ${p.aciertos}/${p.total} · ${nombreDificultad(p.dificultad as Dificultad)} · ${p.categoria}` }),
    ),
  );

  const el = h(
    'main',
    { class: 'pantalla puntuaciones' },
    h(
      'div',
      { class: 'tarjeta pila' },
      h('h1', { text: 'Tabla de puntuaciones' }),
      filas.length > 0
        ? h('ol', { class: 'lista-puntuaciones' }, ...filas)
        : h('p', { class: 'texto-suave', text: 'Todavía no hay puntuaciones. ¡Juega una partida!' }),
      boton('Volver a jugar', () => app.ir('configuracion'), { variante: 'primario', clase: 'btn-grande' }),
    ),
  );
  return { el };
}
