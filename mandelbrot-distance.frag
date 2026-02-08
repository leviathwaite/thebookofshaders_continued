// Author: Chapter 14 - The Book of Shaders
// Title: Mandelbrot Distance Estimation

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float mandelbrotDE(vec2 c) {
    vec2 z = vec2(0.0);
    vec2 dz = vec2(1.0, 0.0);
    
    for(int i = 0; i < 100; i++) {
        // dz = 2*z*dz (derivative)
        dz = 2.0 * vec2(z.x * dz.x - z.y * dz.y, z.x * dz.y + z.y * dz.x);
        
        // z = z² + c
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        
        if(dot(z, z) > 256.0) break;
    }
    
    float r = length(z);
    return 0.5 * r * log(r) / length(dz);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = (uv - 0.5) * 3.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    float d = mandelbrotDE(uv);
    
    // Visualize distance field
    vec3 color = vec3(0.0);
    
    // Create contour lines
    float contours = sin(d * 100.0);
    color += 0.5 + 0.5 * contours;
    
    // Highlight the boundary
    color = mix(vec3(0.0, 0.0, 0.5), color, smoothstep(0.0, 0.01, d));
    
    gl_FragColor = vec4(color, 1.0);
}
