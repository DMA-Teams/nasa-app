// Para animar los datos cuando el usuario los tiene delante, no antes.
import { useEffect, useRef, useState } from "react";

/** Avisa cuando un bloque entra en pantalla (una sola vez), para llenar las barras a la vista del usuario. */
export function useEnVista<T extends Element>() {
  const ref = useRef<T>(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisto(true);
          observador.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);
  return [ref, visto] as const;
}
