## Fractals

*"Nature uses only the longest threads to weave her patterns, so each small piece of her fabric reveals the organization of the entire tapestry." - Richard Feynman*

### What are fractals?

If you've been following along through the previous chapters, you've already encountered fractal concepts without perhaps realizing it. When we discussed fractional Brownian motion (fBm) in Chapter 13, we were working with fractals - patterns that exhibit self-similarity at different scales. A fractal is, fundamentally, a pattern where each part resembles the whole, no matter how much you zoom in or out.

The word "fractal" comes from the Latin *fractus*, meaning "broken" or "fractured." It was coined by mathematician Benoit Mandelbrot in 1975 to describe geometric shapes that possess what he called "fractional dimensions" - a concept that bridges the gap between the integer dimensions we're familiar with (1D lines, 2D planes, 3D volumes) and something altogether more mysterious.

In nature, fractals are everywhere: the branching of trees, the structure of clouds, the patterns of coastlines, the arrangement of galaxies, and even the distribution of capillaries in your body. What makes fractals particularly fascinating for shaders is that infinitely complex patterns can emerge from deceptively simple rules.

### Recursive subdivision

The simplest fractals are based on recursive subdivision. Let's start with something visual and intuitive: the Sierpinski triangle.

The algorithm is beautifully simple:
1. Start with an equilateral triangle
2. Divide it into four smaller triangles by connecting the midpoints of each side
3. Remove the central triangle
4. Repeat steps 2-3 for each remaining triangle

While this is a recursive algorithm in concept, we can't use actual recursion in GLSL (no recursive functions allowed!). Instead, we'll use iterative techniques. Here's one approach using domain repetition:

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

// Simple 2D rotation
vec2 rotate(vec2 st, float a) {
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c) * st;
}

