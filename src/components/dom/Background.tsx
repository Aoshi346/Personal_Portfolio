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

    // --- SKY/AETHER LAYER ---
    // Create a dynamic, moving noise field for the "Aether"
    float time = u_time * 0.2;
    vec2 noiseUV = uv * 2.0;
    float n = fbm(noiseUV.x + time, 4);
    float n2 = fbm(noiseUV.y - time * 0.5, 4);
    
    // Mouse Reactivity: Subtle distortion based on cursor distance
    float dist = distance(uv, u_mouse / u_resolution);
    float mouseInfluence = smoothstep(0.4, 0.0, dist) * 0.15;
    n += mouseInfluence;

    // Color Palette Shift based on Scroll (u_scroll)
    // Section 1-2: Cyan/Blue
    // Section 3-4: Purple
    // Section 5: Pink/Deep Violet
    vec3 colorA = mix(vec3(0.008, 0.012, 0.031), vec3(0.02, 0.08, 0.15), n); // Deep Base
    
    vec3 accentCyan = vec3(0.1, 0.4, 0.5);
    vec3 accentPurple = vec3(0.3, 0.1, 0.5);
    vec3 accentPink = vec3(0.5, 0.1, 0.4);
    
    vec3 activeAccent = mix(accentCyan, accentPurple, smoothstep(0.2, 0.5, u_scroll));
    activeAccent = mix(activeAccent, accentPink, smoothstep(0.6, 0.9, u_scroll));
    
    vec3 color = mix(colorA, activeAccent, n2 * 0.4 * (1.0 - smoothstep(0.8, 1.0, u_scroll) * 0.5));

    // Stars (Procedural with flickering)
    float stars = step(0.998, random(uv * 180.0 + n * 0.01));
    float flicker = sin(u_time * 1.5 + random(uv) * 20.0) * 0.5 + 0.5;
    color += stars * flicker * 0.4;

    // Horizon Glow (Reactive tint)
    float horizonY = 0.28 - (smoothstep(0.0, 0.5, u_scroll) * 0.9);
    float glow = exp(-pow(abs(uv.y - horizonY), 2.0) * 40.0);
    color += activeAccent * 0.2 * glow;

    // Film Grain
    float grain = (random(uv + u_time * 0.01) - 0.5) * 0.03;
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
      className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-80"
      style={{ filter: "blur(0px)", backgroundColor: "#020308" }}
    />
  );
}
