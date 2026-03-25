import { useEffect, useRef } from 'react'

const FRAGMENT_SHADER = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_scroll;
uniform vec2 u_mouse;

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

    // --- LIQUID AETHER 2.0 (BOOSTED) ---
    float time = u_time * 0.2;
    
    // Domain Warping for High Viscosity
    vec2 q = vec2(0.0);
    q.x = fbm(p + vec2(0.0, 0.0), 3);
    q.y = fbm(p + vec2(1.0, 1.0), 3);

    vec2 r = vec2(0.0);
    r.x = fbm(p + 1.2 * q + vec2(1.7, 9.2) + 0.2 * time, 3);
    r.y = fbm(p + 1.2 * q + vec2(8.3, 2.8) + 0.15 * time, 3);

    float f = fbm(p + 1.2 * r, 5);

    // Mouse Reactivity: Sharp, Cinematic Ripples
    float dist = distance(uv, u_mouse / u_resolution);
    float mouseRipple = exp(-dist * 8.0) * 0.55; // Wider, stronger ripple
    f += mouseRipple;

    // Vibrant Aether Palette
    vec3 col1 = vec3(0.02, 0.04, 0.08); // Brighter Base Obsidian
    vec3 col2 = vec3(0.2, 0.6, 1.0);    // Brighter Electric Cyan
    vec3 col3 = vec3(0.6, 0.2, 1.0);    // Brighter Deep Purple
    vec3 col4 = vec3(1.0, 0.2, 0.6);    // Brighter Vibrant Pink

    vec3 activeTheme = mix(col2, col3, smoothstep(0.1, 0.6, u_scroll));
    activeTheme = mix(activeTheme, col4, smoothstep(0.5, 0.9, u_scroll));

    // Denser, more visible liquid flow
    vec3 color = mix(col1, activeTheme, pow(f, 2.8));
    color += pow(f, 6.0) * activeTheme * 2.0; // Stronger Emissive Glow

    // High-Resolution Stars
    float stars = step(0.998, random(uv * 250.0 + f * 0.08));
    float flicker = sin(time * 3.0 + random(uv) * 100.0) * 0.5 + 0.5;
    color += stars * flicker * 0.8;

    // Atmospheric Glow
    float horizonY = 0.35 - (smoothstep(0.0, 0.5, u_scroll) * 0.75);
    float glow = exp(-pow(abs(uv.y - horizonY), 2.0) * 40.0);
    color += activeTheme * 0.25 * glow;

    // Cinematic Film Grain
    float grain = (random(uv * 15.0 + time) - 0.5) * 0.05;
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
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");

    let animationFrame: number;
    let scrollPos = 0;
    let mousePos = { x: 0, y: 0 };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const handleScroll = () => {
      scrollPos = window.scrollY / window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos = { x: e.clientX, y: canvas.height - e.clientY };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    handleResize();

    const render = (time: number) => {
      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(scrollLoc, scrollPos);
      gl.uniform2f(mouseLoc, mousePos.x, mousePos.y);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrame = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-100"
      style={{ filter: "blur(0px)" }}
    />
  );
}
