"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Binary written by scripts/assets/assets.py (step "apex"). */
  src: string;
  /** Shown if WebGL2 is unavailable. */
  poster?: string;
  label: string;
  className?: string;
  /** Seconds per revolution. */
  period?: number;
};

const VERT = `#version 300 es
in vec3 aPos;
in vec3 aOffset;
in vec3 aColour;
uniform mat3 uRot;
uniform float uExplode;
uniform float uShrink;
uniform vec2 uScale;
out vec3 vView;
flat out vec3 vColour;
void main() {
  // aOffset is the convex's centroid: shrink each convex towards it and push it outwards
  vec3 p = uRot * (aPos + (aOffset - aPos) * uShrink + aOffset * uExplode);
  vView = p;
  vColour = aColour;
  float z = p.z + 3.4;                     // camera on the +z axis, looking at the origin
  gl_Position = vec4(p.x * uScale.x, p.y * uScale.y, (z - 1.0) / 4.0 * z, z);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec3 vView;
flat in vec3 vColour;
out vec4 outColor;
void main() {
  // flat shading from screen-space derivatives: one normal per facet
  vec3 n = normalize(cross(dFdx(vView), dFdy(vView)));
  if (n.z > 0.0) n = -n;
  float key = max(dot(n, normalize(vec3(-0.4, 0.8, -0.45))), 0.0);
  float fill = max(dot(n, normalize(vec3(0.7, 0.1, -0.7))), 0.0);
  outColor = vec4(min(vColour * (0.74 + 0.24 * key + 0.08 * fill), 1.0), 1.0);
}`;

// the 10-tone palette of the APEX paper figures (GF4Shape local/arch_figure/assets.py)
const PALETTE = ["#86A9CB", "#E9A87F", "#9EC6A2", "#D9919E", "#B7A6D8", "#E8C66E", "#72B6AE", "#C8A585", "#A7B8D9", "#E3B5A4"].map(
  (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255),
);

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? "shader");
  return sh;
}

/**
 * A shape as the union of its predicted convex polytopes, one colour per convex,
 * turning slowly and briefly pulling apart once per cycle.
 */
export default function ConvexMesh({ src, poster, label, className, period = 18 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) {
      setFailed(true);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.arrayBuffer();
      })
      .then((buf) => {
        if (disposed) return;
        const dv = new DataView(buf);
        if (String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) !== "CVX1") {
          throw new Error("bad convex file");
        }
        const nConvex = dv.getUint16(4, true);
        const nVert = dv.getUint32(8, true);
        const nTri = dv.getUint32(12, true);
        let o = 16;
        const pos = new Int16Array(buf, o, nVert * 3);
        o += nVert * 6;
        const owner = new Uint16Array(buf, o, nVert);
        o += nVert * 2;
        const index = new Uint16Array(buf, o, nTri * 3);
        o += nTri * 6;
        const colourOf = new Uint8Array(buf, o, nConvex);

        // explode direction: from the shape's centre to each convex's centroid
        const sum = new Float64Array(nConvex * 3);
        const cnt = new Float64Array(nConvex);
        for (let i = 0; i < nVert; i++) {
          const c = owner[i];
          sum[c * 3] += pos[i * 3] / 32767;
          sum[c * 3 + 1] += pos[i * 3 + 1] / 32767;
          sum[c * 3 + 2] += pos[i * 3 + 2] / 32767;
          cnt[c] += 1;
        }
        const offset = new Float32Array(nVert * 3);
        const colour = new Float32Array(nVert * 3);
        for (let i = 0; i < nVert; i++) {
          const c = owner[i];
          const rgb = PALETTE[colourOf[c] % PALETTE.length];
          for (let k = 0; k < 3; k++) {
            offset[i * 3 + k] = sum[c * 3 + k] / cnt[c];
            colour[i * 3 + k] = rgb[k];
          }
        }

        const prog = gl.createProgram()!;
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
        gl.useProgram(prog);

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        const attrib = (name: string, data: ArrayBufferView, size: number, type: number, normalized: boolean) => {
          const b = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, b);
          gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
          const loc = gl.getAttribLocation(prog, name);
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, size, type, normalized, 0, 0);
        };
        attrib("aPos", pos, 3, gl.SHORT, true);
        attrib("aOffset", offset, 3, gl.FLOAT, false);
        attrib("aColour", colour, 3, gl.FLOAT, false);
        const ib = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

        const uRot = gl.getUniformLocation(prog, "uRot");
        const uExplode = gl.getUniformLocation(prog, "uExplode");
        const uShrink = gl.getUniformLocation(prog, "uShrink");
        const uScale = gl.getUniformLocation(prog, "uScale");
        gl.enable(gl.DEPTH_TEST);

        let width = 0;
        let height = 0;
        const resize = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          width = canvas.clientWidth;
          height = canvas.clientHeight;
          canvas.width = Math.round(width * dpr);
          canvas.height = Math.round(height * dpr);
          gl.viewport(0, 0, canvas.width, canvas.height);
        };
        resize();

        const pitch = -0.38; // camera slightly above the shape
        const cp = Math.cos(pitch);
        const sp = Math.sin(pitch);
        const draw = (t: number) => {
          const yaw = reduced ? -0.75 : -0.75 + (t / period) * Math.PI * 2;
          const cy = Math.cos(yaw);
          const sy = Math.sin(yaw);
          // R = Rx(pitch) * Ry(yaw), column-major
          gl.uniformMatrix3fv(uRot, false, [cy, sp * sy, -cp * sy, 0, cp, sp, sy, -sp * cy, cp * cy]);
          // a short pull-apart in the middle of every revolution, assembled the rest of the time
          const phase = (t / period) % 1;
          const w = (phase - 0.35) / 0.3;
          const pulse = reduced || w <= 0 || w >= 1 ? 0 : Math.sin(w * Math.PI) ** 2;
          gl.uniform1f(uExplode, 0.12 * pulse);
          gl.uniform1f(uShrink, 0.42 * pulse);
          const fit = 2.85; // the shape stays inside the shorter side at every angle
          const s = Math.min(width, height);
          gl.uniform2f(uScale, (fit * s) / width, (fit * s) / height);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          gl.drawElements(gl.TRIANGLES, nTri * 3, gl.UNSIGNED_SHORT, 0);
        };

        let visible = true;
        const t0 = performance.now();
        const loop = (now: number) => {
          raf = requestAnimationFrame(loop);
          if (visible) draw((now - t0) / 1000);
        };
        draw(0);
        if (!reduced) raf = requestAnimationFrame(loop);

        const ro = new ResizeObserver(() => {
          resize();
          draw((performance.now() - t0) / 1000);
        });
        ro.observe(canvas);
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(canvas);
        cleanups.push(() => ro.disconnect(), () => io.disconnect());
      })
      .catch(() => setFailed(true));

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((c) => c());
    };
  }, [src, period]);

  if (failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return poster ? <img src={poster} alt={label} className={className} /> : null;
  }
  return <canvas ref={ref} className={className} role="img" aria-label={label} />;
}
