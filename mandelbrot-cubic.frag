// Author: Chapter 14 - The Book of Shaders
// Title: Cubic Mandelbrot (z³ + c)

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

vec2 complexCube(vec2 z) {
    float x = z.x;
    float y = z.y;
    return vec2(
        x * x * x - 3.0 * x * y * y,
        3.0 * x * x * y - y * y * y
    );
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = (uv - 0.5) * 3.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    vec2 c = uv;
    vec2 z = vec2(0.0);
    
    float iterations = 0.0;
    const float maxIter = 100.0;
    
    for(float i = 0.0; i < maxIter; i++) {
        z = complexCube(z) + c;  // z³ + c instead of z² + c
        
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
        // Notice the three-fold rotational symmetry!
        color = 0.5 + 0.5 * cos(3.0 + t * 12.0 + vec3(0.0, 1.0, 2.0));
    }
    
    gl_FragColor = vec4(color, 1.0);
}
