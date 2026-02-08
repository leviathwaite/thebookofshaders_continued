# Chapter 14: Fractals - The Book of Shaders

This chapter introduces fractals in GLSL, covering escape-time fractals (Mandelbrot and Julia sets), recursive patterns, and advanced coloring techniques.

## Files Included

### Main Content
- `chapter-14-fractals.md` - The complete chapter text with theory, examples, and exercises

### Shader Examples
All shaders are written in GLSL and designed to work with The Book of Shaders editor system.

1. **mandelbrot.frag** - Basic Mandelbrot set implementation
   - Shows the classic formula z = z² + c
   - Simple iteration count coloring
   
2. **mandelbrot-smooth.frag** - Mandelbrot with smooth coloring
   - Implements continuous iteration count
   - Animated zoom feature
   - Beautiful gradient coloring

3. **julia.frag** - Interactive Julia set
   - Mouse control for parameter c
   - Multiple preset values in comments
   - Smooth coloring and time-based animation

4. **mandelbrot-cubic.frag** - Higher power Mandelbrot
   - Uses z³ + c instead of z² + c
   - Demonstrates 3-fold rotational symmetry
   - Shows how to implement complex cube

5. **julia-orbit-trap.frag** - Julia set with orbit trapping
   - Tracks minimum distance to a circle during iteration
   - Creates unique artistic patterns
   - Combines distance and angle information

6. **burning-ship.frag** - Burning Ship fractal
   - Variation using abs(z) before squaring
   - Positioned to show the "ship" silhouette
   - Different aesthetic from standard Mandelbrot

7. **mandelbrot-distance.frag** - Distance estimation
   - Computes actual distance to the set boundary
   - Shows contour lines
   - Useful for understanding the geometry

8. **fractal-plant.frag** - Procedural plant growth
   - Simulates L-system-style branching
   - Uses iterative approach (no recursion)
   - Distance field rendering

9. **julia-warped.frag** - Domain warping example
   - Combines Julia sets with domain distortion
   - Animated parameters
   - Shows integration with previous techniques

## Key Concepts Covered

### Complex Numbers in Shaders
- Representing complex numbers as vec2
- Complex multiplication: `(a+bi)(c+di) = (ac-bd) + (ad+bc)i`
- Magnitude and escape conditions

### The Mandelbrot Set
- Formula: `z(n+1) = z(n)² + c` where z starts at 0
- Each pixel tests whether that point c is in the set
- Colored by iteration count until escape

### Julia Sets
- Same formula as Mandelbrot but inverted
- c is fixed, z starts at pixel position
- Infinite variety based on c value

### Smooth Coloring
```glsl
float log_zn = log(dot(z, z)) / 2.0;
float nu = log(log_zn / log(2.0)) / log(2.0);
iterations = i + 1.0 - nu;
```

### Orbit Traps
- Track the path of z during iteration
- Measure distance to shapes (circles, lines, etc.)
- Create artistic effects

## Usage

### In The Book of Shaders Editor
1. These shaders use the standard uniforms:
   - `u_resolution` - canvas size
   - `u_time` - elapsed time
   - `u_mouse` - mouse position

2. Copy any .frag file into the editor at thebookofshaders.com/edit.php

### Standalone Usage
```glsl
// Minimal vertex shader needed
attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
```

### Integration with Three.js, p5.js, etc.
These shaders can be adapted for any WebGL framework by:
1. Passing the appropriate uniforms
2. Creating a fullscreen quad
3. Rendering to texture if needed

## Exercises and Challenges

### Beginner
1. Modify coloring schemes in any shader
2. Change the zoom level and center point in Mandelbrot
3. Try different c values in the Julia set

### Intermediate
4. Implement z⁴ + c or z⁵ + c
5. Create custom orbit trap shapes
6. Combine two fractals using mix()

### Advanced
7. Implement Newton fractals (root finding)
8. Create an animated zoom sequence
9. Add anti-aliasing using multiple samples
10. Implement Lyapunov fractals

## Performance Notes

- Maximum iterations affects both quality and performance
- Start with ~100 iterations, increase for zoomed views
- Use `dot(z,z)` instead of `length(z)` for faster magnitude checks
- Smooth coloring adds minimal overhead but greatly improves quality

## Mathematical Background

### Escape Time Algorithm
```
For each pixel (x, y):
  1. Convert to complex number c = x + yi
  2. Set z = 0 (Mandelbrot) or z = c (Julia)
  3. Repeat:
     - z = z² + c
     - If |z| > 2, mark as escaped
     - Count iterations
  4. Color based on iteration count
```

### Complex Multiplication
Given `a = (ax, ay)` and `b = (bx, by)`:
```glsl
result.x = a.x * b.x - a.y * b.y;  // Real part
result.y = a.x * b.y + a.y * b.x;  // Imaginary part
```

### Why |z| > 2?
If |z| exceeds 2, it's mathematically proven that the sequence will diverge to infinity. This is the "escape radius."

## Interesting Coordinates to Explore

### Mandelbrot Set
- `(-0.75, 0.1)` - Seahorse valley
- `(-0.7, 0.27015)` - Spirals
- `(-0.1, 0.8)` - Tendrils
- `(0.285, 0.01)` - Self-similarity
- `(-0.4, 0.6)` - Mini Mandelbrot

### Julia Set Parameters
- `c = (-0.4, 0.6)` - Dendrite fractal
- `c = (0.285, 0.01)` - Douady's rabbit
- `c = (-0.70176, -0.3842)` - San Marco fractal
- `c = (-0.835, -0.2321)` - Siegel disk
- `c = (-0.7, 0.27015)` - Spiral pattern

## Further Resources

- [Inigo Quilez's Distance Fractals](https://iquilezles.org/articles/distancefractals/)
- [Mandelbrot Set - Wikipedia](https://en.wikipedia.org/wiki/Mandelbrot_set)
- [Julia Set - Wikipedia](https://en.wikipedia.org/wiki/Julia_set)
- [Shadertoy Fractal Examples](https://www.shadertoy.com/results?query=mandelbrot)
- [GPU Gems - Complex Fractals](https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-26-implementing-improved-perlin-noise)

## License

These examples are created in the style of The Book of Shaders by Patricio Gonzalez Vivo and Jen Lowe, and are meant to complement the existing chapters.

## Contributing

To improve these examples:
1. Test on different devices
2. Add more fractal types
3. Optimize performance
4. Create variations and combinations
5. Add more detailed comments

## Credits

Inspired by:
- The Book of Shaders (Patricio Gonzalez Vivo & Jen Lowe)
- Inigo Quilez's fractal work
- The ShaderToy community
- Classic fractal literature by Mandelbrot, Julia, and others
