/**
 * Gem tile shader
 * Adds shimmer and refraction effects to gem tiles
 */

precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uTime;
uniform float uGlow;
uniform vec3 uBaseColor;
uniform vec3 uLightColor;

// Simple noise function
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec4 texColor = texture2D(uSampler, vTextureCoord);

    // Base gem color with gradient
    vec3 color = mix(uBaseColor * 0.6, uBaseColor, vTextureCoord.y);

    // Top highlight (specular)
    float specular = pow(max(0.0, 1.0 - vTextureCoord.y * 2.0), 3.0);
    color += uLightColor * specular * 0.5;

    // Shimmer effect
    float shimmer = noise(vTextureCoord * 20.0 + uTime * 2.0) * 0.15;
    color += shimmer * uLightColor;

    // Edge glow
    vec2 center = vTextureCoord - 0.5;
    float edge = 1.0 - length(center) * 1.5;
    color += uGlow * edge * 0.1;

    // Glint animation
    float glintPhase = uTime * 3.0;
    float glintPos = fract(glintPhase);
    float glint = smoothstep(0.0, 0.1, glintPos) * smoothstep(0.2, 0.1, glintPos);
    glint *= step(vTextureCoord.x, glintPos + 0.1) * step(glintPos - 0.1, vTextureCoord.x);
    color += glint * 0.5;

    gl_FragColor = vec4(color, texColor.a);
}