// Distance to equilateral triangle
float triangle(vec2 st) {
    st = (st * 2.0 - 1.0) * 2.0;
    float a = atan(st.x, st.y) + 3.14159;
    float r = length(st);
    float v = 6.28319 / 3.0;
    return cos(floor(0.5 + a / v) * v - a) * r;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    
    vec3 color = vec3(1.0);
    float d = 1.0;
    
    // Iterate through multiple scales
    float scale = 1.0;
    for(int i = 0; i < 6; i++) {
        vec2 p = st * scale;
        // Create triangular tiling
        p = vec2(p.x + p.y * 0.5, p.y * 0.866);
        p = fract(p) - 0.5;
        
        // Check if we're inside a triangle at this scale
        float t = triangle(p);
        d = min(d, t);
        
        // Each iteration, scale by 2 and offset to create subdivision
        scale *= 2.0;
    }
    
    // Color based on distance field
    color = vec3(step(0.0, d));
    
    gl_FragColor = vec4(color, 1.0);
}
```

Try modifying the number of iterations in the for loop. Notice how each additional iteration reveals more detail at finer scales - this is the hallmark of fractal self-similarity.

### Escape-time fractals

The most famous fractals - the Mandelbrot and Julia sets - belong to a category called "escape-time fractals." The concept is elegant: for each pixel, we iterate a function and count how many iterations it takes for the value to "escape" to infinity (or exceed some threshold). Pixels that never escape are part of the set; those that do escape are colored based on how quickly they escaped.

#### Complex numbers in GLSL

Before we dive into these fractals, we need to understand how to work with complex numbers in shaders. A complex number has two components: a real part and an imaginary part. We can represent this perfectly with a `vec2`:

```glsl
vec2 c = vec2(real_part, imaginary_part);
```

The fundamental operation we need is complex multiplication. If we have two complex numbers `a = (a.x, a.y)` and `b = (b.x, b.y)`, their product is:

```glsl
vec2 complexMultiply(vec2 a, vec2 b) {
    return vec2(
        a.x * b.x - a.y * b.y,  // Real part
        a.x * b.y + a.y * b.x   // Imaginary part
    );
}
```

Or even more concisely:
```glsl
vec2 complexMultiply(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}
```

#### The Mandelbrot Set

The Mandelbrot set is defined by the equation: `z(n+1) = z(n)² + c`

Where:
- `z` starts at 0
- `c` is the complex number we're testing (corresponding to a pixel position)
- We iterate this equation multiple times

If the magnitude of `z` stays below 2 after many iterations, the point `c` is in the Mandelbrot set (typically rendered black). If it escapes, we color it based on how quickly it escaped.

<div class="codeAndCanvas" data="mandelbrot.frag"></div>

```glsl
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
        // z = z² + c
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
```

**Challenge:** Try modifying the center point and zoom level to explore different regions of the Mandelbrot set. The boundary of the set contains infinite detail!

#### Smooth Coloring

You might notice that the standard coloring creates visible "bands" where the iteration count changes. We can smooth this out using a continuous coloring technique. Instead of using the integer iteration count, we can use the magnitude of `z` when it escapes to create a fractional value:

```glsl
// After the escape check in the loop:
if(length(z) > 2.0) {
    // Smooth iteration count
    float log_zn = log(length(z)) / 2.0;
    float nu = log(log_zn / log(2.0)) / log(2.0);
    iterations = i + 1.0 - nu;
    break;
}
```

This gives much smoother, more beautiful renders:

<div class="codeAndCanvas" data="mandelbrot-smooth.frag"></div>

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Center on an interesting area
    vec2 center = vec2(-0.5, 0.0);
    float zoom = 1.5 + sin(u_time * 0.3) * 0.5;  // Animated zoom
    
    uv = (uv - 0.5) * 4.0 / zoom + center;
    uv.x *= u_resolution.x / u_resolution.y;
    
    vec2 c = uv;
    vec2 z = vec2(0.0);
    
    float iterations = 0.0;
    const float maxIter = 100.0;
    
    for(float i = 0.0; i < maxIter; i++) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        
        if(dot(z, z) > 4.0) {  // length squared > 4
            // Smooth coloring
            float log_zn = log(dot(z, z)) / 2.0;
            float nu = log(log_zn / log(2.0)) / log(2.0);
            iterations = i + 1.0 - nu;
            break;
        }
    }
    
    float t = iterations / maxIter;
    
    // Beautiful gradient coloring
    vec3 color = vec3(0.0);
    if(t > 0.0) {
        color = 0.5 + 0.5 * cos(6.0 + t * 20.0 + vec3(0.0, 0.5, 1.0));
    }
    
    gl_FragColor = vec4(color, 1.0);
}
```

#### The Julia Set

The Julia set is intimately related to the Mandelbrot set. While the Mandelbrot set uses each pixel position as `c` and starts `z` at 0, the Julia set does the opposite: it fixes `c` to a constant value and starts `z` at each pixel position.

The equation is the same: `z(n+1) = z(n)² + c`

But now:
- `z` starts at the pixel position
- `c` is a constant we choose

Different values of `c` produce wildly different Julia sets. Interestingly, if you pick a `c` value that's inside the Mandelbrot set, you get a connected Julia set. Pick a `c` outside the Mandelbrot set, and you get a "dust" of disconnected points.

<div class="codeAndCanvas" data="julia.frag"></div>

```glsl
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
    // c = vec2(-0.4, 0.6);      // Dendrite
    // c = vec2(0.285, 0.01);    // Douady's rabbit
    // c = vec2(-0.70176, -0.3842);  // San Marco
    // c = vec2(-0.835, -0.2321);    // Siegel disk
    vec2 c = vec2(-0.7, 0.27015);
    
    // Allow mouse control
    if(u_mouse.x > 0.0) {
        c = (u_mouse.xy / u_resolution.xy - 0.5) * 2.0;
    }
    
    vec2 z = uv;  // Start at pixel position
    
    float iterations = 0.0;
    const float maxIter = 150.0;
    
    for(float i = 0.0; i < maxIter; i++) {
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
        // Create a colorful palette
        color = 0.5 + 0.5 * sin(vec3(1.0, 2.0, 3.0) * t * 15.0 + u_time);
    }
    
    gl_FragColor = vec4(color, 1.0);
}
```

**Experiment:** Try different values of `c` to see the incredible variety of Julia sets. If you move your mouse over the canvas, the `c` value will follow your mouse position!

