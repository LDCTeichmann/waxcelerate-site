import { useEffect } from 'react';
import type { RefObject } from 'react';
import { HERO_IMG, BLOCK_HOTSPOT } from '@/sections/hero/constants';
import { VERT, FRAG } from '@/sections/hero/waxLens.shaders';

/**
 * useWaxLens — WebGL2-Lebenszyklus der Wachs-Lupe.
 *
 * Hängt sich an `hostRef` (die Foto-Bühne) für Pointer + Größe und zeichnet in
 * das `canvasRef`-Canvas. Läuft die rAF-Schleife NUR, solange der Cursor in der
 * Bühne ist bzw. der Aus-Fade noch nicht abgeschlossen ist — im Ruhezustand
 * kostet die Lupe nichts.
 *
 * Komplett gegated: ohne `enabled` oder ohne WebGL2 wird gar nichts angelegt.
 */
export function useWaxLens(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  hostRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) return;
    if (typeof WebGL2RenderingContext === 'undefined') return;

    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const gl = canvas.getContext('webgl2', {
      premultipliedAlpha: false,
      alpha: true,
      antialias: true,
    });
    if (!gl) return;

    // ── Programm kompilieren / linken ────────────────────────────────────────
    const compile = (type: number, src: string): WebGLShader | null => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn('[waxLens] shader compile failed:', gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    // Shader-Objekte werden nach dem Linken nicht mehr gebraucht.
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('[waxLens] program link failed:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }

    // ── Geometrie: leeres VAO reicht — Positionen kommen aus gl_VertexID ──────
    const vao = gl.createVertexArray();

    // ── Uniform-Locations einsammeln ─────────────────────────────────────────
    const u = {
      tex:           gl.getUniformLocation(program, 'uTex'),
      texResolution: gl.getUniformLocation(program, 'uTexResolution'),
      resolution:    gl.getUniformLocation(program, 'uResolution'),
      center:        gl.getUniformLocation(program, 'uCenter'),
      radius:        gl.getUniformLocation(program, 'uRadius'),
      zoom:          gl.getUniformLocation(program, 'uZoom'),
      active:        gl.getUniformLocation(program, 'uActive'),
      time:          gl.getUniformLocation(program, 'uTime'),
      imgScaleOff:   gl.getUniformLocation(program, 'uImgScaleOffset'),
    };

    // ── Textur (wird gefüllt, sobald das Bild geladen ist) ───────────────────
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let imgLoaded = false;
    let imgW = 1;
    let imgH = 1;
    const img = new Image();
    img.onload = () => {
      imgW = img.naturalWidth || 1;
      imgH = img.naturalHeight || 1;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      imgLoaded = true;
      recomputeCover();
    };
    img.src = HERO_IMG; // same-origin -> kein crossOrigin nötig

    // ── Größe + object-cover-Geometrie ───────────────────────────────────────
    let cssW = 1;
    let cssH = 1;
    // uImgScaleOffset = (scaleX, scaleY, offsetX, offsetY): Canvas-UV -> Bild-UV
    const scaleOff = new Float32Array([1, 1, 0, 0]);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = Math.max(host.clientWidth, 1);
      cssH = Math.max(host.clientHeight, 1);
      const w = Math.round(cssW * dpr);
      const h = Math.round(cssH * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      recomputeCover();
    };

    // Repliziert object-cover mit object-position 68%/50%:
    // Das Bild wird so skaliert, dass es die Box vollständig deckt; die
    // überstehende Achse wird gemäß Position verschoben. Wir mappen Canvas-UV
    // [0,1] auf den sichtbaren Bildausschnitt in Bild-UV.
    const recomputeCover = () => {
      const canvasAR = cssW / cssH;
      const imgAR = imgW / imgH;
      // posX/posY = object-position als 0..1 (68%/50%)
      const posX = 0.68;
      const posY = 0.5;
      let scaleX = 1;
      let scaleY = 1;
      let offX = 0;
      let offY = 0;
      if (imgAR > canvasAR) {
        // Bild breiter als Box -> horizontal beschnitten.
        const visible = canvasAR / imgAR; // Anteil der Bildbreite, der sichtbar ist
        scaleX = visible;
        offX = (1 - visible) * posX;
      } else {
        // Bild höher als Box -> vertikal beschnitten.
        const visible = imgAR / canvasAR; // Anteil der Bildhöhe, der sichtbar ist
        scaleY = visible;
        offY = (1 - visible) * posY;
      }
      scaleOff[0] = scaleX;
      scaleOff[1] = scaleY;
      scaleOff[2] = offX;
      scaleOff[3] = offY;
    };

    // ── Pointer-Tracking ─────────────────────────────────────────────────────
    const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
    // Ziel- und geglättete Mitte (Canvas-px, y nach unten).
    let targetX = -9999;
    let targetY = -9999;
    let curX = -9999;
    let curY = -9999;
    let targetActive = 0;
    let curActive = 0;
    let hovering = false;

    const insideBlock = (px: number, py: number): boolean => {
      // BLOCK_HOTSPOT in Bruchteilen der Host-Box (right-anchored).
      const left = (1 - BLOCK_HOTSPOT.right - BLOCK_HOTSPOT.width) * cssW;
      const right = (1 - BLOCK_HOTSPOT.right) * cssW;
      const top = BLOCK_HOTSPOT.top * cssH;
      const bottom = (BLOCK_HOTSPOT.top + BLOCK_HOTSPOT.height) * cssH;
      return px >= left && px <= right && py >= top && py <= bottom;
    };

    const onMove = (e: MouseEvent) => {
      const r = host.getBoundingClientRect();
      const px = e.clientX - r.left; // CSS-px relativ zur Box
      const py = e.clientY - r.top;
      const d = dpr();
      targetX = px * d;
      targetY = py * d;
      // Erstkontakt: Mitte nicht vom Bildschirmrand heranfliegen lassen.
      if (curX < -9000) {
        curX = targetX;
        curY = targetY;
      }
      targetActive = insideBlock(px, py) ? 1 : 0;
      if (targetActive > 0) start();
    };

    const onEnter = () => {
      hovering = true;
      start();
    };

    const onLeave = () => {
      hovering = false;
      targetActive = 0;
      // Schleife läuft weiter, bis der Aus-Fade durch ist (siehe frame()).
    };

    host.addEventListener('mousemove', onMove);
    host.addEventListener('mouseenter', onEnter);
    host.addEventListener('mouseleave', onLeave);

    // ── ResizeObserver + window resize ───────────────────────────────────────
    const ro = new ResizeObserver(() => resize());
    ro.observe(host);
    window.addEventListener('resize', resize);
    resize();

    // ── rAF-Schleife ─────────────────────────────────────────────────────────
    const RADIUS_CSS = 116; // Lupen-Radius in CSS-px
    const ZOOM = 1.8;
    let raf = 0;
    let running = false;
    let startTime = 0;
    let contextLost = false;

    const start = () => {
      if (running || contextLost) return;
      running = true;
      if (startTime === 0) startTime = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const frame = (now: number) => {
      if (!running) return;

      // Easing: Mitte liquide (0.18), Aktiv-Fade etwas schneller (~0.16).
      curX += (targetX - curX) * 0.18;
      curY += (targetY - curY) * 0.18;
      curActive += (targetActive - curActive) * 0.16;

      // Stopp-Bedingung: nicht mehr im Hover UND Fade praktisch aus.
      if (!hovering && targetActive === 0 && curActive < 0.004) {
        // Letztes Mal transparent löschen, damit kein Rest stehenbleibt.
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        curActive = 0;
        stop();
        return;
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      if (imgLoaded && curActive > 0.001) {
        const d = dpr();
        gl.useProgram(program);
        gl.bindVertexArray(vao);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(u.tex, 0);

        gl.uniform2f(u.texResolution, imgW, imgH);
        gl.uniform2f(u.resolution, canvas.width, canvas.height);
        gl.uniform2f(u.center, curX, curY);
        gl.uniform1f(u.radius, RADIUS_CSS * d);
        gl.uniform1f(u.zoom, ZOOM);
        gl.uniform1f(u.active, curActive);
        gl.uniform1f(u.time, (now - startTime) / 1000);
        gl.uniform4fv(u.imgScaleOff, scaleOff);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.bindVertexArray(null);
      }

      raf = requestAnimationFrame(frame);
    };

    // ── Context-Loss-Handling ────────────────────────────────────────────────
    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      stop();
    };
    const onContextRestored = () => {
      // Minimal: Textur neu hochladen, falls Bild schon da war, dann weiter.
      contextLost = false;
      if (imgLoaded) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      }
      resize();
      if (hovering || targetActive > 0) start();
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      stop();
      host.removeEventListener('mousemove', onMove);
      host.removeEventListener('mouseenter', onEnter);
      host.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      ro.disconnect();
      img.onload = null;

      gl.deleteTexture(texture);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      // Kontext freigeben, wenn möglich.
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    };
  }, [canvasRef, hostRef, enabled]);
}
