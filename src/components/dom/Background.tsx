import { useEffect, useRef } from 'react'

const FRAGMENT_SHADER = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_scroll;

// High-quality random
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 1D Noise (for mountains)
float noise1D(float x) {
    float i = floor(x);
    float f = fract(x);
    float a = random(vec2(i, 0.0));
    float b = random(vec2(i + 1.0, 0.0));
    float u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u);
}

// Fractal Brownian Motion for rocky peaks
float fbm(float x, int octaves) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
        if (i >= octaves) break;
        v += a * noise1D(x);
        x *= 2.1;
        a *= 0.5;
    }
    return v;
}

// Calculate lighting based on slope
float getHighlight(float x, float h, float speed, int oct) {
    float eps = 0.01;
    float h1 = fbm(x * speed, oct);
    float h2 = fbm((x + eps) * speed, oct);
    float slope = (h2 - h1) / eps;
    return smoothstep(0.0, 1.0, slope) * 0.2;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = uv;
    p.x *= aspect;

    // --- SKY LAYER ---
    vec3 skyBottom = vec3(0.039, 0.043, 0.118); // #0a0b1e
    vec3 skyTop = vec3(0.008, 0.012, 0.031);    // #020308
    vec3 color = mix(skyBottom, skyTop, uv.y);

    // Stars (Procedural with flickering)
    float stars = step(0.996, random(uv * 150.0));
    float flicker = sin(u_time * 1.5 + random(uv) * 20.0) * 0.5 + 0.5;
    color += stars * flicker * 0.35;

    // Adaptive Visibility Sinking
    // Mountains disappear as we scroll past the Hero section (u_scroll > 0.4)
    float sink = smoothstep(0.0, 0.5, u_scroll) * 0.9;

    // --- LAYER 1: FAR-FIELD (MISTY) ---
    float s1 = u_scroll * 0.1;
    float h1 = fbm(p.x * 1.2 + s1 + 100.0, 3) * 0.3 + 0.2 - sink;
    if (uv.y < h1) {
        vec3 c1 = vec3(0.12, 0.15, 0.22); // Misty Grey-Blue
        float mist = smoothstep(h1 - 0.2, h1, uv.y);
        color = mix(c1, color, (1.0 - mist) * 0.5);
    }

    // --- LAYER 2: MID-GROUND (DETAIL) ---
    float s2 = u_scroll * 0.25;
    float h2 = fbm(p.x * 2.2 - s2 + 50.0, 4) * 0.25 + 0.12 - sink;
    if (uv.y < h2) {
        vec3 c2 = vec3(0.06, 0.08, 0.14); // Navy Slate
        float highlight = getHighlight(p.x, h2, 2.2, 4);
        c2 += highlight * vec3(0.4, 0.5, 0.7); // Moonlight highlight
        color = mix(color, c2, smoothstep(h2 - 0.15, h2, uv.y));
    }

    // --- LAYER 3: FOREGROUND (SHARP SILHOUETTE) ---
    float s3 = u_scroll * 0.5;
    float h3 = fbm(p.x * 3.5 + s3 + 10.0, 6) * 0.2 + 0.05 - sink;
    if (uv.y < h3) {
        vec3 c3 = vec3(0.01, 0.012, 0.02); // Deep Obsidian
        float highlight = getHighlight(p.x, h3, 3.5, 6);
        c3 += highlight * vec3(0.2, 0.3, 0.5);
        color = c3;
    }

    // Horizon Glow (Cyan/Emerald tint)
    float glow = exp(-pow(abs(uv.y - (0.28 - sink)), 2.0) * 40.0);
    color += vec3(0.05, 0.15, 0.2) * glow * (1.0 - smoothstep(0.4, 0.6, u_scroll));
 Randy

    // Film Grain Noise
    float grain = (random(uv + u_time * 0.01) - 0.5) * 0.035;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
}
`;

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const scrollLoc = gl.getUniformLocation(program, "u_scroll");

    let animationFrame: number;
    let scrollPos = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const handleScroll = () => {
      scrollPos = window.scrollY / window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    handleResize();

    const render = (time: number) => {
      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(scrollLoc, scrollPos);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrame = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-80"
      style={{ filter: "blur(0px)", backgroundColor: "#020308" }}
    />
  );
}