### Higher Powers

We're not limited to `z² + c`. We can use any power: `z³ + c`, `z⁴ + c`, and so on. Each power creates fractals with different symmetries.

For `z^n`, the fractal will have `n-1` fold rotational symmetry. Here's how to compute higher powers of complex numbers:

```glsl
// z³ in complex arithmetic
vec2 complexCube(vec2 z) {
    float x = z.x;
    float y = z.y;
    return vec2(
        x * x * x - 3.0 * x * y * y,
        3.0 * x * x * y - y * y * y
    );
}

// Or using polar coordinates (more general)
vec2 complexPower(vec2 z, float n) {
    float r = length(z);
    float theta = atan(z.y, z.x);
    float newR = pow(r, n);
    float newTheta = theta * n;
    return newR * vec2(cos(newTheta), sin(newTheta));
}
```

<div class="codeAndCanvas" data="mandelbrot-cubic.frag"></div>

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

vec2 complexCube(vec2 z) {
    float x = z.x;
    float y = z.y;
    return vec2(x*x*x - 3.0*x*y*y, 3.0*x*x*y - y*y*y);
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
        // Notice the three-fold symmetry!
        color = 0.5 + 0.5 * cos(3.0 + t * 12.0 + vec3(0.0, 1.0, 2.0));
    }
    
    gl_FragColor = vec4(color, 1.0);
}
```

### Orbit Traps

An "orbit trap" is a technique for coloring fractals based on how close the orbit (the sequence of `z` values during iteration) comes to a specific shape or point. This can create stunning patterns within the fractal.

For example, we might color based on the minimum distance to the origin during iteration, or the minimum distance to a circle or line:

```glsl
float minDist = 1000.0;

for(float i = 0.0; i < maxIter; i++) {
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    
    // Track minimum distance to origin
    minDist = min(minDist, length(z));
    
    if(dot(z, z) > 4.0) break;
}

// Color based on minimum distance
color = vec3(minDist);
```

<div class="codeAndCanvas" data="julia-orbit-trap.frag"></div>

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = (uv - 0.5) * 3.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    vec2 c = vec2(-0.4, 0.6);
    vec2 z = uv;
    
    float minDist = 1000.0;
    vec2 closestPoint = vec2(0.0);
    
    const float maxIter = 150.0;
    
    for(float i = 0.0; i < maxIter; i++) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        
        // Track closest approach to a circle
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
```

### Lyapunov Fractals

Lyapunov fractals visualize the stability of systems by varying parameters in a sequence. While traditional Mandelbrot/Julia sets use the same formula repeatedly, Lyapunov fractals alternate between different parameters, creating distinctive patterns that look like maps or biological structures.

The formula alternates between two parameters `a` and `b` according to a sequence (like "AABAB"):

```glsl
float lyapunov(vec2 coord, int sequence) {
    float r = 0.0;
    float total = 0.0;
    float x = 0.5;
    
    for(int i = 0; i < 100; i++) {
        // Alternate between coord.x and coord.y based on sequence
        r = (sequence & (1 << (i % 6))) != 0 ? coord.x : coord.y;
        
        // Logistic map
        float dx = r * (1.0 - 2.0 * x);
        total += log(abs(dx));
        x = r * x * (1.0 - x);
    }
    
    return total / 100.0;  // Average Lyapunov exponent
}
```

### Burning Ship Fractal

This is a variation on the Mandelbrot set where we take the absolute value of the real and imaginary parts before squaring:

