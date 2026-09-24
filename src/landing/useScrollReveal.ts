import { useEffect } from "react";

/**
 * Animación ligada al scroll para los elementos con [data-reveal].
 *
 * No es un disparador: la opacidad y el desplazamiento siguen al scroll de
 * forma progresiva. Al bajar, el elemento pasa de transparente a visible a
 * medida que entra; al subir, se vuelve translúcido y desaparece del mismo modo.
 *
 * El progreso (0 → 1) se escribe en la variable CSS --reveal y el CSS lo
 * convierte en opacity/translate. Se recalcula en cada frame de scroll y
 * consultando el DOM cada vez, así que también funciona con contenido que
 * llega después (noticias del CMS).
 */

// Fracción de la pantalla que recorre un elemento hasta verse del todo.
const REVEAL_DISTANCE = 0.55;
// Retraso por elemento para el escalonado (fracción de pantalla).
const STAGGER_STEP = 0.07;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export const useScrollReveal = () => {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");

      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const delay = Number(element.dataset.revealDelay || 0) * STAGGER_STEP;
        // 0 cuando el borde superior toca el fondo de la pantalla,
        // 1 cuando ya subió REVEAL_DISTANCE de la pantalla.
        const traveled = (viewport - rect.top) / viewport - delay;
        const progress = clamp(traveled / REVEAL_DISTANCE);
        element.style.setProperty("--reveal", progress.toFixed(3));
      });
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    // Contenido que aparece o cambia sin que haya scroll (p. ej. llega el CMS)
    const mutations = new MutationObserver(requestUpdate);
    mutations.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    requestUpdate();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      mutations.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((element) => element.style.removeProperty("--reveal"));
    };
  }, []);
};
