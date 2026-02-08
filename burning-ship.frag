// Author: Chapter 14 - The Book of Shaders
// Title: Burning Ship Fractal

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Interesting region to view the "ship"
    uv = (uv - vec2(0.4, 0.5)) * 2.5;
    uv.x *= u_resolution.x / u_resolution.y;
    
    vec2 c = uv;
    vec2 z = vec2(0.0);
    
    float iterations = 0.0;
    const float maxIter = 100.0;
    
    for(float i = 0.0; i < maxIter; i++) {
        // The key difference: take absolute value before squaring
        z = abs(z);
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        
        if(dot(z, z) > 4.0) {
            float log_zn = log(dot(z, z)) / 2.0;
            float nu = log(log_zn / log(2.0)) / log(2.0);
            iterations = i + 1.0 - nu;
            break;
        }
    }
    
    float t = iterations / maxIter;
    
    vec3 color = vec3(0.0);
    if(t > 0.0) {
        color = 0.5 + 0.5 * cos(vec3(1.0, 2.0, 4.0) + t * 12.0);
    }
    
    gl_FragColor = vec4(color, 1.0);
}
