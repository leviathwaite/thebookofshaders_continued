// Author: Chapter 14 - The Book of Shaders
// Title: Julia Set with Domain Warping

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Domain warping with time
    uv += 0.1 * vec2(
        sin(uv.y * 5.0 + u_time),
        cos(uv.x * 5.0 + u_time)
    );
    
    uv = (uv - 0.5) * 3.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    // Animated Julia parameter
    vec2 c = vec2(
        -0.7 + 0.2 * cos(u_time * 0.3),
        0.27 + 0.1 * sin(u_time * 0.5)
    );
    
    vec2 z = uv;
    float iterations = 0.0;
    const float maxIter = 100.0;
    
    for(float i = 0.0; i < maxIter; i++) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        
        if(dot(z, z) > 4.0) {
            iterations = i;
            break;
        }
    }
    
    float t = iterations / maxIter;
    
    // Psychedelic coloring
    vec3 color = vec3(0.0);
    if(t > 0.0) {
        color = 0.5 + 0.5 * cos(
            vec3(0.0, 1.0, 2.0) + 
            t * 10.0 + 
            u_time
        );
    }
    
    gl_FragColor = vec4(color, 1.0);
}
