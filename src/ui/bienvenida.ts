import { app, type Pantalla } from '../app';
import { audio } from '../audio';
import { limpiarNombre } from '../storage';
import { h } from './dom';

/** Primer inicio: pide el nombre del jugador. */
export function pantallaBienvenida(): Pantalla {
  const entrada = h('input', {
    id: 'nombre',
    type: 'text',
    maxlength: '20',
    autocomplete: 'given-name',
    'aria-describedby': 'nombre-ayuda nombre-error',
  }) as HTMLInputElement;
  const error = h('p', { id: 'nombre-error', class: 'error-campo', 'aria-live': 'polite' });

  const enviar = (ev: Event) => {
    ev.preventDefault();
    const nombre = limpiarNombre(entrada.value);
    if (!nombre) {
      error.textContent = 'Escribe tu nombre con letras (hasta 20).';
      entrada.focus();
      return;
    }
    app.g.nombre = nombre;
    app.guardar();
    audio.efecto('acierto');
    app.ir('configuracion');
  };

  const formulario = h(
    'form',
    { class: 'pila', onsubmit: enviar, novalidate: true },
    h(
      'div',
      { class: 'campo' },
      h('label', { for: 'nombre', text: '¿Cómo te llamas?' }),
      entrada,
      h('p', { id: 'nombre-ayuda', class: 'texto-suave', text: 'Se usará para saludarte y en la tabla de puntuaciones. Solo se guarda en este navegador.' }),
      error,
    ),
    h('button', { type: 'submit', class: 'btn btn-primario btn-grande' }, h('span', { class: 'btn-texto', text: 'Comenzar' })),
  );

  const el = h(
    'main',
    { class: 'pantalla bienvenida' },
    h(
      'div',
      { class: 'tarjeta pila' },
      h('h1', { text: 'Quiz Bíblico' }),
      h('p', { class: 'texto-grande', text: 'Pon a prueba lo que sabes de la Biblia (Reina Valera 1960), con distintas dificultades y categorías.' }),
      formulario,
    ),
  );
  return { el };
}
