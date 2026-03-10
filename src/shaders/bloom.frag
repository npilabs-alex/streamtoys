/**
 * Bloom post-processing shader
 * Kawase blur-based bloom effect
 */

precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uBloomStrength;
uniform float uBloomRadius;
uniform vec2 uResolution;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);

    // Kawase blur approximation for bloom
    vec4 bloom = vec4(0.0);
    float total = 0.0;

    // Sample in a grid pattern
    for (float x = -4.0; x <= 4.0; x += 1.0) {
        for (float y = -4.0; y <= 4.0; y += 1.0) {
            vec2 offset = vec2(x, y) * uBloomRadius / uResolution;
            float weight = 1.0 - length(vec2(x, y)) / 5.656;
            if (weight > 0.0) {
                bloom += texture2D(uSampler, vTextureCoord + offset) * weight;
                total += weight;
            }
        }
    }
    bloom /= total;

    // Only bloom bright areas (threshold at 0.5)
    vec3 bright = max(bloom.rgb - 0.5, 0.0) * 2.0;

    // Add bloom to original
    gl_FragColor = color + vec4(bright * uBloomStrength, 0.0);
}
