import { audio } from './audio';
import { cargar, guardar, type Guardado } from './storage';

export type NombrePantalla = 'bienvenida' | 'configuracion' | 'juego' | 'resultados' | 'puntuaciones';

export interface Pantalla {
  el: HTMLElement;
  limpiar?: () => void;
}

export type ConstructorPantalla = (params: Record<string, unknown>) => Pantalla;

/** Estado global de la aplicación y navegación entre pantallas. */
class Aplicacion {
  g: Guardado = cargar();
  private raiz: HTMLElement | null = null;
  private actual: Pantalla | null = null;
  private pantallas = new Map<NombrePantalla, ConstructorPantalla>();

  registrar(nombre: NombrePantalla, constructor: ConstructorPantalla): void {
    this.pantallas.set(nombre, constructor);
  }

  montar(raiz: HTMLElement): void {
    this.raiz = raiz;
  }

  ir(nombre: NombrePantalla, params: Record<string, unknown> = {}): void {
    const constructor = this.pantallas.get(nombre);
    if (!constructor || !this.raiz) return;
    this.actual?.limpiar?.();
    const pantalla = constructor(params);
    this.raiz.replaceChildren(pantalla.el);
    this.actual = pantalla;
    window.scrollTo(0, 0);
    const titulo = pantalla.el.querySelector<HTMLElement>('h1');
    if (titulo) {
      titulo.tabIndex = -1;
      titulo.focus({ preventScroll: true });
    }
  }

  guardar(): void {
    guardar(this.g);
  }

  nombre(): string {
    return this.g.nombre ?? 'amigo(a)';
  }

  aplicarConfig(): void {
    const tema = this.g.config.tema;
    if (tema === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = tema === 'oscuro' ? 'dark' : 'light';
    audio.setActivo(this.g.config.sonido);
  }
}

export const app = new Aplicacion();
