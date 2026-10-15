import './styles/main.css';

import { app } from './app';
import { audio } from './audio';
import { iniciarPantallaCompleta } from './fullscreen';
import { pantallaBienvenida } from './ui/bienvenida';
import { pantallaConfiguracion } from './ui/configuracion';
import { pantallaJuego } from './ui/juego';
import { pantallaResultados } from './ui/resultados';
import { pantallaPuntuaciones } from './ui/puntuaciones';

app.registrar('bienvenida', pantallaBienvenida);
app.registrar('configuracion', pantallaConfiguracion);
app.registrar('juego', pantallaJuego);
app.registrar('resultados', pantallaResultados);
app.registrar('puntuaciones', pantallaPuntuaciones);

iniciarPantallaCompleta(() => app.g.config.pantallaCompleta);
app.montar(document.getElementById('app')!);
app.aplicarConfig();
app.ir(app.g.nombre ? 'configuracion' : 'bienvenida');

// El audio solo puede empezar después de un gesto del usuario.
const iniciarAudio = () => {
  audio.iniciar();
  app.aplicarConfig();
  window.removeEventListener('pointerdown', iniciarAudio);
  window.removeEventListener('keydown', iniciarAudio);
};
window.addEventListener('pointerdown', iniciarAudio);
window.addEventListener('keydown', iniciarAudio);

window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => app.aplicarConfig());

// Service worker: guarda el juego en caché para jugar sin conexión (también instalado como app).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}
