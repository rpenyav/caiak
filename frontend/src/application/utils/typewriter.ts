export type TypewriterOptions = {
  /** caracteres por segundo */
  cps?: number; // p.ej. 28 → 80 o 120 para acelerar
  /** resolución del temporizador en ms */
  minTickMs?: number; // p.ej. 25 → 16 o 12
  /** pausas extra tras signos de puntuación */
  punctuationPauseMs?: Record<string, number>;
  /** factor de velocidad global (0.5–6). 1 = normal, 2 = x2 */
  speedFactor?: number;
  /** callback de salida */
  onChunk: (text: string) => void;
};

export function createTypewriter(opts: TypewriterOptions) {
  const baseCps = Math.max(5, Math.min(opts.cps ?? 28, 240));
  const tick = Math.max(8, Math.min(opts.minTickMs ?? 16, 100));

  // factor de velocidad global (reduce pausas y aumenta CPS)
  let speed = Math.max(0.5, Math.min(opts.speedFactor ?? 1, 6));

  let cps = baseCps * speed;
  let perTick = (cps * tick) / 1000; // chars/tick

  const basePunct = opts.punctuationPauseMs ?? {
    ".": 180,
    ",": 120,
    "!": 220,
    "?": 220,
    ";": 150,
    ":": 150,
  };

  // pausas escaladas por velocidad (a más velocidad, menor pausa)
  const punct: Record<string, number> = {};
  const recomputePauses = () => {
    for (const k in basePunct) {
      punct[k] = Math.max(0, Math.round(basePunct[k] / speed));
    }
  };
  recomputePauses();

  let buffer = "";
  let carry = 0;
  let timer: number | null = null;
  let ended = false;

  const stopTimer = () => {
    if (timer != null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
  const loop = () => {
    if (buffer.length === 0) {
      if (ended) stopTimer();
      return;
    }
    carry += perTick;
    let n = carry | 0; // floor rápido
    if (n <= 0) return;
    carry -= n;
    if (n > buffer.length) n = buffer.length;

    const out = buffer.slice(0, n);
    buffer = buffer.slice(n);
    if (out) opts.onChunk(out);

    const last = out[out.length - 1];
    const pause = punct[last];
    if (pause && buffer.length > 0) {
      stopTimer();
      window.setTimeout(startTimer, pause);
    }
  };
  const startTimer = () => {
    if (timer != null) return;
    timer = window.setInterval(loop, tick);
  };

  return {
    push(chunk: string) {
      if (!chunk) return;
      buffer += chunk;
      startTimer();
    },
    /** Cambia la velocidad en caliente (por si quieres botón “x2”) */
    speed(factor: number) {
      speed = Math.max(0.5, Math.min(factor, 6));
      cps = baseCps * speed;
      perTick = (cps * tick) / 1000;
      recomputePauses();
    },
    /** Si pasas true, vuelca lo que quede de golpe (sin animación) */
    end(fastFlush = false) {
      ended = true;
      if (fastFlush && buffer) {
        const rest = buffer;
        buffer = "";
        stopTimer();
        opts.onChunk(rest);
      } else {
        startTimer();
      }
    },
    cancel() {
      ended = true;
      buffer = "";
      stopTimer();
    },
  };
}