<div class="codeAndCanvas" data="burning-ship.frag"></div>

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Interesting region to view
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
```

The name comes from the ship-like silhouette visible in certain regions!

### Distance Estimation

For some fractals, particularly those used in ray marching (which we'll explore in later chapters), we want to know not just whether a point is in the set, but how far it is from the boundary. This is called "distance estimation."

For the Mandelbrot set, the distance estimation formula is:

```glsl
float distanceEstimation(vec2 c) {
    vec2 z = vec2(0.0);
    vec2 dz = vec2(1.0, 0.0);  // Derivative starts at 1
    
    for(int i = 0; i < 100; i++) {
        // Update derivative: dz = 2*z*dz + 1
        dz = 2.0 * vec2(z.x * dz.x - z.y * dz.y, z.x * dz.y + z.y * dz.x);
        
        // Update z
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        
        if(dot(z, z) > 256.0) break;
    }
    
    float r = length(z);
    return 0.5 * r * log(r) / length(dz);
}
```

This lets us create beautiful renderings with precise edges:

<div class="codeAndCanvas" data="mandelbrot-distance.frag"></div>

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float mandelbrotDE(vec2 c) {
    vec2 z = vec2(0.0);
    vec2 dz = vec2(1.0, 0.0);
    
    for(int i = 0; i < 100; i++) {
        // dz = 2*z*dz
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
```

### L-Systems and Plant Fractals

L-systems (Lindenmayer systems) are a type of fractal based on string rewriting. While they're typically rendered with turtle graphics, we can simulate some of their effects in shaders using recursive branching patterns.

Here's a simple branching pattern that resembles plant growth:

<div class="codeAndCanvas" data="fractal-plant.frag"></div>

```glsl
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
```

### Combining Fractals with Previous Techniques

The real power comes from combining fractals with techniques from earlier chapters. Try:

- Using fractal patterns as **noise sources** for procedural textures
- Applying **domain warping** to fractals to create organic distortions
- Using fractals to **modulate colors** in other patterns
- Creating **animated fractals** by varying parameters over time
- Using **orbit traps** with custom shapes from Chapter 7

Here's an example combining Julia sets with domain warping:

<div class="codeAndCanvas" data="julia-warped.frag"></div>

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// Noise function (simplified)
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

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
```

### Exercises

1. **Modify the Mandelbrot set** to explore different regions. Some interesting coordinates:
   - `(-0.7, 0.0)` - a simple circle with detail
   - `(-0.75, 0.1)` - seahorse valley
   - `(-0.1, 0.8)` - tendrils

2. **Create your own Julia set explorer**. Map the mouse position to the `c` parameter and see how the set morphs in real-time.

3. **Experiment with higher powers**. Try `z⁴ + c`, `z⁵ + c`, or even non-integer powers using polar coordinates.

4. **Design custom orbit traps**. Instead of a circle, try trapping orbits near:
   - A line (vertical, horizontal, or diagonal)
   - A cross shape
   - Multiple points
   - A star shape from Chapter 7

5. **Combine techniques**: Create a fractal that uses noise to:
   - Displace the domain before iteration
   - Modulate the iteration count
   - Affect the coloring

6. **Create an animated zoom** into the Mandelbrot or Julia set. Hint: gradually decrease the scale and adjust the center point.

7. **Implement the Newton fractal** using Newton's method for finding roots: `z(n+1) = z(n) - f(z) / f'(z)`. Try `f(z) = z³ - 1`.

### Summary

Fractals are a perfect match for shaders because they can generate infinite complexity from simple, parallel calculations. The key insights are:

- **Self-similarity**: The same patterns repeat at different scales
- **Iteration**: Simple rules applied repeatedly create complexity
- **Escape-time**: Many fractals are colored by counting iterations until a condition is met
- **Complex numbers**: Represented as `vec2`, with custom multiplication rules
- **Smooth coloring**: Fractional iteration counts prevent banding
- **Orbit traps**: Track the path during iteration for artistic effects

While we can't use true recursion in GLSL, we can achieve fractal-like results through iteration, domain repetition, and clever use of loops. The patterns we can create are limited only by our imagination - and perhaps our GPU's patience!

In the next chapters, we'll see how these techniques extend into image processing and 3D rendering, where fractals play a role in everything from terrain generation to atmospheric effects.

### Further Reading

- [Inigo Quilez's articles on fractals](https://iquilezles.org/articles/distancefractals/)
- [The Mandelbrot set on Wikipedia](https://en.wikipedia.org/wiki/Mandelbrot_set)
- [Julia set on Wikipedia](https://en.wikipedia.org/wiki/Julia_set)
- [Fractal explorer on Shadertoy](https://www.shadertoy.com/results?query=mandelbrot)
