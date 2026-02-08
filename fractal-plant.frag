// Author: Chapter 14 - The Book of Shaders
// Title: Fractal Plant Growth

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

// Hash function for pseudo-random numbers
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Distance to a line segment
float segment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = (uv - 0.5) * 2.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    float d = 1000.0;
    
    // Root position
    vec2 pos = vec2(0.0, -0.8);
    vec2 dir = vec2(0.0, 1.0);
    float len = 0.3;
    float angle = 0.5;
    
    // Grow branches recursively (simulated with iteration)
    for(int branch = 0; branch < 6; branch++) {
        float scale = pow(0.7, float(branch));
        int branches = int(pow(2.0, float(branch)));
        
        for(int i = 0; i < 64; i++) {
            if(i >= branches) break;
            
            // Calculate branch position and direction
            float t = float(i) / float(branches);
            vec2 branchPos = pos + dir * len * scale * t;
            
            // Random perturbation
            float r = hash(vec2(float(branch), float(i)));
            float branchAngle = angle * (r * 2.0 - 1.0);
            
            vec2 branchDir = vec2(
                dir.x * cos(branchAngle) - dir.y * sin(branchAngle),
                dir.x * sin(branchAngle) + dir.y * cos(branchAngle)
            );
            
            vec2 endPos = branchPos + branchDir * len * scale;
            
            // Distance to this branch
            d = min(d, segment(uv, branchPos, endPos) - 0.005 * scale);
        }
    }
    
    // Color the plant
    vec3 color = vec3(0.0);
    color = mix(vec3(0.2, 0.5, 0.1), vec3(0.1, 0.3, 0.05), smoothstep(0.0, 0.02, d));
    color = mix(color, vec3(0.9, 0.95, 0.85), smoothstep(0.005, 0.0, d));
    
    gl_FragColor = vec4(color, 1.0);
}
