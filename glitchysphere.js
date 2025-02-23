// Import Three.js
import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js";

// Create Scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a sphere geometry
var geometry = new THREE.SphereGeometry(2, 64, 64);

// Custom Shader Material
var material = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision mediump float;
        varying vec2 vUv;
        uniform float u_time;
        uniform vec2 u_resolution;

        // Simple noise function
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        // Better noise using multiple layers
        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (b - d);
        }

        void main() {
           vec2 uv = vUv;

// Introduce a horizontal glitch effect
float glitchOffset = sin(uv.y * 50.0 + u_time * 10.0) * 0.005;
uv.x += step(0.8, fract(sin(u_time * 5.0) * 43758.5453123)) * glitchOffset;

            
            // Add a diagonal gradient (like Keita Yamada's style)
            float gradient = uv.x + uv.y * 0.5;

            // Apply halftone pattern
          // Pulsating effect using sine wave
float pulse = 1.0 + sin(u_time * 2.0) * 0.5; // Oscillates between 0.5 and 1.5
float halftone = step(0.5, mod(uv.x * (40.0 * pulse) + u_time * 5.0, 1.0)) * 
                 step(0.5, mod(uv.y * (40.0 * pulse) + u_time * 5.0, 1.0));


            // Introduce animated noise effect
            float grain = noise(uv * 50.0 + u_time * 2.0); // Increased time factor for stronger animation
            halftone = mix(halftone, grain, 0.25); // Blend noise with halftone

            // Color blend from red to black
          // Create a smooth color shift over time
float colorShift = sin(u_time) * 0.5 + 0.5; // Oscillates between 0 and 1

// Blend between red and blue over time
vec3 baseColor = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), colorShift);

vec3 color = mix(baseColor, vec3(0.0, 0.0, 0.0), gradient * halftone);


            gl_FragColor = vec4(color, 1.0);
        }
    `
});

// Create a sphere mesh
var sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Position the camera
camera.position.z = 5;

// Resize Handling
window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update time uniform
    sphere.material.uniforms.u_time.value += 0.01;

    // Ensure shader updates
    sphere.material.needsUpdate = true;

    // Render scene
    renderer.render(scene, camera);
}
animate();
