export type Efecto = 'boton' | 'acierto' | 'error' | 'tic' | 'victoria';

/** Motor de efectos de sonido con Web Audio: tonos cortos sintetizados, sin archivos de audio. */
class MotorAudio {
  private ctx: AudioContext | null = null;
  private salida!: GainNode;
  private volumen = 0.7;
  private activo = true;

  /** Debe llamarse tras un gesto del usuario (política de reproducción automática). */
  iniciar(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.salida = this.ctx.createGain();
    this.salida.gain.value = this.volumen;
    this.salida.connect(this.ctx.destination);
  }

  setActivo(activo: boolean): void {
    this.activo = activo;
  }

  private tono(hz: number, cuando: number, dur: number, volumen: number, forma: OscillatorType, ataque = 0.01): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = forma;
    osc.frequency.value = hz;
    env.gain.setValueAtTime(0.0001, cuando);
    env.gain.exponentialRampToValueAtTime(volumen, cuando + ataque);
    env.gain.exponentialRampToValueAtTime(0.0001, cuando + dur);
    osc.connect(env);
    env.connect(this.salida);
    osc.start(cuando);
    osc.stop(cuando + dur + 0.05);
  }

  private campana(hz: number, cuando: number, volumen: number): void {
    this.tono(hz, cuando, 1.0, volumen, 'sine', 0.004);
    this.tono(hz * 2.0, cuando, 0.4, volumen * 0.2, 'sine', 0.003);
  }

  efecto(nombre: Efecto): void {
    if (!this.activo || !this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + 0.01;
    switch (nombre) {
      case 'boton':
        this.tono(880, t, 0.06, 0.08, 'sine', 0.003);
        break;
      case 'acierto':
        this.campana(784, t, 0.2);
        this.campana(1046, t + 0.1, 0.2);
        break;
      case 'error':
        this.tono(220, t, 0.35, 0.15, 'sine', 0.02);
        this.tono(196, t + 0.18, 0.5, 0.12, 'sine', 0.02);
        break;
      case 'tic':
        this.tono(1200, t, 0.05, 0.08, 'square', 0.002);
        break;
      case 'victoria':
        ['C5', 'E5', 'G5', 'C6'].forEach((_, i) => this.campana(523.25 * Math.pow(2, i / 4), t + i * 0.12, 0.2));
        break;
    }
  }
}

export const audio = new MotorAudio();
