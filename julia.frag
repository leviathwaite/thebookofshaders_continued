// Author: Chapter 14 - The Book of Shaders
// Title: Julia Set with Mouse Control

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = (uv - 0.5) * 3.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    // The Julia set parameter - try different values!
    // Some interesting ones:
    // c = vec2(-0.4, 0.6);          // Dendrite
    // c = vec2(0.285, 0.01);        // Douady's rabbit
    // c = vec2(-0.70176, -0.3842);  // San Marco
    // c = vec2(-0.835, -0.2321);    // Siegel disk
    vec2 c = vec2(-0.7, 0.27015);
    
    // Allow mouse control
    if(u_mouse.x > 0.0) {
        c = (u_mouse.xy / u_resolution.xy - 0.5) * 2.0;
    }
    
    vec2 z = uv;  // Start at pixel position (key difference from Mandelbrot)
    
    float iterations = 0.0;
    const float maxIter = 150.0;
    
    for(float i = 0.0; i < maxIter; i++) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        
        if(dot(z, z) > 4.0) {
            // Smooth coloring
            float log_zn = log(dot(z, z)) / 2.0;
            float nu = log(log_zn / log(2.0)) / log(2.0);
            iterations = i + 1.0 - nu;
            break;
        }
    }
    
    float t = iterations / maxIter;
    
    vec3 color = vec3(0.0);
    if(t > 0.0) {
        // Create a colorful palette
        color = 0.5 + 0.5 * sin(vec3(1.0, 2.0, 3.0) * t * 15.0 + u_time);
    }
    
    gl_FragColor = vec4(color, 1.0);
}
