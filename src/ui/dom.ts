/** Utilidades de DOM compartidas por todas las pantallas. */
type Hijo = Node | string | number | null | undefined | false;
type Atributos = Record<string, unknown>;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  atributos: Atributos | null = null,
  ...hijos: Hijo[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (atributos) {
    for (const [clave, valor] of Object.entries(atributos)) {
      if (valor === undefined || valor === null || valor === false) continue;
      if (clave === 'class') el.className = String(valor);
      else if (clave === 'text') el.textContent = String(valor);
      else if (clave === 'dataset') Object.assign(el.dataset, valor);
      else if (clave.startsWith('on') && typeof valor === 'function') {
        el.addEventListener(clave.slice(2).toLowerCase(), valor as EventListener);
      } else if (valor === true) el.setAttribute(clave, '');
      else el.setAttribute(clave, String(valor));
    }
  }
  agregar(el, hijos);
  return el;
}

export function agregar(el: HTMLElement, hijos: Hijo[]): void {
  for (const hijo of hijos) {
    if (hijo === null || hijo === undefined || hijo === false) continue;
    el.append(hijo instanceof Node ? hijo : document.createTextNode(String(hijo)));
  }
}

export type Variante = 'primario' | 'secundario' | 'suave';

export function boton(
  texto: string,
  alHacerClic: (ev: MouseEvent) => void,
  opciones: { icono?: string; variante?: Variante; clase?: string; etiqueta?: string; deshabilitado?: boolean } = {},
): HTMLButtonElement {
  return h(
    'button',
    {
      type: 'button',
      class: ['btn', `btn-${opciones.variante ?? 'secundario'}`, opciones.clase].filter(Boolean).join(' '),
      'aria-label': opciones.etiqueta,
      disabled: opciones.deshabilitado,
      onclick: alHacerClic,
    },
    opciones.icono ? h('span', { class: 'btn-icono', 'aria-hidden': 'true', text: opciones.icono }) : null,
    h('span', { class: 'btn-texto', text: texto }),
  );
}

export const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
