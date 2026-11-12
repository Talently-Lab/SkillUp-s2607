import { useEffect, useRef, type RefObject } from "react";

import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shader";
import "./Aurora.css";

const SHADE = { left: 0, center: 1, none: 2 } as const;

export type AuroraHandle = { pulse: () => void };

type AuroraProps = {
  /** Where to darken so text on top stays readable */
  shade?: keyof typeof SHADE;
  /** Filled with a `pulse()` that briefly energizes the ribbons (hero search) */
  handleRef?: RefObject<AuroraHandle | null>;
};

/**
 * WebGL aurora drawn behind an `.aurora-host`. Without WebGL the host's CSS
 * indigo gradient stays visible, so the section still looks complete.
 * With prefers-reduced-motion it renders a still frame and only redraws on input.
 */
export function Aurora({ shade = "left", handleRef }: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, src);
      gl.compileShader(shader);

      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();

    if (!vs || !fs || !program) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "p");

    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uR = uniform("r");
    const uT = uniform("t");
    const uM = uniform("m");
    const uE = uniform("e");
    gl.uniform1f(uniform("sm"), SHADE[shade]);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const mouse = { x: 0.7, y: 0.5, tx: 0.7, ty: 0.5 };
    let energy = 0;
    let visible = true;
    let raf = 0;
    const t0 = performance.now();

    const size = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
      canvas.width = Math.max(1, Math.round(host.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(host.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const frame = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      energy *= 0.96;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, reduce ? 40 : 40 + (now - t0) / 1000);
      gl.uniform2f(uM, mouse.x, mouse.y);
      gl.uniform1f(uE, energy);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce && visible && !document.hidden)
        raf = requestAnimationFrame(frame);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };

    const onMove = (event: PointerEvent) => {
      const box = host.getBoundingClientRect();
      mouse.tx = (event.clientX - box.left) / box.width;
      mouse.ty = 1 - (event.clientY - box.top) / box.height;
      if (reduce) start();
    };
    const onVisibility = () => {
      if (!document.hidden) start();
    };
    host.addEventListener("pointermove", onMove);
    document.addEventListener("visibilitychange", onVisibility);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(host);
    const ro = new ResizeObserver(() => {
      size();
      start();
    });
    ro.observe(host);

    if (handleRef) {
      handleRef.current = {
        pulse: () => {
          energy = Math.min(1, energy + 0.35);
          if (reduce) start();
        },
      };
    }

    size();
    start();
    const fadeIn = requestAnimationFrame(() =>
      canvas.classList.add("aurora--on"),
    );

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(fadeIn);
      host.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      ro.disconnect();
      if (handleRef) handleRef.current = null;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [shade, handleRef]);

  return <canvas ref={canvasRef} className="aurora" aria-hidden="true" />;
}
