// Author: Chapter 14 - The Book of Shaders
// Title: Julia Set with Orbit Trap

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = (uv - 0.5) * 3.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    vec2 c = vec2(-0.4, 0.6);  // Dendrite Julia set
    vec2 z = uv;
    
    float minDist = 1000.0;
    vec2 closestPoint = vec2(0.0);
    
    const float maxIter = 150.0;
    
    for(float i = 0.0; i < maxIter; i++) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        
        // Track closest approach to a circle (the "orbit trap")
        float dist = abs(length(z) - 0.5);  // Distance to circle of radius 0.5
        if(dist < minDist) {
            minDist = dist;
            closestPoint = z;
        }
        
        if(dot(z, z) > 4.0) break;
    }
    
    // Color based on where the orbit came closest to the trap
    vec3 color = 0.5 + 0.5 * cos(6.0 + minDist * 20.0 + vec3(0.0, 0.5, 1.0));
    
    // Add some angle information for variety
    float angle = atan(closestPoint.y, closestPoint.x);
    color = mix(color, vec3(0.5 + 0.5 * sin(angle * 3.0)), 0.3);
    
    gl_FragColor = vec4(color, 1.0);
}
