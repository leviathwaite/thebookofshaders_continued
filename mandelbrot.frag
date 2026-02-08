// Author: Chapter 14 - The Book of Shaders
// Title: Basic Mandelbrot Set

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    // Map pixel coordinates to complex plane
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = uv * 4.0 - vec2(2.5, 2.0);  // Center and scale
    uv.x *= u_resolution.x / u_resolution.y;
    
    vec2 c = uv;  // The point we're testing
    vec2 z = vec2(0.0);  // Start at origin
    
    float iterations = 0.0;
    const float maxIterations = 100.0;
    
    // Iterate the equation z = z² + c
    for(float i = 0.0; i < maxIterations; i++) {
        // z = z² + c (complex multiplication)
        z = vec2(
            z.x * z.x - z.y * z.y,  // Real part
            2.0 * z.x * z.y          // Imaginary part
        ) + c;
        
        // Check if we've escaped (magnitude > 2)
        if(length(z) > 2.0) {
            iterations = i;
            break;
        }
    }
    
    // Color based on escape time
    float t = iterations / maxIterations;
    vec3 color = vec3(t);
    
    // Add some color gradient for escaped points
    if(t > 0.0) {
        color = 0.5 + 0.5 * cos(3.0 + t * 12.0 + vec3(0.0, 0.5, 1.0));
    }
    
    gl_FragColor = vec4(color, 1.0);
}
