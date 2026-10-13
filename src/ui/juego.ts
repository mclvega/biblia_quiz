import { app, type Pantalla } from '../app';
import { audio } from '../audio';
import { opcionesBarajadas } from '../content/quiz';
import { rngFrom } from '../core/rng';
import { calcularPuntos, tiempoPregunta, type Partida } from '../core/partida';
import { boton, h } from './dom';

export function pantallaJuego(params: Record<string, unknown>): Pantalla {
  const partida = params.partida as Partida;
  let temporizador: number | null = null;

  const limpiar = () => {
    if (temporizador !== null) window.clearInterval(temporizador);
    temporizador = null;
  };

  const renderPregunta = () => {
    limpiar();
    const pregunta = partida.preguntas[partida.indice];
    const mostradas = opcionesBarajadas(pregunta, rngFrom(`opciones:${pregunta.id}:${partida.indice}`));
    const tiempoTotal = tiempoPregunta(partida);
    let restante = tiempoTotal;
    let respondida = false;

    const barraProgreso = h('div', { class: 'barra-progreso' }, h('span', { text: `Pregunta ${partida.indice + 1} de ${partida.preguntas.length}` }));
    const puntajeTexto = h('div', { class: 'puntaje', text: `Puntos: ${partida.puntaje}` });
    const barraTiempo = h('div', { class: 'barra-tiempo' }, h('div', { class: 'barra-tiempo-interior' }));
    const relleno = barraTiempo.querySelector('div')!;
    const lista = h('div', { class: 'opciones-pregunta', role: 'group', 'aria-label': 'Opciones de respuesta' });
    const zonaResultado = h('div', { class: 'pila', 'aria-live': 'polite' });

    const avanzar = () => {
      limpiar();
      partida.indice++;
      if (partida.indice >= partida.preguntas.length) app.ir('resultados', { partida });
      else el.replaceChildren(construirContenido());
    };

    const responder = (opcionIndex: number, correcta: boolean) => {
      if (respondida) return;
      respondida = true;
      limpiar();
      botones.forEach((b, k) => {
        b.disabled = true;
        if (mostradas[k].correcta) b.classList.add('correcta');
      });
      if (!correcta) botones[opcionIndex].classList.add('elegida-mal');
      if (correcta) {
        const puntos = calcularPuntos(partida, restante);
        partida.puntaje += puntos;
        partida.aciertos++;
        audio.efecto('acierto');
      } else {
        audio.efecto('error');
      }
      const correctaTexto = mostradas.find((o) => o.correcta)!.texto;
      const cita = pregunta.ref ? ` (${pregunta.ref})` : '';
      zonaResultado.append(
        h('p', { class: `respuesta ${correcta ? 'bien' : 'mal'}`, text: correcta ? '¡Correcto!' : `La respuesta correcta era «${correctaTexto}»${cita}.` }),
        boton('Siguiente', avanzar, { variante: 'primario', clase: 'btn-grande' }),
      );
      zonaResultado.querySelector<HTMLButtonElement>('.btn-primario')?.focus();
    };

    const botones = mostradas.map((op, i) =>
      boton(op.texto, () => responder(i, op.correcta), { icono: `${i + 1}.`, clase: 'opcion' }),
    );
    lista.append(...botones);

    const construirContenido = () =>
      h(
        'div',
        { class: 'tarjeta pila' },
        h('h1', { class: 'sr-solo', text: `Pregunta ${partida.indice + 1}` }),
        barraProgreso,
        puntajeTexto,
        barraTiempo,
        h('p', { class: 'pregunta-texto', text: pregunta.pregunta }),
        lista,
        zonaResultado,
      );

    el.replaceChildren(construirContenido());

    temporizador = window.setInterval(() => {
      restante -= 0.1;
      const porcentaje = Math.max(0, (restante / tiempoTotal) * 100);
      relleno.style.width = `${porcentaje}%`;
      if (restante <= 3 && restante > 0 && Math.floor(restante * 10) % 10 === 0) audio.efecto('tic');
      if (restante <= 0 && !respondida) {
        respondida = true;
        limpiar();
        botones.forEach((b, k) => {
          b.disabled = true;
          if (mostradas[k].correcta) b.classList.add('correcta');
        });
        audio.efecto('error');
        const correctaTexto = mostradas.find((o) => o.correcta)!.texto;
        const cita = pregunta.ref ? ` (${pregunta.ref})` : '';
        zonaResultado.append(
          h('p', { class: 'respuesta mal', text: `Se acabó el tiempo. La respuesta correcta era «${correctaTexto}»${cita}.` }),
          boton('Siguiente', avanzar, { variante: 'primario', clase: 'btn-grande' }),
        );
        zonaResultado.querySelector<HTMLButtonElement>('.btn-primario')?.focus();
      }
    }, 100);
  };

  const el = h('main', { class: 'pantalla juego' });
  renderPregunta();
  return { el, limpiar };
}
